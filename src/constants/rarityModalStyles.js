/**
 * Regla de colores para modales de cartas (Pokemon TCG):
 * - Holo Rare / Reverse Holo / Double Rare / Rare → Plateado
 * - Ultra Rare → Dorado suave
 * - Illustration Rare (IR) → Azul/Morado
 * - Special Illustration Rare (SIR) → Morado intenso
 * - Hyper Rare / Secret Rare → Dorado (fuerte)
 * - Rainbow Rare → Arcoíris
 * - Radiant Rare → Rojo brillante
 * - Amazing Rare → Multicolor
 */
export const RARITY_MODAL_STYLES = {
  default: {
    '--modal-border': 'rgba(255, 255, 255, 0.2)',
    '--modal-glow': '0 0 0 2px rgba(255,255,255,0.1), 0 24px 48px rgba(0,0,0,0.45)',
    '--modal-bg': '#1a1d24',
    '--modal-info-bg': 'rgba(0, 0, 0, 0.82)',
    '--modal-info-border': 'rgba(255, 255, 255, 0.15)',
    '--modal-info-text': '#e2e8f0',
    '--modal-info-text-muted': 'rgba(226, 232, 240, 0.85)'
  },
  common: {
    '--modal-border': 'rgba(148, 163, 184, 0.85)',
    '--modal-glow': '0 0 0 3px rgba(148,163,184,0.45), 0 24px 48px rgba(0,0,0,0.4)',
    '--modal-bg': '#1e2128',
    '--modal-info-bg': 'rgba(30, 41, 59, 0.92)',
    '--modal-info-border': 'rgba(148, 163, 184, 0.35)',
    '--modal-info-text': '#cbd5e1',
    '--modal-info-text-muted': 'rgba(203, 213, 225, 0.9)'
  },
  uncommon: {
    '--modal-border': 'rgba(34, 197, 94, 0.9)',
    '--modal-glow': '0 0 0 3px rgba(34,197,94,0.5), 0 24px 48px rgba(0,0,0,0.4)',
    '--modal-bg': '#0f1612',
    '--modal-info-bg': 'rgba(6, 50, 24, 0.92)',
    '--modal-info-border': 'rgba(34, 197, 94, 0.35)',
    '--modal-info-text': '#86efac',
    '--modal-info-text-muted': 'rgba(134, 239, 172, 0.9)'
  },
  rare: {
    '--modal-border': 'rgba(220, 220, 230, 0.8)',
    '--modal-glow': '0 0 0 3px rgba(200,200,210,0.45), 0 24px 48px rgba(0,0,0,0.4)',
    '--modal-bg': '#18181c',
    '--modal-info-bg': 'rgba(30, 30, 42, 0.92)',
    '--modal-info-border': 'rgba(220, 220, 230, 0.3)',
    '--modal-info-text': '#e2e8f0',
    '--modal-info-text-muted': 'rgba(226, 232, 240, 0.88)'
  },
  'holo-rare-v': {
    '--modal-border': 'rgba(251, 191, 36, 0.95)',
    '--modal-glow': '0 0 0 3px rgba(251,191,36,0.6), 0 0 24px rgba(251,191,36,0.25), 0 24px 48px rgba(0,0,0,0.4)',
    '--modal-bg': '#1a1510',
    '--modal-info-bg': 'rgba(40, 28, 8, 0.92)',
    '--modal-info-border': 'rgba(251, 191, 36, 0.35)',
    '--modal-info-text': '#fef3c7',
    '--modal-info-text-muted': 'rgba(254, 243, 199, 0.9)'
  },
  'double-rare': {
    '--modal-border': 'rgba(192, 192, 204, 0.85)',
    '--modal-glow': '0 0 0 3px rgba(192,192,204,0.5), 0 24px 48px rgba(0,0,0,0.4)',
    '--modal-bg': '#1a1a20',
    '--modal-info-bg': 'rgba(36, 36, 48, 0.92)',
    '--modal-info-border': 'rgba(192, 192, 204, 0.3)',
    '--modal-info-text': '#e2e8f0',
    '--modal-info-text-muted': 'rgba(226, 232, 240, 0.88)'
  },
  'ultra-rare': {
    '--modal-border': 'rgba(245, 210, 130, 0.9)',
    '--modal-glow': '0 0 0 3px rgba(245,210,130,0.5), 0 24px 48px rgba(0,0,0,0.4)',
    '--modal-bg': '#1c1810',
    '--modal-info-bg': 'rgba(40, 32, 8, 0.92)',
    '--modal-info-border': 'rgba(245, 210, 130, 0.35)',
    '--modal-info-text': '#fde68a',
    '--modal-info-text-muted': 'rgba(253, 230, 138, 0.9)'
  },
  'illustration-rare': {
    '--modal-border': 'rgba(129, 140, 248, 0.9)',
    '--modal-glow': '0 0 0 3px rgba(129,140,248,0.5), 0 24px 48px rgba(0,0,0,0.4)',
    '--modal-bg': '#0f1220',
    '--modal-info-bg': 'rgba(15, 23, 42, 0.92)',
    '--modal-info-border': 'rgba(129, 140, 248, 0.35)',
    '--modal-info-text': '#c7d2fe',
    '--modal-info-text-muted': 'rgba(199, 210, 254, 0.9)'
  },
  sir: {
    '--modal-border': 'rgba(139, 92, 246, 0.95)',
    '--modal-glow': '0 0 0 3px rgba(139,92,246,0.55), 0 24px 48px rgba(0,0,0,0.4)',
    '--modal-bg': '#160e24',
    '--modal-info-bg': 'rgba(30, 8, 50, 0.92)',
    '--modal-info-border': 'rgba(139, 92, 246, 0.35)',
    '--modal-info-text': '#ddd6fe',
    '--modal-info-text-muted': 'rgba(221, 214, 254, 0.9)'
  },
  'hyper-rare': {
    '--modal-border': 'rgba(250, 204, 21, 0.95)',
    '--modal-glow': '0 0 0 3px rgba(250,204,21,0.6), 0 24px 48px rgba(0,0,0,0.4)',
    '--modal-bg': '#1a1408',
    '--modal-info-bg': 'rgba(40, 32, 0, 0.92)',
    '--modal-info-border': 'rgba(250, 204, 21, 0.4)',
    '--modal-info-text': '#fef08a',
    '--modal-info-text-muted': 'rgba(254, 240, 138, 0.9)'
  },
  'secret-rare': {
    '--modal-border': 'rgba(250, 204, 21, 0.9)',
    '--modal-glow': '0 0 0 3px rgba(250,204,21,0.5), 0 24px 48px rgba(0,0,0,0.4)',
    '--modal-bg': '#1c1810',
    '--modal-info-bg': 'rgba(40, 32, 8, 0.92)',
    '--modal-info-border': 'rgba(250, 204, 21, 0.35)',
    '--modal-info-text': '#fef08a',
    '--modal-info-text-muted': 'rgba(254, 240, 138, 0.9)'
  },
  'rainbow-rare': {
    '--modal-border': 'rgba(255, 255, 255, 0.6)',
    '--modal-glow': '0 0 0 3px rgba(255,255,255,0.3), 0 24px 48px rgba(0,0,0,0.4)',
    '--modal-bg': '#1a1620',
    '--modal-info-bg': 'rgba(30, 25, 35, 0.92)',
    '--modal-info-border': 'rgba(255, 255, 255, 0.25)',
    '--modal-info-text': '#f1f5f9',
    '--modal-info-text-muted': 'rgba(241, 245, 249, 0.9)'
  },
  'radiant-rare': {
    '--modal-border': 'rgba(248, 113, 113, 0.9)',
    '--modal-glow': '0 0 0 3px rgba(248,113,113,0.5), 0 24px 48px rgba(0,0,0,0.4)',
    '--modal-bg': '#1c0f0f',
    '--modal-info-bg': 'rgba(50, 12, 12, 0.92)',
    '--modal-info-border': 'rgba(248, 113, 113, 0.35)',
    '--modal-info-text': '#fecaca',
    '--modal-info-text-muted': 'rgba(254, 202, 202, 0.9)'
  },
  'amazing-rare': {
    '--modal-border': 'rgba(255, 255, 255, 0.5)',
    '--modal-glow': '0 0 0 3px rgba(255,255,255,0.25), 0 24px 48px rgba(0,0,0,0.4)',
    '--modal-bg': '#1a1818',
    '--modal-info-bg': 'rgba(30, 25, 25, 0.92)',
    '--modal-info-border': 'rgba(255, 255, 255, 0.2)',
    '--modal-info-text': '#f1f5f9',
    '--modal-info-text-muted': 'rgba(241, 245, 249, 0.9)'
  }
}

export function rarityModalKey (rarity) {
  const r = (rarity && typeof rarity === 'string' ? rarity : '').trim().toLowerCase().replace(/\s+/g, ' ')
  if (!r) return 'default'
  const lower = r.replace(/\s+/g, '-')
  if (lower.includes('rainbow')) return 'rainbow-rare'
  if (lower.includes('radiant')) return 'radiant-rare'
  if (lower.includes('amazing')) return 'amazing-rare'
  if (lower.includes('hyper-rare') || lower.includes('hyperrare')) return 'hyper-rare'
  if (lower.includes('secret-rare') || lower.includes('secretrare') || lower.includes('secret')) return 'secret-rare'
  if (lower.includes('special-illustration') || lower.includes('sir') || lower.includes('special-illustration-rare')) return 'sir'
  if (lower.includes('illustration-rare') || lower.includes('illustrationrare') || lower.includes('-ir-') || lower === 'ir') return 'illustration-rare'
  if (lower.includes('ultra-rare') || lower.includes('ultrarare') || lower.includes('ultra')) return 'ultra-rare'
  if (lower.includes('double-rare') || lower.includes('doublerare') || lower.includes('double')) return 'double-rare'
  if (lower.includes('reverse-holo') || lower.includes('reverseholo') || lower.includes('reverse')) return 'rare'
  if (lower.includes('holo-rare-v')) return 'holo-rare-v'
  if (lower.includes('holo')) return 'rare'
  if (lower.includes('rare')) return 'rare'
  if (lower.includes('uncommon')) return 'uncommon'
  if (lower.includes('common')) return 'common'
  return 'default'
}

export function rarityModalStyle (rarity) {
  return RARITY_MODAL_STYLES[rarityModalKey(rarity)] || RARITY_MODAL_STYLES.default
}

/** Agrupa la rareza para el filtro del álbum (Common, Uncommon, Rare, Ultra Rare, Secret Rare). */
export function rarityFilterGroup (rarity) {
  const key = rarityModalKey(rarity)
  if (key === 'common') return 'common'
  if (key === 'uncommon') return 'uncommon'
  if (['rare', 'double-rare'].includes(key)) return 'rare'
  if (['ultra-rare', 'illustration-rare', 'sir'].includes(key)) return 'ultra'
  if (['hyper-rare', 'secret-rare', 'rainbow-rare', 'radiant-rare', 'amazing-rare'].includes(key)) return 'secret'
  return 'default'
}

/** Indica si una rareza coincide con el valor del filtro del dropdown. */
export function rarityMatchesFilter (rarity, filterValue) {
  if (!filterValue) return true
  return rarityFilterGroup(rarity) === filterValue
}

/** True solo para "Holo Rare V" y "Holo Rare VMAX" (efecto holo tipo CodePen). */
export function isHoloRareV (rarity) {
  const r = (rarity && typeof rarity === 'string' ? rarity : '').toLowerCase()
  return r.includes('holo rare v')
}

/** Opciones del dropdown de filtro por rareza (Mi perfil, Vender, Comprar). */
export const RARITY_FILTER_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: 'common', label: 'Common' },
  { value: 'uncommon', label: 'Uncommon' },
  { value: 'rare', label: 'Rare' },
  { value: 'holo-rare-v', label: 'Holo Rare V / VMAX' },
  { value: 'ultra', label: 'Ultra Rare' },
  { value: 'secret', label: 'Secret Rare' }
]
