import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/with-auth'
import { errorResponse } from '@/lib/api/errors'
import { contractTypeSchema } from '@/lib/validation/contract'
import { extractTextWithPageMarkers } from '@/lib/pdf/parse'
import { countTokens } from '@/lib/openai/count-tokens'
import { MAX_CONTRACT_TOKENS, MAX_FILE_SIZE_BYTES, MAX_PAGE_COUNT, MIN_WORD_COUNT } from '@/lib/constants/standard-terms'

export const runtime = 'nodejs'

export const POST = withAuth(async (req: NextRequest, { userId, supabase }) => {
  const form = await req.formData()
  const file = form.get('file')
  const contractTypeField = form.get('contract_type')

  const typeResult = contractTypeSchema.safeParse(contractTypeField)
  if (!(file instanceof File) || !typeResult.success) {
    return errorResponse('validation_error', 'A PDF file and a contract type (NDA or MSA) are required.', 400)
  }

  if (file.type !== 'application/pdf') {
    return errorResponse('validation_error', 'Only PDF files are supported.', 400)
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return errorResponse('file_too_large', 'PDF must be 10 MB or smaller.', 413)
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  let text: string
  let pageCount: number
  try {
    console.debug('api/contracts upload:', { fileName: file.name, fileType: file.type, fileSize: file.size })
    const extracted = await extractTextWithPageMarkers(buffer)
    text = extracted.text
    pageCount = extracted.pageCount
  } catch (error) {
    console.error('api/contracts parse failure:', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      error: error instanceof Error ? error.stack ?? error.message : error,
    })
    return errorResponse('unsupported_document', 'This file could not be read as a PDF.', 422)
  }

  if (pageCount > MAX_PAGE_COUNT) {
    return errorResponse('unsupported_document', 'Contract exceeds the 20-page limit.', 422)
  }

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length
  if (wordCount < MIN_WORD_COUNT) {
    return errorResponse('unsupported_document', 'Scanned PDFs are not supported yet.', 422)
  }

  const tokenCount = countTokens(text)
  if (tokenCount > MAX_CONTRACT_TOKENS) {
    return errorResponse('unsupported_document', 'Contract is too long for MVP (max ~15,000 tokens / 20 pages).', 422)
  }

  const { data: contract, error: insertError } = await supabase
    .from('contracts')
    .insert({
      user_id: userId,
      name: file.name,
      contract_type: typeResult.data,
      status: 'processing',
      contract_text: text,
      page_count: pageCount,
    })
    .select()
    .single()

  if (insertError || !contract) {
    return errorResponse('internal_error', 'Could not save the contract. Please try again.', 500)
  }

  // Non-blocking Storage upload — failure only disables the PDF viewer (falls back to TextViewer)
  const objectPath = `${userId}/${contract.id}/${file.name}`
  const { error: storageError } = await supabase.storage.from('contracts').upload(objectPath, buffer, {
    contentType: 'application/pdf',
    upsert: false,
  })
  if (!storageError) {
    await supabase.from('contracts').update({ file_path: objectPath }).eq('id', contract.id)
  }

  return NextResponse.json(
    {
      id: contract.id,
      name: contract.name,
      contract_type: contract.contract_type,
      status: contract.status,
      page_count: pageCount,
    },
    { status: 201 }
  )
})
