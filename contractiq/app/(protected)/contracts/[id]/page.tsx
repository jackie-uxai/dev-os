'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AlertCircle, Trash2 } from 'lucide-react'
import { useContract } from '@/hooks/use-contract'
import { useDeleteContract } from '@/hooks/use-delete-contract'
import { DocumentViewer } from '@/components/results/DocumentViewer'
import { KeyTermsPanel } from '@/components/results/KeyTermsPanel'
import { ChatPanel } from '@/components/results/ChatPanel'
import { FeedbackWidget } from '@/components/results/FeedbackWidget'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { cn } from '@/lib/utils/cn'
import type { TargetPage } from '@/types/navigation'

type Tab = 'document' | 'terms' | 'chat'

function TabButton({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-md px-4 py-2 text-body font-medium transition-colors duration-150 ease-out',
        isActive ? 'bg-primary text-white' : 'bg-surface-elevated text-content-secondary hover:text-content-primary'
      )}
    >
      {label}
    </button>
  )
}

export default function ContractResultsPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { data, isLoading, isError } = useContract(params.id)
  const [targetPage, setTargetPage] = useState<TargetPage>(null)
  const [tokenCounter, setTokenCounter] = useState(0)
  const [mobileTab, setMobileTab] = useState<Tab>('document')
  const [rightPanelTab, setRightPanelTab] = useState<'terms' | 'chat'>('terms')
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const deleteContract = useDeleteContract()

  function navigateToPage(page: number) {
    const nextToken = tokenCounter + 1
    setTokenCounter(nextToken)
    setTargetPage({ page, token: nextToken })
    setMobileTab('document')
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size={32} />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-md px-8 py-24 text-center">
        <AlertCircle size={32} strokeWidth={1.5} className="mx-auto text-error" />
        <p className="mt-3 text-body text-content-secondary">Could not load this contract.</p>
        <Button variant="ghost" className="mt-4" onClick={() => router.push('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    )
  }

  const { contract, key_terms, signed_url } = data

  if (contract.status === 'processing') {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <Spinner size={32} />
        <p className="text-body text-content-secondary">Analysing your contract with AI…</p>
      </div>
    )
  }

  if (contract.status === 'error') {
    return (
      <div className="mx-auto max-w-md px-8 py-24 text-center">
        <AlertCircle size={32} strokeWidth={1.5} className="mx-auto text-error" />
        <p className="mt-3 text-body-lg text-content-primary">
          {contract.error_message ?? 'Something went wrong while analysing this contract.'}
        </p>
        <Button className="mt-4" onClick={() => router.push('/upload')}>
          Upload Again
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 px-8 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-h2 text-content-primary">{contract.name}</h1>
          <p className="mt-1 text-small text-content-muted">
            This is an AI-assisted review tool, not legal advice. Always verify critical terms with a qualified lawyer.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsDeleteOpen(true)}
          aria-label="Delete contract"
          className="flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-small text-content-muted hover:bg-error/10 hover:text-error"
        >
          <Trash2 size={16} strokeWidth={1.5} />
          Delete
        </button>
      </div>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete this contract?"
        description={`This will permanently delete "${contract.name}", its extracted terms, and its chat history. This cannot be undone.`}
        confirmLabel="Delete"
        isConfirming={deleteContract.isPending}
        onConfirm={() => deleteContract.mutate(contract.id, { onSuccess: () => router.push('/dashboard') })}
      />

      <div className="flex gap-2 md:hidden">
        <TabButton label="Document" isActive={mobileTab === 'document'} onClick={() => setMobileTab('document')} />
        <TabButton label="Key Terms" isActive={mobileTab === 'terms'} onClick={() => setMobileTab('terms')} />
        <TabButton label="Chat" isActive={mobileTab === 'chat'} onClick={() => setMobileTab('chat')} />
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_400px]">
        <div className={mobileTab === 'document' ? 'block' : 'hidden md:block'}>
          <DocumentViewer signedUrl={signed_url} contractText={contract.contract_text ?? ''} targetPage={targetPage} />
        </div>

        <div className={mobileTab === 'terms' || mobileTab === 'chat' ? 'flex flex-col gap-3' : 'hidden md:flex md:flex-col md:gap-3'}>
          <div className="hidden gap-2 md:flex">
            <TabButton label="Key Terms" isActive={rightPanelTab === 'terms'} onClick={() => setRightPanelTab('terms')} />
            <TabButton label="Chat" isActive={rightPanelTab === 'chat'} onClick={() => setRightPanelTab('chat')} />
          </div>

          {/* Mobile visibility depends only on mobileTab; desktop visibility depends only on rightPanelTab — kept independent so resizing never desyncs the two. */}
          <div className={cn(mobileTab === 'terms' ? 'block' : 'hidden', rightPanelTab === 'terms' ? 'md:block' : 'md:hidden')}>
            <KeyTermsPanel contractId={contract.id} keyTerms={key_terms} onNavigateToPage={navigateToPage} />
            <div className="mt-4">
              <FeedbackWidget contractId={contract.id} />
            </div>
          </div>
          <div
            className={cn(
              'md:h-[80vh]',
              mobileTab === 'chat' ? 'block' : 'hidden',
              rightPanelTab === 'chat' ? 'md:block' : 'md:hidden'
            )}
          >
            <ChatPanel contractId={contract.id} onNavigateToPage={navigateToPage} />
          </div>
        </div>
      </div>
    </div>
  )
}
