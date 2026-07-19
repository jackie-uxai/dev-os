import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/with-auth'
import { errorResponse } from '@/lib/api/errors'

export const GET = withAuth(async (req: NextRequest, { userId, supabase, params }) => {
  const { data: contract } = await supabase
    .from('contracts')
    .select('*, key_terms(*)')
    .eq('id', params.id)
    .eq('user_id', userId)
    .single()

  if (!contract) return errorResponse('not_found', 'Contract not found.', 404)

  await supabase.from('contracts').update({ last_accessed_at: new Date().toISOString() }).eq('id', contract.id)

  let signedUrl: string | null = null
  if (contract.file_path) {
    const { data: signed } = await supabase.storage.from('contracts').createSignedUrl(contract.file_path, 3600)
    signedUrl = signed?.signedUrl ?? null
  }

  const { key_terms, ...contractFields } = contract

  return NextResponse.json({ contract: contractFields, key_terms, signed_url: signedUrl })
})

export const DELETE = withAuth(async (req: NextRequest, { userId, supabase, params }) => {
  const { data: contract } = await supabase
    .from('contracts')
    .select('id, file_path')
    .eq('id', params.id)
    .eq('user_id', userId)
    .single()
  if (!contract) return errorResponse('not_found', 'Contract not found.', 404)

  if (contract.file_path) {
    await supabase.storage.from('contracts').remove([contract.file_path])
  }

  await supabase.from('contracts').delete().eq('id', contract.id)

  return new NextResponse(null, { status: 204 })
})
