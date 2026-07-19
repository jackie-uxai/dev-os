import { z } from 'zod'
import {
  MAX_CUSTOM_TERMS,
  MAX_CUSTOM_TERM_LENGTH,
  MAX_CHAT_MESSAGE_LENGTH,
} from '@/lib/constants/standard-terms'

export const contractTypeSchema = z.enum(['NDA', 'MSA'])

export const processContractSchema = z.object({
  custom_terms: z.array(z.string().min(1).max(MAX_CUSTOM_TERM_LENGTH)).max(MAX_CUSTOM_TERMS).default([]),
})

export const patchKeyTermSchema = z.object({
  value: z.string().min(1, 'Value cannot be empty'),
})

export const chatMessageSchema = z.object({
  message: z.string().min(1).max(MAX_CHAT_MESSAGE_LENGTH),
})

export const feedbackSchema = z.object({
  rating: z.enum(['up', 'down']),
  comment: z.string().max(1000).optional(),
})

export const dashboardSortSchema = z.object({
  sort: z.enum(['date', 'name', 'type']).default('date'),
  order: z.enum(['asc', 'desc']).default('desc'),
})
