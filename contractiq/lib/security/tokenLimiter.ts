export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB
export const MAX_PAGE_COUNT = 200
export const MAX_MESSAGE_LENGTH = 5000

const defaultChatHistory = 100
export const MAX_CHAT_HISTORY = Number(process.env.MAX_CHAT_HISTORY ?? defaultChatHistory)

if (Number.isNaN(MAX_CHAT_HISTORY) || MAX_CHAT_HISTORY <= 0) {
  throw new Error('MAX_CHAT_HISTORY must be a positive integer')
}

export function assertFileSize(fileSize: number) {
  return fileSize <= MAX_FILE_SIZE_BYTES
}

export function assertPageCount(pageCount: number) {
  return pageCount <= MAX_PAGE_COUNT
}

export function assertMessageLength(message: string) {
  return message.length <= MAX_MESSAGE_LENGTH
}
