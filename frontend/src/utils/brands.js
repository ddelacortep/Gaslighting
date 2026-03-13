export const BRAND_COLORS = {
  REPSOL: '#ff6900',
  BP: '#009900',
  CEPSA: '#e30613',
  SHELL: '#dd1d21',
  GALP: '#f7a600',
  CAMPSA: '#d00000',
  PETRONOR: '#0057a8',
  DISA: '#ff4500',
  DEFAULT: '#3b82f6',
}

/**
 * Normalize a brand name (Rótulo) to one of the known BRAND_COLORS keys.
 * Returns 'DEFAULT' if no match found.
 */
export function normalizeBrand(rotulo) {
  if (!rotulo) return 'DEFAULT'
  const upper = rotulo.toUpperCase()
  for (const key of Object.keys(BRAND_COLORS)) {
    if (key === 'DEFAULT') continue
    if (upper.includes(key)) return key
  }
  return 'DEFAULT'
}

/**
 * Get the hex color for a brand name.
 */
export function brandColor(brand) {
  const normalized = normalizeBrand(brand)
  return BRAND_COLORS[normalized] ?? BRAND_COLORS.DEFAULT
}

/**
 * Get the first letter of the brand name, used in the avatar circle.
 */
export function brandInitial(brand) {
  const normalized = normalizeBrand(brand)
  if (normalized === 'DEFAULT') return brand?.[0]?.toUpperCase() ?? '?'
  return normalized[0]
}
