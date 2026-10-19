import type { CodeDiagnostic, CodeLanguage } from './types'
import { languageLabels } from './languages'

export type EditorLabels = {
  find: string
  findInEditor: string
  findInDiff: string
  replace: string
  replaceWith: string
  replaceAll: string
  previousMatch: string
  nextMatch: string
  closeFind: string
  options: string
  wordWrap: string
  lineNumbers: string
  statusBar: string
  noProblems: string
  results: (current: number, total: number, searching: boolean) => string
  position: (line: number, column: number) => string
  spaces: (count: number) => string
  language: (language: CodeLanguage) => string
  diagnostic: (problem: CodeDiagnostic) => string
  invalid: (problem: CodeDiagnostic) => string
  help: (language: CodeLanguage, disabled: boolean, readOnly: boolean) => string
}

export const DEFAULT_EDITOR_LABELS: EditorLabels = {
  find: 'Find',
  findInEditor: 'Find in editor',
  findInDiff: 'Find in diff',
  replace: 'Replace',
  replaceWith: 'Replace with',
  replaceAll: 'All',
  previousMatch: 'Previous match',
  nextMatch: 'Next match',
  closeFind: 'Close find',
  options: 'Editor options',
  wordWrap: 'Word wrap',
  lineNumbers: 'Line numbers',
  statusBar: 'Status bar',
  noProblems: 'No problems',
  results: (current, total, searching) =>
    searching ? (total ? `${current + 1} of ${total}` : 'No results') : '0 results',
  position: (line, column) => `Ln ${line}, Col ${column}`,
  spaces: (count) => `Spaces: ${count}`,
  language: (language) => languageLabels[language],
  diagnostic: (p) => `Line ${p.line}, column ${p.column}: ${p.message}`,
  invalid: (p) => `Code is invalid. Line ${p.line}, column ${p.column}: ${p.message}`,
  help: (language, disabled, readOnly) =>
    disabled
      ? `${languageLabels[language]}, disabled.`
      : readOnly
        ? `${languageLabels[language]}, read only.`
        : `${languageLabels[language]}. Tab indents. Press Escape, then Tab, to leave the editor.`,
}
