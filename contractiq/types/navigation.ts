/**
 * `token` increments on every navigation request so clicking the same page
 * number twice in a row still re-triggers the viewer's scroll/highlight
 * effect (a bare `page: number` prop wouldn't change and effects wouldn't
 * re-run). See document-viewer.md.
 */
export type TargetPage = { page: number; token: number } | null
