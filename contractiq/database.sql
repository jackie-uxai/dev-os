-- ContractIQ database schema for Supabase
-- Paste this into the Supabase SQL Editor and run it.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- =========================
-- Core tables
-- =========================

CREATE TABLE IF NOT EXISTS public.contracts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    contract_type text NOT NULL CHECK (contract_type IN ('NDA', 'MSA')),
    status text NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'error')),
    contract_text text,
    page_count integer,
    file_path text,
    error_message text,
    last_accessed_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.key_terms (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id uuid NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    term_name text NOT NULL,
    value text,
    original_value text,
    page_number integer,
    confidence_score numeric(5,2),
    source_sentence text,
    is_manual boolean NOT NULL DEFAULT false,
    is_edited boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id uuid NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id uuid NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    role text NOT NULL CHECK (role IN ('user', 'assistant')),
    content text NOT NULL,
    page_citation integer,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_feedback (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id uuid NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating text NOT NULL CHECK (rating IN ('up', 'down')),
    comment text,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- =========================
-- Indexes
-- =========================

CREATE INDEX IF NOT EXISTS idx_contracts_user_created
    ON public.contracts (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contracts_user_status
    ON public.contracts (user_id, status);

CREATE INDEX IF NOT EXISTS idx_key_terms_contract_id
    ON public.key_terms (contract_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_created
    ON public.chat_messages (session_id, created_at ASC);

-- =========================
-- Row Level Security
-- =========================

ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.key_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    EXECUTE 'DROP POLICY IF EXISTS contracts_select_own ON public.contracts';
    EXECUTE 'DROP POLICY IF EXISTS contracts_insert_own ON public.contracts';
    EXECUTE 'DROP POLICY IF EXISTS contracts_update_own ON public.contracts';
    EXECUTE 'DROP POLICY IF EXISTS contracts_delete_own ON public.contracts';
    EXECUTE 'DROP POLICY IF EXISTS key_terms_select_own ON public.key_terms';
    EXECUTE 'DROP POLICY IF EXISTS key_terms_insert_own ON public.key_terms';
    EXECUTE 'DROP POLICY IF EXISTS key_terms_update_own ON public.key_terms';
    EXECUTE 'DROP POLICY IF EXISTS key_terms_delete_own ON public.key_terms';
    EXECUTE 'DROP POLICY IF EXISTS chat_sessions_select_own ON public.chat_sessions';
    EXECUTE 'DROP POLICY IF EXISTS chat_sessions_insert_own ON public.chat_sessions';
    EXECUTE 'DROP POLICY IF EXISTS chat_sessions_delete_own ON public.chat_sessions';
    EXECUTE 'DROP POLICY IF EXISTS chat_messages_select_own ON public.chat_messages';
    EXECUTE 'DROP POLICY IF EXISTS chat_messages_insert_own ON public.chat_messages';
    EXECUTE 'DROP POLICY IF EXISTS chat_messages_delete_own ON public.chat_messages';
    EXECUTE 'DROP POLICY IF EXISTS feedback_select_own ON public.user_feedback';
    EXECUTE 'DROP POLICY IF EXISTS feedback_insert_own ON public.user_feedback';
    EXECUTE 'DROP POLICY IF EXISTS feedback_delete_own ON public.user_feedback';
EXCEPTION WHEN OTHERS THEN
    NULL;
END;
$$;

CREATE POLICY contracts_select_own
    ON public.contracts
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY contracts_insert_own
    ON public.contracts
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY contracts_update_own
    ON public.contracts
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY contracts_delete_own
    ON public.contracts
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY key_terms_select_own
    ON public.key_terms
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY key_terms_insert_own
    ON public.key_terms
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY key_terms_update_own
    ON public.key_terms
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY key_terms_delete_own
    ON public.key_terms
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY chat_sessions_select_own
    ON public.chat_sessions
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY chat_sessions_insert_own
    ON public.chat_sessions
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY chat_sessions_delete_own
    ON public.chat_sessions
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY chat_messages_select_own
    ON public.chat_messages
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.chat_sessions cs
            WHERE cs.id = chat_messages.session_id
              AND cs.user_id = auth.uid()
        )
    );

CREATE POLICY chat_messages_insert_own
    ON public.chat_messages
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.chat_sessions cs
            WHERE cs.id = chat_messages.session_id
              AND cs.user_id = auth.uid()
        )
    );

CREATE POLICY chat_messages_delete_own
    ON public.chat_messages
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.chat_sessions cs
            WHERE cs.id = chat_messages.session_id
              AND cs.user_id = auth.uid()
        )
    );

CREATE POLICY feedback_select_own
    ON public.user_feedback
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY feedback_insert_own
    ON public.user_feedback
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY feedback_delete_own
    ON public.user_feedback
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- =========================
-- View for corrections reporting
-- =========================

CREATE OR REPLACE VIEW public.term_corrections AS
SELECT
    term_name,
    original_value,
    value,
    contract_id,
    created_at
FROM public.key_terms
WHERE is_edited = true;

-- =========================
-- Storage bucket setup
-- =========================

INSERT INTO storage.buckets (id, name, public)
VALUES ('contracts', 'contracts', false)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
    EXECUTE 'DROP POLICY IF EXISTS contracts_bucket_insert_own ON storage.objects';
    EXECUTE 'DROP POLICY IF EXISTS contracts_bucket_select_own ON storage.objects';
    EXECUTE 'DROP POLICY IF EXISTS contracts_bucket_delete_own ON storage.objects';
EXCEPTION WHEN OTHERS THEN
    NULL;
END;
$$;

CREATE POLICY contracts_bucket_insert_own
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'contracts'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY contracts_bucket_select_own
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'contracts'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY contracts_bucket_delete_own
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'contracts'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- =========================
-- Retention / cleanup helpers
-- =========================

CREATE OR REPLACE FUNCTION public.delete_expired_contracts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    contract_row record;
BEGIN
    FOR contract_row IN
        SELECT id, file_path
        FROM public.contracts
        WHERE last_accessed_at < now() - interval '90 days'
    LOOP
        IF contract_row.file_path IS NOT NULL THEN
            DELETE FROM storage.objects
            WHERE bucket_id = 'contracts'
              AND name = contract_row.file_path;
        END IF;
    END LOOP;

    DELETE FROM public.contracts
    WHERE last_accessed_at < now() - interval '90 days';
END;
$$;

DO $$
BEGIN
    PERFORM cron.unschedule('daily-contract-retention');
EXCEPTION WHEN undefined_object THEN
    -- No existing scheduled job, continue silently
    NULL;
END;
$$;

SELECT cron.schedule(
    'daily-contract-retention',
    '0 2 * * *',
    $$SELECT public.delete_expired_contracts();$$
);

COMMIT;
