// src/data/releases.js
// Épisodes récemment mis en ligne, du plus récent au plus ancien.
// À remplacer par l'appel API (src/api/releases.js) une fois le backend prêt.
//
// seasonSlug : 'saison-N' (1-based) — 'saison-1' pour les séries sans saisons.
// releasedAt : date exacte de mise en ligne (ISO 8601 UTC).
// quality    : 'SD' | 'FHD' | '4K'

export const releases = [

  // ── 2026-06-08 ───────────────────────────────────────────────────────────
  {
    serieId:    'jujutsu-kaisen-s3',
    seasonSlug: 'saison-1',
    epNum:      24,
    quality:    'FHD',
    releasedAt: '2026-06-08T09:15:00Z',
  },
  {
    serieId:    'kimetsu-s4',
    seasonSlug: 'saison-1',
    epNum:      12,
    quality:    'FHD',
    releasedAt: '2026-06-08T06:30:00Z',
  },
  {
    serieId:    'blue-box',
    seasonSlug: 'saison-1',
    epNum:      16,
    quality:    'FHD',
    releasedAt: '2026-06-08T04:00:00Z',
  },

  // ── 2026-06-07 ───────────────────────────────────────────────────────────
  {
    serieId:    'dandadan',
    seasonSlug: 'saison-1',
    epNum:      3,
    quality:    'FHD',
    releasedAt: '2026-06-07T20:00:00Z',
  },
  {
    serieId:    'jujutsu-kaisen-s3',
    seasonSlug: 'saison-1',
    epNum:      23,
    quality:    'FHD',
    releasedAt: '2026-06-07T10:00:00Z',
  },

  // ── 2026-06-06 ───────────────────────────────────────────────────────────
  {
    serieId:    'chainsaw-man-s2',
    seasonSlug: 'saison-1',
    epNum:      8,
    quality:    'FHD',
    releasedAt: '2026-06-06T18:30:00Z',
  },
  {
    serieId:    'fma-brotherhood',
    seasonSlug: 'saison-1',
    epNum:      64,
    quality:    'FHD',
    releasedAt: '2026-06-06T12:00:00Z',
  },

  // ── 2026-06-04 ───────────────────────────────────────────────────────────
  {
    serieId:    'danmachi',
    seasonSlug: 'saison-1',
    epNum:      12,
    quality:    'FHD',
    releasedAt: '2026-06-04T16:00:00Z',
  },
  {
    serieId:    'jujutsu-kaisen-s3',
    seasonSlug: 'saison-1',
    epNum:      22,
    quality:    'FHD',
    releasedAt: '2026-06-04T09:00:00Z',
  },

  // ── 2026-06-01 ───────────────────────────────────────────────────────────
  {
    serieId:    'blue-box',
    seasonSlug: 'saison-1',
    epNum:      15,
    quality:    'FHD',
    releasedAt: '2026-06-01T20:00:00Z',
  },
  {
    serieId:    'kimetsu-s4',
    seasonSlug: 'saison-1',
    epNum:      11,
    quality:    'FHD',
    releasedAt: '2026-06-01T08:00:00Z',
  },
  {
    serieId:    'haikyu',
    seasonSlug: 'saison-2',
    epNum:      25,
    quality:    'FHD',
    releasedAt: '2026-06-01T06:00:00Z',
  },

  // ── 2026-05-25 ───────────────────────────────────────────────────────────
  {
    serieId:    'vinland-saga-s3',
    seasonSlug: 'saison-1',
    epNum:      24,
    quality:    'FHD',
    releasedAt: '2026-05-25T14:00:00Z',
  },
  {
    serieId:    'jujutsu-kaisen-s3',
    seasonSlug: 'saison-1',
    epNum:      21,
    quality:    'FHD',
    releasedAt: '2026-05-25T10:00:00Z',
  },
  {
    serieId:    'frieren',
    seasonSlug: 'saison-1',
    epNum:      28,
    quality:    'FHD',
    releasedAt: '2026-05-25T08:00:00Z',
  },

  // ── 2026-05-18 ───────────────────────────────────────────────────────────
  {
    serieId:    'jujutsu-kaisen-s3',
    seasonSlug: 'saison-1',
    epNum:      20,
    quality:    'FHD',
    releasedAt: '2026-05-18T10:00:00Z',
  },

  // ── 2026-05-11 ───────────────────────────────────────────────────────────
  {
    serieId:    'haikyu',
    seasonSlug: 'saison-1',
    epNum:      25,
    quality:    'FHD',
    releasedAt: '2026-05-11T08:00:00Z',
  },

  // ── 2026-05-04 ───────────────────────────────────────────────────────────
  {
    serieId:    'danmachi',
    seasonSlug: 'saison-1',
    epNum:      11,
    quality:    'FHD',
    releasedAt: '2026-05-04T14:00:00Z',
  },
]

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

export function isSerieNew(serieId) {
  const now = Date.now()
  return releases.some(r => r.serieId === serieId && now - new Date(r.releasedAt).getTime() < SEVEN_DAYS_MS)
}
