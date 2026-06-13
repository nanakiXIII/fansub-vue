require('dotenv').config()
const mongoose   = require('mongoose')
const Series     = require('./src/models/Series')
const InProgress = require('./src/models/InProgress')
const Release    = require('./src/models/Release')
const News       = require('./src/models/News')
const Team       = require('./src/models/Team')
const Recruit    = require('./src/models/Recruit')

const seriesData = [
  {
    id: 'jujutsu-kaisen-s3', title: 'Jujutsu Kaisen S3', titleFull: 'Jujutsu Kaisen', titleJP: '呪術廻戦',
    season: 'Saison 3 · Arc Culling Game', year: 2024, studio: 'MAPPA', score: 9.2,
    genres: ['Action', 'Surnaturel', 'Shonen'], status: 'ongoing', visible: true,
    gradient: 'linear-gradient(155deg,#1a0d2e,#2a1050,#0d0820)',
    poster: 'https://picsum.photos/seed/jujutsu-kaisen-s3/400/600',
    banner: 'https://picsum.photos/seed/jujutsu-kaisen-s3-banner/1600/700',
    episodesAired: 24,
    seasons: [{ slug: 'saison-1', label: 'Saison 1', episodes: Array.from({ length: 24 }, (_, i) => ({ num: i + 1, title: `Épisode ${i + 1}` })) }],
  },
  {
    id: 'kimetsu-s4', title: 'Kimetsu no Yaiba S4', titleFull: 'Demon Slayer: Kimetsu no Yaiba', titleJP: '鬼滅の刃',
    season: 'Saison 4 · Arc du Village des Forgerons', year: 2024, studio: 'ufotable', score: 9.0,
    genres: ['Action', 'Historique', 'Shonen'], status: 'ongoing', visible: true,
    gradient: 'linear-gradient(155deg,#1a0820,#2a0d35,#0d0510)',
    poster: 'https://picsum.photos/seed/kimetsu-s4/400/600',
    banner: 'https://picsum.photos/seed/kimetsu-s4-banner/1600/700',
    episodesAired: 12,
    seasons: [{ slug: 'saison-1', label: 'Saison 1', episodes: Array.from({ length: 12 }, (_, i) => ({ num: i + 1, title: `Épisode ${i + 1}` })) }],
  },
  {
    id: 'chainsaw-man-s2', title: 'Chainsaw Man S2', titleFull: 'Chainsaw Man', titleJP: 'チェンソーマン',
    season: 'Saison 2 · Arc Tatsuki Fujimoto', year: 2024, studio: 'MAPPA', score: 8.7,
    genres: ['Action', 'Horreur', 'Seinen'], status: 'ongoing', visible: true,
    gradient: 'linear-gradient(155deg,#1a0810,#2a1015,#0d0508)',
    poster: 'https://picsum.photos/seed/chainsaw-man-s2/400/600',
    banner: 'https://picsum.photos/seed/chainsaw-man-s2-banner/1600/700',
    episodesAired: 8,
    seasons: [{ slug: 'saison-1', label: 'Saison 1', episodes: Array.from({ length: 8 }, (_, i) => ({ num: i + 1, title: `Épisode ${i + 1}` })) }],
  },
  {
    id: 'blue-box', title: 'Blue Box', titleFull: 'Blue Box', titleJP: 'アオのハコ',
    season: 'Saison 1', year: 2024, studio: 'Doga Kobo', score: 8.2,
    genres: ['Romance', 'Sport', 'Shonen'], status: 'ongoing', visible: true,
    gradient: 'linear-gradient(155deg,#0d1a2e,#1a2850,#080f1a)',
    poster: 'https://picsum.photos/seed/blue-box/400/600',
    banner: 'https://picsum.photos/seed/blue-box-banner/1600/700',
    episodesAired: 16,
    seasons: [{ slug: 'saison-1', label: 'Saison 1', episodes: Array.from({ length: 16 }, (_, i) => ({ num: i + 1, title: `Épisode ${i + 1}` })) }],
  },
  {
    id: 'berserk-of-gluttony', title: 'Berserk of Gluttony', titleFull: 'Berserk of Gluttony', titleJP: '暴食のベルセルク',
    season: 'Saison 1', year: 2023, studio: "Brain's Base", score: 7.5,
    genres: ['Action', 'Fantasy', 'Isekai'], status: 'completed', visible: false,
    gradient: 'linear-gradient(155deg,#1a0a05,#2a1008,#0d0502)',
    poster: 'https://a.storyblok.com/f/178900/1465x2065/fc2690b1d2/berserk-of-gluttony-key-visual.jpeg/m/filters:quality(95)format(webp)',
    banner: 'https://imgsrv.crunchyroll.com/cdn-cgi/image/fit=cover,format=auto,quality=85,width=1920/keyart/G1XHJV05V-backdrop_wide',
    episodesAired: 12, seasons: [],
    episodes: Array.from({ length: 12 }, (_, i) => {
      const n = i + 1, nn = String(n).padStart(2, '0')
      return { num: n, title: `Épisode ${n}`, duration: '~23 min', sources: { vostfr: { FHD: `/berserk-of-gluttony/Berserk of Gluttony - S01E${nn} [1080p].mkv` } } }
    }),
  },
  {
    id: 'dandadan', title: 'DanDaDan', titleFull: 'DanDaDan', titleJP: 'ダンダダン',
    season: 'Saison 1', year: 2024, studio: 'Science SARU', score: 8.8,
    genres: ['Action', 'Comédie', 'Surnaturel'], status: 'ongoing', visible: true,
    gradient: 'linear-gradient(155deg,#0d1a10,#1a2a18,#080f0a)',
    poster: 'https://picsum.photos/seed/dandadan/400/600',
    banner: 'https://picsum.photos/seed/dandadan-banner/1600/700',
    episodesAired: 13,
    seasons: [{ slug: 'saison-1', label: 'Saison 1', episodes: Array.from({ length: 13 }, (_, i) => ({ num: i + 1, title: `Épisode ${i + 1}` })) }],
  },
  {
    id: 'fma-brotherhood', title: 'Fullmetal Alchemist', titleFull: 'Fullmetal Alchemist: Brotherhood', titleJP: '鋼の錬金術師',
    season: 'Brotherhood', year: 2009, studio: 'Bones', score: 9.1,
    genres: ['Action', 'Adventure', 'Fantasy'], status: 'completed', visible: true,
    gradient: 'linear-gradient(155deg,#1a1205,#2a1e08,#0d0a02)',
    poster: 'https://picsum.photos/seed/fma-brotherhood/400/600',
    banner: 'https://picsum.photos/seed/fma-brotherhood-banner/1600/700',
    episodesAired: 64,
    seasons: [{ slug: 'saison-1', label: 'Saison 1', episodes: Array.from({ length: 64 }, (_, i) => ({ num: i + 1, title: `Épisode ${i + 1}` })) }],
  },
  {
    id: 'danmachi', title: 'DanMachi', titleFull: 'Is It Wrong to Try to Pick Up Girls in a Dungeon?', titleJP: 'ダンジョンに出会いを求めるのは間違っているだろうか',
    season: 'Saison 1', year: 2015, studio: 'J.C.Staff', score: 7.8,
    genres: ['Action', 'Fantasy', 'Romance'], status: 'completed', visible: true,
    gradient: 'linear-gradient(155deg,#0a1528,#162545,#060c18)',
    poster: 'https://picsum.photos/seed/danmachi/400/600',
    banner: 'https://picsum.photos/seed/danmachi-banner/1600/700',
    episodesAired: 13, seasons: [],
    episodes: [
      ...Array.from({ length: 12 }, (_, i) => {
        const n = i + 1, nn = String(n).padStart(2, '0')
        return { num: n, title: `Épisode ${n}`, duration: '~23 min', sources: { vostfr: { FHD: `/danmachi/DanMachi S01E${nn} VOSTFR 1080p WEB x264 AAC -Tsundere-Raws (WKN).mkv` } } }
      }),
      { num: 13, title: 'Épisode 13', duration: '~23 min', visible: false, sources: { vostfr: { FHD: '/danmachi/DanMachi S01E13 VOSTFR 1080p WEB x264 AAC -Tsundere-Raws (WKN).mkv' } } },
    ],
  },
  {
    id: 'haikyu', title: 'Haikyū!!', titleFull: 'Haikyū!!', titleJP: 'ハイキュー!!',
    season: 'Toutes saisons', year: 2014, studio: 'Production I.G', score: 8.7,
    genres: ['Sport', 'Comédie', 'Shonen'], status: 'completed', visible: true,
    gradient: 'linear-gradient(155deg,#0a1520,#162230,#060c15)',
    poster: 'https://picsum.photos/seed/haikyu/400/600',
    banner: 'https://picsum.photos/seed/haikyu-banner/1600/700',
    episodesAired: 85, episodes: [],
    seasons: [
      { slug: 'saison-1', label: 'Saison 1 — 2014', episodes: Array.from({ length: 25 }, (_, i) => {
        const n = i + 1, nn = String(n).padStart(2, '0')
        return { num: n, title: `Épisode ${n}`, duration: '~24 min', sources: { vostfr: { FHD: `/haikyu/HAIKYU!! S01E${nn} VOSTFR 1080p WEB H.264 AAC -Tsundere-Raws (WKN).mkv` } } }
      }) },
      { slug: 'saison-2', label: 'Saison 2 — 2015', episodes: Array.from({ length: 25 }, (_, i) => {
        const n = i + 1, nn = String(n).padStart(2, '0')
        const codec = n === 17 ? 'x264' : 'H.264'
        return { num: n, title: `Épisode ${n}`, duration: '~24 min', sources: { vostfr: { FHD: `/haikyu/HAIKYU!! S02E${nn} VOSTFR 1080p WEB ${codec} AAC -Tsundere-Raws (WKN).mkv` } } }
      }) },
      { slug: 'saison-3', label: 'Saison 3 — 2016', episodes: Array.from({ length: 10 }, (_, i) => {
        const n = i + 1, nn = String(n).padStart(2, '0')
        return { num: n, title: `Épisode ${n}`, duration: '~24 min', sources: { vostfr: { FHD: `/haikyu/HAIKYU!! S03E${nn} VOSTFR 1080p WEB x264 AAC -Tsundere-Raws (WKN).mkv` } } }
      }) },
    ],
  },
  {
    id: 'vinland-saga-s3', title: 'Vinland Saga S3', titleFull: 'Vinland Saga', titleJP: 'ヴィンランド・サガ',
    season: 'Saison 3', year: 2024, studio: 'MAPPA', score: 9.0,
    genres: ['Action', 'Historique', 'Seinen'], status: 'ongoing', visible: true,
    gradient: 'linear-gradient(155deg,#0a1820,#102535,#050c10)',
    poster: 'https://picsum.photos/seed/vinland-saga-s3/400/600',
    banner: 'https://picsum.photos/seed/vinland-saga-s3-banner/1600/700',
    episodesAired: 24,
    seasons: [{ slug: 'saison-1', label: 'Saison 1', episodes: Array.from({ length: 24 }, (_, i) => ({ num: i + 1, title: `Épisode ${i + 1}` })) }],
  },
  {
    id: 'frieren', title: 'Frieren', titleFull: "Frieren: Beyond Journey's End", titleJP: '葬送のフリーレン',
    season: 'Saison 1', year: 2023, studio: 'Madhouse', score: 9.3,
    genres: ['Fantasy', 'Aventure', 'Slice of Life'], status: 'completed', visible: true,
    gradient: 'linear-gradient(155deg,#0a1520,#1a2535,#080f1a)',
    poster: 'https://picsum.photos/seed/frieren/400/600',
    banner: 'https://picsum.photos/seed/frieren-banner/1600/700',
    episodesAired: 28,
    seasons: [{ slug: 'saison-1', label: 'Saison 1', episodes: Array.from({ length: 28 }, (_, i) => ({ num: i + 1, title: `Épisode ${i + 1}` })) }],
  },
]

const inProgressData = [
  {
    serieId: 'jujutsu-kaisen-s3', visible: true, order: 0,
    episode: { num: 24, title: "Le Domaine d'expansion ultime", duration: '24 min', lang: 'vostfr' },
    translation: {
      pct: 65, eta: 'Ce soir',
      steps: [
        { label: 'Brut',         done: true,  current: false },
        { label: 'Traduction',   done: true,  current: false },
        { label: 'Correction',   done: false, current: true  },
        { label: 'Timing',       done: false, current: false },
        { label: 'Encodage',     done: false, current: false },
        { label: 'Mise en ligne',done: false, current: false },
      ],
    },
    staff: { translator: 'Kitsune_sub', proofreader: 'HanaeN', timer: null, encoder: null },
  },
  {
    serieId: 'kimetsu-s4', visible: true, order: 1,
    episode: { num: 12, title: 'Le Pilier de la Brume', duration: '23 min', lang: 'vf' },
    translation: {
      pct: 90, eta: 'Dans 2h',
      steps: [
        { label: 'Brut',         done: true,  current: false },
        { label: 'Traduction',   done: true,  current: false },
        { label: 'Correction',   done: true,  current: false },
        { label: 'Timing',       done: true,  current: false },
        { label: 'Encodage',     done: false, current: true  },
        { label: 'Mise en ligne',done: false, current: false },
      ],
    },
    staff: { translator: 'Sakura_TL', proofreader: 'Yumi_K', timer: 'Mei_Otaku', encoder: 'Zephyr_Edit' },
  },
  {
    serieId: 'chainsaw-man-s2', visible: true, order: 2,
    episode: { num: 8, title: 'Violence et Sang', duration: '25 min', lang: 'vostfr' },
    translation: {
      pct: 30, eta: 'Demain',
      steps: [
        { label: 'Brut',         done: true,  current: false },
        { label: 'Traduction',   done: false, current: true  },
        { label: 'Correction',   done: false, current: false },
        { label: 'Timing',       done: false, current: false },
        { label: 'Encodage',     done: false, current: false },
        { label: 'Mise en ligne',done: false, current: false },
      ],
    },
    staff: { translator: 'BloodSub', proofreader: null, timer: null, encoder: null },
  },
  {
    serieId: 'blue-box', visible: true, order: 3,
    episode: { num: 16, title: 'Le Match retour', duration: '23 min', lang: 'vf' },
    translation: {
      pct: 50, eta: 'Ce soir',
      steps: [
        { label: 'Brut',         done: true,  current: false },
        { label: 'Traduction',   done: true,  current: false },
        { label: 'Correction',   done: false, current: true  },
        { label: 'Timing',       done: false, current: false },
        { label: 'Encodage',     done: false, current: false },
        { label: 'Mise en ligne',done: false, current: false },
      ],
    },
    staff: { translator: 'HanaHana', proofreader: 'SportSub', timer: null, encoder: null },
  },
  {
    serieId: 'berserk-of-gluttony', visible: false, order: 4,
    episode: { num: 12, title: 'La Faim du néant', duration: '23 min', lang: 'vostfr' },
    translation: {
      pct: 15, eta: 'Dans 3 jours',
      steps: [
        { label: 'Brut',         done: true,  current: false },
        { label: 'Traduction',   done: false, current: true  },
        { label: 'Correction',   done: false, current: false },
        { label: 'Timing',       done: false, current: false },
        { label: 'Encodage',     done: false, current: false },
        { label: 'Mise en ligne',done: false, current: false },
      ],
    },
    staff: { translator: 'BloodSub', proofreader: null, timer: null, encoder: null },
  },
]

const releasesData = [
  { serieId: 'jujutsu-kaisen-s3', seasonSlug: 'saison-1', epNum: 24, quality: 'FHD', releasedAt: new Date('2026-06-08T09:15:00Z') },
  { serieId: 'kimetsu-s4',        seasonSlug: 'saison-1', epNum: 12, quality: 'FHD', releasedAt: new Date('2026-06-08T06:30:00Z') },
  { serieId: 'blue-box',          seasonSlug: 'saison-1', epNum: 16, quality: 'FHD', releasedAt: new Date('2026-06-08T04:00:00Z') },
  { serieId: 'dandadan',          seasonSlug: 'saison-1', epNum:  3, quality: 'FHD', releasedAt: new Date('2026-06-07T20:00:00Z') },
  { serieId: 'jujutsu-kaisen-s3', seasonSlug: 'saison-1', epNum: 23, quality: 'FHD', releasedAt: new Date('2026-06-07T10:00:00Z') },
  { serieId: 'chainsaw-man-s2',   seasonSlug: 'saison-1', epNum:  8, quality: 'FHD', releasedAt: new Date('2026-06-06T18:30:00Z') },
  { serieId: 'fma-brotherhood',   seasonSlug: 'saison-1', epNum: 64, quality: 'FHD', releasedAt: new Date('2026-06-06T12:00:00Z') },
  { serieId: 'danmachi',          seasonSlug: 'saison-1', epNum: 12, quality: 'FHD', releasedAt: new Date('2026-06-04T16:00:00Z') },
  { serieId: 'jujutsu-kaisen-s3', seasonSlug: 'saison-1', epNum: 22, quality: 'FHD', releasedAt: new Date('2026-06-04T09:00:00Z') },
  { serieId: 'blue-box',          seasonSlug: 'saison-1', epNum: 15, quality: 'FHD', releasedAt: new Date('2026-06-01T20:00:00Z') },
  { serieId: 'kimetsu-s4',        seasonSlug: 'saison-1', epNum: 11, quality: 'FHD', releasedAt: new Date('2026-06-01T08:00:00Z') },
  { serieId: 'haikyu',            seasonSlug: 'saison-2', epNum: 25, quality: 'FHD', releasedAt: new Date('2026-06-01T06:00:00Z') },
  { serieId: 'vinland-saga-s3',   seasonSlug: 'saison-1', epNum: 24, quality: 'FHD', releasedAt: new Date('2026-05-25T14:00:00Z') },
  { serieId: 'jujutsu-kaisen-s3', seasonSlug: 'saison-1', epNum: 21, quality: 'FHD', releasedAt: new Date('2026-05-25T10:00:00Z') },
  { serieId: 'frieren',           seasonSlug: 'saison-1', epNum: 28, quality: 'FHD', releasedAt: new Date('2026-05-25T08:00:00Z') },
  { serieId: 'jujutsu-kaisen-s3', seasonSlug: 'saison-1', epNum: 20, quality: 'FHD', releasedAt: new Date('2026-05-18T10:00:00Z') },
  { serieId: 'haikyu',            seasonSlug: 'saison-1', epNum: 25, quality: 'FHD', releasedAt: new Date('2026-05-11T08:00:00Z') },
  { serieId: 'danmachi',          seasonSlug: 'saison-1', epNum: 11, quality: 'FHD', releasedAt: new Date('2026-05-04T14:00:00Z') },
]

const teamData = [
  {
    slug: 'kitsune-sub', name: 'Kitsune_sub', role: 'Fondatrice & coordination',
    department: 'Direction', initials: 'KS',
    avatarGradient: 'linear-gradient(135deg,#f47521,#c2540a)', joined: '2019',
    bio: "À l'origine du projet depuis 2019, elle supervise le planning des sorties et veille à la cohérence éditoriale de chaque saison.",
    tags: ['Coordination', 'Planning'], active: true,
  },
  {
    slug: 'ryo-sub', name: 'Ryo_Sub', role: 'Co-fondateur & relations communauté',
    department: 'Direction', initials: 'RS',
    avatarGradient: 'linear-gradient(135deg,#22d3ee,#0e7490)', joined: '2019',
    bio: "Gère le serveur Discord et fait le lien entre l'équipe et la communauté — toujours partant pour discuter sorties et suggestions.",
    tags: ['Discord', 'Communauté'], active: true,
  },
  {
    slug: 'misuz', name: 'MisuZ', role: 'Traductrice JP → FR',
    department: 'Traduction', initials: 'MZ',
    avatarGradient: 'linear-gradient(135deg,#a855f7,#7e22ce)', joined: '2020',
    bio: "Spécialiste des dialogues denses et des références culturelles — elle affectionne particulièrement les séries de sport et de tranche de vie.",
    tags: ['JP → FR', 'Adaptation'], active: true,
  },
  {
    slug: 'hanaen', name: 'HanaeN', role: 'Traductrice & correctrice',
    department: 'Traduction', initials: 'HN',
    avatarGradient: 'linear-gradient(135deg,#f4537e,#be185d)', joined: '2021',
    bio: "Passe derrière chaque traduction pour traquer la moindre coquille et fluidifier les tournures avant la mise en ligne.",
    tags: ['Correction', 'Relecture'], active: true,
  },
  {
    slug: 'aki-trad', name: 'Aki_Trad', role: 'Traducteur JP → FR',
    department: 'Traduction', initials: 'AT',
    avatarGradient: 'linear-gradient(135deg,#34d399,#047857)', joined: '2022',
    bio: "Le petit dernier de l'équipe traduction, déjà bien aguerri sur les séries d'action et les longs arcs scénaristiques.",
    tags: ['JP → FR', 'Action'], active: true,
  },
  {
    slug: 'mei-otaku', name: 'Mei_Otaku', role: 'Time & karaoké',
    department: 'Édition', initials: 'MO',
    avatarGradient: 'linear-gradient(135deg,#fbbf24,#b45309)', joined: '2021',
    bio: "Cale chaque sous-titre à la frame près et conçoit les karaokés d'opening/ending qui font sa réputation.",
    tags: ['Time', 'Karaoké'], active: true,
  },
  {
    slug: 'zephyr-edit', name: 'Zephyr_Edit', role: 'Typesetting & encodage',
    department: 'Édition', initials: 'ZE',
    avatarGradient: 'linear-gradient(135deg,#60a5fa,#1d4ed8)', joined: '2022',
    bio: "S'occupe de l'habillage des sous-titres sur les panneaux et de l'encodage final avant la mise en ligne.",
    tags: ['Typesetting', 'Encodage'], active: true,
  },
  {
    slug: 'hana-chan', name: 'Hana_Chan', role: 'Vérification qualité (QC)',
    department: 'Communauté', initials: 'HC',
    avatarGradient: 'linear-gradient(135deg,#f472b6,#9d174d)', joined: '2023',
    bio: "Visionne chaque épisode avant publication pour s'assurer que tout est nickel — typo, synchronisation, qualité d'image.",
    tags: ['QC', 'Visionnage'], active: true,
  },
  {
    slug: 'yuki-mod', name: 'Yuki_Mod', role: 'Modération Discord',
    department: 'Communauté', initials: 'YM',
    avatarGradient: 'linear-gradient(135deg,#818cf8,#4338ca)', joined: '2022',
    bio: "Veille à la bonne ambiance sur le serveur et organise les animations et tirages au sort pour la communauté.",
    tags: ['Modération', 'Animations'], active: true,
  },
]

const recruitData = [
  {
    slug: 'traducteur-jp-fr', order: 1,
    title: 'Traducteur JP → FR',
    icon: '🈳',
    color: 'linear-gradient(135deg,rgb(168 85 247 / 0.3),rgb(126 34 206 / 0.3))',
    open: true,
    description: "Traduis les dialogues depuis la piste japonaise en français naturel et fidèle à l'œuvre originale.",
    tags: ['Japonais N3+', 'Rédaction FR'],
  },
  {
    slug: 'correcteur-relecteur', order: 2,
    title: 'Correcteur / Relecteur',
    icon: '✏️',
    color: 'linear-gradient(135deg,rgb(244 83 126 / 0.3),rgb(190 24 93 / 0.3))',
    open: true,
    description: "Relis les traductions pour corriger les coquilles, fluidifier les tournures et assurer la cohérence de la série.",
    tags: ['Orthographe', 'Style FR'],
  },
  {
    slug: 'timer', order: 3,
    title: 'Timer',
    icon: '⏱️',
    color: 'linear-gradient(135deg,rgb(251 191 36 / 0.3),rgb(180 83 9 / 0.3))',
    open: true,
    description: "Synchronise chaque ligne de sous-titre avec l'audio pour une lecture fluide, à la frame près.",
    tags: ['Aegisub', 'Rigueur'],
  },
  {
    slug: 'typesetter', order: 4,
    title: 'Typesetter',
    icon: '🖋️',
    color: 'linear-gradient(135deg,rgb(96 165 250 / 0.3),rgb(29 78 216 / 0.3))',
    open: false,
    description: "Habille les inserts, panneaux et signes à l'écran pour les intégrer harmonieusement à l'image.",
    tags: ['Aegisub', 'Design'],
  },
  {
    slug: 'quality-check', order: 5,
    title: 'Quality Check (QC)',
    icon: '🔍',
    color: 'linear-gradient(135deg,rgb(244 114 182 / 0.3),rgb(157 23 77 / 0.3))',
    open: true,
    description: "Visionne l'épisode terminé pour détecter les erreurs restantes avant la mise en ligne.",
    tags: ['Attention', 'Visionnage'],
  },
  {
    slug: 'moderateur-discord', order: 6,
    title: 'Modérateur Discord',
    icon: '🛡️',
    color: 'linear-gradient(135deg,rgb(129 140 248 / 0.3),rgb(67 56 202 / 0.3))',
    open: true,
    description: "Anime et modère le serveur Discord : accueil des nouveaux, gestion des discussions, organisation d'événements.",
    tags: ['Communauté', 'Discord'],
  },
]

const newsData = [
  {
    title: 'DanMachi — Épisodes 1 à 12 disponibles en VOSTFR',
    category: 'Sortie', icon: '⚔️',
    gradient: 'linear-gradient(135deg,#0a1528,#162545)',
    thumb: 'linear-gradient(160deg,#162545,#1e3560,#0a1528)',
    excerpt: "Bell Cranel débarque dans le donjon. Les 12 premiers épisodes de la saison 1 sont désormais disponibles.",
    date: 'il y a 2h', author: "L'équipe traduction",
    content: ["C'est avec plaisir que nous mettons en ligne les épisodes 1 à 12 de DanMachi."],
    serieId: 'danmachi', episodeNums: [1,2,3,4,5,6,7,8,9,10,11,12],
  },
  {
    title: 'Jujutsu Kaisen S3 — Épisode 24 disponible',
    category: 'Sortie', icon: '🎬',
    gradient: 'linear-gradient(135deg,#1a0d2e,#2a1050)',
    thumb: 'linear-gradient(160deg,#2a1050,#3d1570,#1a0d2e)',
    excerpt: "Le final de l'arc Culling Game vient de sortir, sous-titré et prêt à regarder.",
    date: 'il y a 3h', author: "L'équipe traduction",
    content: ["C'est l'heure du grand final !"],
    serieId: 'jujutsu-kaisen-s3', episodeNums: [24],
  },
  {
    title: "On recrute pour la saison d'automne",
    category: 'Recrutement', icon: '📢',
    gradient: 'linear-gradient(135deg,#0d1535,#182860)',
    thumb: 'linear-gradient(160deg,#182860,#22407a,#0d1535)',
    excerpt: "Traducteurs JP/FR et correcteurs recherchés pour renforcer les équipes avant la rentrée.",
    date: 'il y a 1j', author: "L'équipe staff",
    content: ["La saison d'automne approche."],
    serieId: null, episodeNums: [],
  },
  {
    title: 'Calendrier des simulcasts du printemps publié',
    category: 'Annonce', icon: '🗓️',
    gradient: 'linear-gradient(135deg,#0d2010,#1a3a18)',
    thumb: 'linear-gradient(160deg,#1a3a18,#235024,#0d2010)',
    excerpt: 'Retrouve les jours et horaires de sortie de nos séries en simulcast cette saison.',
    date: 'il y a 2j', author: "L'équipe planning",
    content: ["Le calendrier complet des simulcasts est disponible."],
    serieId: null, episodeNums: [],
  },
  {
    title: 'Nouveau lecteur vidéo et meilleures performances',
    category: 'Site', icon: '🛠️',
    gradient: 'linear-gradient(135deg,#2c2c3a,#363648)',
    thumb: 'linear-gradient(160deg,#363648,#454560,#2c2c3a)',
    excerpt: 'Chargement plus rapide, sous-titres ajustables et reprise automatique de la lecture.',
    date: 'il y a 4j', author: "L'équipe technique",
    content: ["Après plusieurs semaines de travail, le site passe sur un nouveau lecteur."],
    serieId: null, episodeNums: [],
  },
  {
    title: 'Notre Discord dépasse les 5 000 membres',
    category: 'Communauté', icon: '🤝',
    gradient: 'linear-gradient(135deg,#2a0d10,#4a1418)',
    thumb: 'linear-gradient(160deg,#4a1418,#641b20,#2a0d10)',
    excerpt: 'Merci à toute la communauté ! Rejoins-nous pour suivre les sorties en direct.',
    date: 'il y a 1 sem.', author: "L'équipe communauté",
    content: ["Une belle étape : notre Discord compte plus de 5 000 membres."],
    serieId: null, episodeNums: [],
  },
]

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connecté à MongoDB')

    // Series : upsert pour éviter les doublons
    let seriesCount = 0
    for (const data of seriesData) {
      await Series.findOneAndUpdate({ id: data.id }, data, { upsert: true, new: true, runValidators: true })
      seriesCount++
    }
    console.log(`Series : ${seriesCount} upserted`)

    // InProgress : remplace tout
    await InProgress.deleteMany({})
    const ipResult = await InProgress.insertMany(inProgressData)
    console.log(`InProgress : ${ipResult.length} inserted`)

    // Releases : remplace tout
    await Release.deleteMany({})
    const relResult = await Release.insertMany(releasesData)
    console.log(`Releases : ${relResult.length} inserted`)

    // News : remplace tout
    await News.deleteMany({})
    const newsResult = await News.insertMany(newsData)
    console.log(`News : ${newsResult.length} inserted`)

    // Team : upsert par slug
    let teamCount = 0
    for (const data of teamData) {
      await Team.findOneAndUpdate({ slug: data.slug }, data, { upsert: true, new: true, runValidators: true })
      teamCount++
    }
    console.log(`Team : ${teamCount} upserted`)

    // Recruit : upsert par slug
    let recruitCount = 0
    for (const data of recruitData) {
      await Recruit.findOneAndUpdate({ slug: data.slug }, data, { upsert: true, new: true, runValidators: true })
      recruitCount++
    }
    console.log(`Recruit : ${recruitCount} upserted`)

    console.log('Seed terminé avec succès.')
    process.exit(0)
  } catch (err) {
    console.error('Erreur lors du seed :', err)
    process.exit(1)
  }
}

seed()
