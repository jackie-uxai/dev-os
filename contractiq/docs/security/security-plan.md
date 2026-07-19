# ContractIQ Security Plan

## Goals

- Protect authenticated contract upload and chat flows
- Enforce Supabase RLS for user-owned data
- Prevent prompt injection and malformed LLM input
- Limit resource abuse for uploads, chat, and session history
- Keep secrets out of client bundles

## Security Controls

### Authentication and Authorization

- Use Supabase auth in server-side route handlers
- Reject unauthenticated requests with `401`
- Enforce ownership checks before accessing `contracts`, `chat_sessions`, and `chat_messages`
- Use server-only Supabase service role for admin operations only when needed

### Input Validation

- Validate uploaded PDF size and page count before processing
- Validate upload metadata and chat payloads with Zod at the API boundary
- Validate message length, role, and conversation IDs before saving

### Prompt Injection Protection

- Detect common prompt injection patterns in user chat messages
- Reject messages that attempt to override instructions or reveal environment variables
- Sanitize all content before forwarding to OpenAI

### Rate Limiting and Abuse Control

- Apply rate limiting on chat completions and contract uploads
- Use fixed limits for message length and session history size
- Deny requests that exceed configured maximums

### Secrets Management

- Keep Supabase keys and OpenAI keys server-only in environment variables
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client
- Use `NEXT_PUBLIC_SUPABASE_URL` only for client initialization

### RLS and Database Security

- Enforce row-level security on `contracts`, `chat_sessions`, and `chat_messages`
- Ensure policies allow access only to the authenticated owner's rows
- Deny all direct database access on protected tables from unauthenticated users

### Operational Security

- Log errors without leaking secret values
- Use stable, typed database access through the app's `Database` types

## Files Added

- `lib/security/authGuard.ts`
- `lib/security/tokenLimiter.ts`
- `lib/security/promptInjectionGuard.ts`
- `lib/security/chatSecurity.ts`
- `lib/supabase/admin.ts`
- `supabase/rls-policies.sql`

## Next Steps

1. Wire the new auth guard into `app/api/*` route handlers
2. Add validation and prompt injection checks in chat routes
3. Verify the Supabase RLS policies against actual schema
4. Run TypeScript validation and targeted route tests
