import type { DemoExample } from './model'

export const MAX_FILE_SIZE = 5 * 1024 * 1024
export const ACCEPTED_FILES = '.png,.jpg,.jpeg,.webp,.txt,.pdf'
export const FILE_HINT = 'PNG, JPG, WebP, TXT, PDF · maks. 5 MB'

export const validationExamples: DemoExample[] = [
  {
    id: 'file_too_large', title: 'Validasi · file terlalu besar', detail: 'Contoh file yang melewati batas ukuran demo.', specialist: 'file',
    input: { kind: 'file', name: 'tangkapan-layar-besar-demo.png', mime: 'image/png', size: MAX_FILE_SIZE + 1024 },
  },
  {
    id: 'unsupported_type', title: 'Validasi · format belum didukung', detail: 'Contoh nama file dengan ekstensi yang belum didukung.', specialist: 'file',
    input: { kind: 'file', name: 'contoh-format.demo', mime: 'application/octet-stream', size: 18 },
  },
]

export interface Draft {
  text: string
  file?: { name: string; size: number; payload?: File }
  exampleId?: string
}

export function exampleDraft(example: DemoExample): Draft {
  if (example.input.kind === 'text') return { text: example.input.value, exampleId: example.id }
  return { text: '', file: { name: example.input.name, size: example.input.size }, exampleId: example.id }
}

export function validateDraft(draft: Draft): string | undefined {
  if (draft.file) {
    if (draft.file.size > MAX_FILE_SIZE) return 'File melebihi batas 5 MB. Pilih file yang lebih kecil atau masukkan SHA-256.'
    const extension = draft.file.name.slice(draft.file.name.lastIndexOf('.')).toLowerCase()
    if (!ACCEPTED_FILES.split(',').includes(extension)) return 'Format file belum didukung. Pilih PNG, JPG, WebP, TXT, atau PDF.'
    if (draft.file.size === 0) return 'File kosong. Pilih file lain atau gunakan contoh simulasi.'
  }
  if (!draft.file && !draft.text.trim()) return 'Masukkan pesan, tautan, hash, atau pilih file.'
  return undefined
}

export async function matchExample(draft: Draft, examples: readonly DemoExample[]): Promise<DemoExample | undefined> {
  if (draft.exampleId) return examples.find(({ id }) => id === draft.exampleId)
  if (!draft.file) {
    const value = draft.text.trim()
    return examples.find(({ input }) => input.kind === 'text' && input.value === value)
  }

  const candidates = examples.filter(({ input }) => input.kind === 'file' && input.size === draft.file?.size && input.digest)
  if (!draft.file.payload || candidates.length === 0) return undefined

  // The digest only recognizes a bundled fixture. It does not assess arbitrary files.
  const buffer = await crypto.subtle.digest('SHA-256', await draft.file.payload.arrayBuffer())
  const digest = Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, '0')).join('')
  return candidates.find(({ input }) => input.kind === 'file' && input.digest === digest)
}
