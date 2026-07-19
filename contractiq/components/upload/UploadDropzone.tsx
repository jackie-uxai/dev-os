'use client'

import { useRef, useState, type DragEvent } from 'react'
import { UploadCloud, FileText, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export function UploadDropzone({
  file,
  onFileSelected,
  onFileCleared,
  error,
}: {
  file: File | null
  onFileSelected: (file: File) => void
  onFileCleared: () => void
  error: string | null
}) {
  const [isDragActive, setIsDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function validateAndSelect(candidate: File) {
    if (candidate.type !== 'application/pdf') {
      onFileSelected(candidate) // let the parent surface the validation error consistently
      return
    }
    onFileSelected(candidate)
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragActive(false)
    const dropped = e.dataTransfer.files?.[0]
    if (dropped) validateAndSelect(dropped)
  }

  if (file) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-border-strong bg-surface-bg px-4 py-3">
        <div className="flex items-center gap-3">
          <FileText size={20} strokeWidth={1.5} className="text-primary" />
          <div>
            <p className="text-body-lg text-content-primary">{file.name}</p>
            <p className="text-small text-content-muted">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onFileCleared}
          aria-label="Remove file"
          className="rounded-md p-1 text-content-muted hover:bg-surface-subtle hover:text-content-primary"
        >
          <X size={18} strokeWidth={1.5} />
        </button>
      </div>
    )
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragActive(true)
        }}
        onDragLeave={() => setIsDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors duration-150 ease-out',
          isDragActive ? 'border-primary bg-primary/5' : 'border-border-strong bg-surface-bg hover:bg-surface-subtle',
          error && 'border-error'
        )}
      >
        <UploadCloud size={28} strokeWidth={1.5} className="text-content-muted" />
        <p className="text-body-lg text-content-primary">Drag and drop your PDF here, or click to browse</p>
        <p className="text-small text-content-muted">PDF only, up to 10 MB, 20 pages</p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            const selected = e.target.files?.[0]
            if (selected) validateAndSelect(selected)
          }}
        />
      </div>
      {error && <p className="mt-2 text-small text-error">{error}</p>}
    </div>
  )
}
