/**
 * Hand-written to match docs/specs/supabase-schema.sql exactly. Once the
 * schema is applied to the live project, this can be regenerated with
 * `supabase gen types typescript --project-id <ref> > types/database.ts`
 * — regenerating should produce an equivalent shape to what's below.
 */

export type ContractType = 'NDA' | 'MSA'
export type ContractStatus = 'processing' | 'ready' | 'error'
export type ChatRole = 'user' | 'assistant'
export type FeedbackRating = 'up' | 'down'

export interface Database {
  public: {
    Tables: {
      contracts: {
        Row: {
          id: string
          user_id: string
          name: string
          contract_type: ContractType
          status: ContractStatus
          contract_text: string | null
          page_count: number | null
          file_path: string | null
          error_message: string | null
          last_accessed_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          contract_type: ContractType
          status?: ContractStatus
          contract_text?: string | null
          page_count?: number | null
          file_path?: string | null
          error_message?: string | null
          last_accessed_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          contract_type?: ContractType
          status?: ContractStatus
          contract_text?: string | null
          page_count?: number | null
          file_path?: string | null
          error_message?: string | null
          last_accessed_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      key_terms: {
        Row: {
          id: string
          contract_id: string
          user_id: string
          term_name: string
          value: string | null
          original_value: string | null
          page_number: number | null
          confidence_score: number | null
          source_sentence: string | null
          is_manual: boolean
          is_edited: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          contract_id: string
          user_id: string
          term_name: string
          value?: string | null
          original_value?: string | null
          page_number?: number | null
          confidence_score?: number | null
          source_sentence?: string | null
          is_manual?: boolean
          is_edited?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          contract_id?: string
          user_id?: string
          term_name?: string
          value?: string | null
          original_value?: string | null
          page_number?: number | null
          confidence_score?: number | null
          source_sentence?: string | null
          is_manual?: boolean
          is_edited?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'key_terms_contract_id_fkey'
            columns: ['contract_id']
            isOneToOne: false
            referencedRelation: 'contracts'
            referencedColumns: ['id']
          },
        ]
      }
      chat_sessions: {
        Row: {
          id: string
          contract_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          contract_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          contract_id?: string
          user_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'chat_sessions_contract_id_fkey'
            columns: ['contract_id']
            isOneToOne: false
            referencedRelation: 'contracts'
            referencedColumns: ['id']
          },
        ]
      }
      chat_messages: {
        Row: {
          id: string
          session_id: string
          role: ChatRole
          content: string
          page_citation: number | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          role: ChatRole
          content: string
          page_citation?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          role?: ChatRole
          content?: string
          page_citation?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'chat_messages_session_id_fkey'
            columns: ['session_id']
            isOneToOne: false
            referencedRelation: 'chat_sessions'
            referencedColumns: ['id']
          },
        ]
      }
      user_feedback: {
        Row: {
          id: string
          contract_id: string
          user_id: string
          rating: FeedbackRating
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          contract_id: string
          user_id: string
          rating: FeedbackRating
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          contract_id?: string
          user_id?: string
          rating?: FeedbackRating
          comment?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_feedback_contract_id_fkey'
            columns: ['contract_id']
            isOneToOne: false
            referencedRelation: 'contracts'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      term_corrections: {
        Row: {
          id: string
          contract_id: string
          user_id: string
          term_name: string
          original_value: string | null
          value: string | null
          extracted_at: string
          corrected_at: string
        }
        Relationships: []
      }
    }
    Functions: Record<string, never>
    Enums: {
      contract_type_enum: ContractType
      contract_status_enum: ContractStatus
      chat_role_enum: ChatRole
      feedback_rating_enum: FeedbackRating
    }
  }
}

export type Contract = Database['public']['Tables']['contracts']['Row']
export type KeyTerm = Database['public']['Tables']['key_terms']['Row']
export type ChatSession = Database['public']['Tables']['chat_sessions']['Row']
export type ChatMessage = Database['public']['Tables']['chat_messages']['Row']
export type UserFeedback = Database['public']['Tables']['user_feedback']['Row']
