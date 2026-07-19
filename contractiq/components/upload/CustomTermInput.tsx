'use client'

import { useState, type KeyboardEvent } from 'react'
import { Plus } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { MAX_CUSTOM_TERM_LENGTH, MAX_CUSTOM_TERMS, STANDARD_TERMS } from '@/lib/constants/standard-terms'
import type { ContractType } from '@/types/database'

export function CustomTermInput({
  contractType,
  customTerms,
  onAdd,
}: {
  contractType: ContractType
  customTerms: string[]
  onAdd: (term: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  const atLimit = customTerms.length >= MAX_CUSTOM_TERMS

  function isDuplicate(term: string) {
    const normalized = term.toLowerCase()
    const standard = STANDARD_TERMS[contractType].map((t) => t.toLowerCase())
    const custom = customTerms.map((t) => t.toLowerCase())
    return standard.includes(normalized) || custom.includes(normalized)
  }

  function submit() {
    const trimmed = value.trim()
    if (!trimmed) return
    if (atLimit) return
    if (isDuplicate(trimmed)) {
      setError('This term is already included')
      return
    }
    onAdd(trimmed)
    setValue('')
    setError(null)
    setIsOpen(false)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      submit()
    }
  }

  if (atLimit) {
    return <p className="text-small text-content-muted">Maximum 5 custom terms reached</p>
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 text-body font-medium text-primary hover:text-primary-hover"
      >
        <Plus size={16} strokeWidth={1.5} />
        Add Key Term
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-2">
        <Input
          autoFocus
          maxLength={MAX_CUSTOM_TERM_LENGTH}
          placeholder="e.g. Non-compete radius"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setError(null)
          }}
          onKeyDown={handleKeyDown}
          error={!!error}
        />
        <button
          type="button"
          onClick={submit}
          className="shrink-0 rounded-lg bg-primary px-4 text-body-lg font-medium text-white hover:bg-primary-hover"
        >
          Add
        </button>
      </div>
      {error && <p className="text-small text-error">{error}</p>}
    </div>
  )
}
