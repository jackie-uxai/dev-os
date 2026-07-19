'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { UploadDropzone } from '@/components/upload/UploadDropzone'
import { CustomTermInput } from '@/components/upload/CustomTermInput'
import { TermPreviewList } from '@/components/upload/TermPreviewList'
import { useUploadContract } from '@/hooks/use-upload-contract'
import { useProcessContract } from '@/hooks/use-process-contract'
import { ApiError } from '@/lib/api/fetch-json'
import type { ContractType } from '@/types/database'

type Step = 'idle' | 'extracting' | 'analyzing' | 'error'

const STEP_LABEL: Record<Exclude<Step, 'idle' | 'error'>, string> = {
  extracting: 'Extracting text…',
  analyzing: 'Analysing with AI…',
}

export default function UploadPage() {
  const router = useRouter()
  const [contractType, setContractType] = useState<ContractType>('NDA')
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [customTerms, setCustomTerms] = useState<string[]>([])
  const [step, setStep] = useState<Step>('idle')
  const [submitError, setSubmitError] = useState<string | null>(null)

  const uploadContract = useUploadContract()
  const processContract = useProcessContract()

  function handleFileSelected(selected: File) {
    if (selected.type !== 'application/pdf') {
      setFileError('Only PDF files are supported.')
      setFile(null)
      return
    }
    if (selected.size > 10 * 1024 * 1024) {
      setFileError('PDF must be 10 MB or smaller.')
      setFile(null)
      return
    }
    setFileError(null)
    setFile(selected)
  }

  async function handleProcess() {
    if (!file) return
    setSubmitError(null)
    setStep('extracting')

    try {
      const uploaded = await uploadContract.mutateAsync({ file, contractType })
      setStep('analyzing')
      await processContract.mutateAsync({ contractId: uploaded.id, customTerms })
      router.push(`/contracts/${uploaded.id}`)
    } catch (err) {
      setStep('error')
      setSubmitError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
    }
  }

  const isSubmitting = step === 'extracting' || step === 'analyzing'

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-8 py-10">
      <h1 className="text-h2 text-content-primary">Review a Contract</h1>

      <Card className="flex flex-col gap-6">
        <div>
          <label htmlFor="contract-type" className="mb-1 block text-body font-medium text-content-primary">
            Contract type
          </label>
          <Select
            id="contract-type"
            value={contractType}
            disabled={isSubmitting}
            onChange={(e) => setContractType(e.target.value as ContractType)}
          >
            <option value="NDA">NDA — Non-Disclosure Agreement</option>
            <option value="MSA">MSA — Master Service Agreement</option>
          </Select>
        </div>

        <div>
          <p className="mb-1 block text-body font-medium text-content-primary">Contract PDF</p>
          <UploadDropzone
            file={file}
            onFileSelected={handleFileSelected}
            onFileCleared={() => {
              setFile(null)
              setFileError(null)
            }}
            error={fileError}
          />
        </div>

        {file && !fileError && (
          <div>
            <p className="mb-2 text-body font-medium text-content-primary">
              ContractIQ will look for these key terms
            </p>
            <TermPreviewList
              contractType={contractType}
              customTerms={customTerms}
              onRemoveCustomTerm={(term) => setCustomTerms((prev) => prev.filter((t) => t !== term))}
            />
            <div className="mt-3">
              <CustomTermInput contractType={contractType} customTerms={customTerms} onAdd={(term) => setCustomTerms((prev) => [...prev, term])} />
            </div>
          </div>
        )}

        {submitError && (
          <p className="rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-body text-error">{submitError}</p>
        )}

        <Button onClick={handleProcess} disabled={!file || !!fileError} isLoading={isSubmitting} className="w-full">
          {isSubmitting ? STEP_LABEL[step as 'extracting' | 'analyzing'] : 'Process Contract'}
        </Button>
      </Card>
    </div>
  )
}
