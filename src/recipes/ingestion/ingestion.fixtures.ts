// The sources the Ingestion recipe lists: the rows of the Finals 2.0
// Ingestion board, with their sync dates moved up to today.
import { asOfToday } from '../../fixtures/as-of-today'

export type SourceKind = 'upload' | 'api' | 'drive' | 'web'
export type SourceStatus = 'indexed' | 'syncing' | 'failing' | 'queued'

export type Source = {
  id: string
  name: string
  kind: SourceKind
  status: SourceStatus
  /** Documents indexed from it. */
  documents: number
  owner: string
  /** `yyyy-mm-dd` of the last sync. */
  synced: string
}

export const KIND_LABEL: Record<SourceKind, string> = {
  upload: 'Upload',
  api: 'API',
  drive: 'Shared drive',
  web: 'Website',
}

export const STATUS_LABEL: Record<SourceStatus, string> = {
  indexed: 'Indexed',
  syncing: 'Syncing',
  failing: 'Failing',
  queued: 'Queued',
}

export const KINDS: SourceKind[] = ['upload', 'api', 'drive', 'web']
export const STATUSES: SourceStatus[] = ['indexed', 'syncing', 'failing', 'queued']

/** Documents added in the last seven days. The fixture has no history, so it is a figure. */
export const ADDED_THIS_WEEK = 42

const rows: [string, SourceKind, SourceStatus, number, string, string][] = [
  ['Pricing sheets API', 'api', 'failing', 86, 'Dana Whitfield', '2026-11-23'],
  ['Policy manual v7', 'upload', 'indexed', 1, 'John Ozzo', '2026-11-20'],
  ['Vendor contracts', 'drive', 'syncing', 412, 'Priya Raman', '2026-11-24'],
  ['Support playbook', 'drive', 'indexed', 64, 'Marcus Webb', '2026-11-24'],
  ['Help centre articles', 'web', 'indexed', 238, 'Helen Park', '2026-11-22'],
  ['Expense policy 2026', 'upload', 'indexed', 1, 'John Ozzo', '2026-11-18'],
  ['Product catalogue feed', 'api', 'syncing', 157, 'Tomas Alvarez', '2026-11-24'],
  ['Security standards', 'drive', 'indexed', 39, 'Nia Coleman', '2026-11-21'],
  ['Release notes', 'web', 'queued', 0, 'Owen Fitzgerald', '2026-11-24'],
  ['Onboarding guide', 'upload', 'indexed', 3, 'Ashley Taylor', '2026-11-12'],
  ['Incident runbooks', 'drive', 'indexed', 121, 'Daniel Okafor', '2026-11-23'],
  ['Data retention rules', 'upload', 'indexed', 2, 'Nia Coleman', '2026-11-07'],
  ['Procurement FAQ', 'web', 'indexed', 46, 'Priya Raman', '2026-11-19'],
  ['Travel policy', 'upload', 'indexed', 1, 'Ashley Taylor', '2026-10-30'],
]

export const SOURCES: Source[] = rows.map(([name, kind, status, documents, owner, synced], i) => ({
  id: `src_${String(i + 1).padStart(2, '0')}`,
  name,
  kind,
  status,
  documents,
  owner,
  synced: asOfToday(synced),
}))
