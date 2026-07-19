import { useMutation } from '@tanstack/react-query'
import { fetchJson } from '@/lib/api/fetch-json'
import type { UploadContractResponse } from '@/types/api'
import type { ContractType } from '@/types/database'

export function useUploadContract() {
  return useMutation({
    mutationFn: async ({ file, contractType }: { file: File; contractType: ContractType }) => {
      const formData = new FormData()
      formData.set('file', file)
      formData.set('contract_type', contractType)
      return fetchJson<UploadContractResponse>('/api/contracts', { method: 'POST', body: formData })
    },
  })
}
