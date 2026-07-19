import { NextResponse } from 'next/server'

export type ApiErrorCode =
  | 'unauthenticated'
  | 'not_found'
  | 'validation_error'
  | 'file_too_large'
  | 'unsupported_document'
  | 'rate_limited'
  | 'upstream_error'
  | 'internal_error'

export function errorResponse(code: ApiErrorCode, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status })
}
