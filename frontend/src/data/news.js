// src/data/news.js
// Actualités — à remplacer par les appels API (src/api/index.js)
//
// category : valeur sémantique ('Sortie' | 'Recrutement' | 'Annonce' | 'Site' | 'Communauté')
// getCategoryBadge(category) : retourne la classe CSS correspondante côté UI

export function getCategoryBadge(category) {
  const map = {
    Sortie:      'badge-simulcast',
    Recrutement: 'badge-vf',
    Annonce:     'badge-vostfr',
    Site:        'badge-fin',
    Communauté:  'badge-new',
  }
  return map[category] ?? 'badge-fin'
}

export const news = [
  {
    id:          6,
    category:    'Sortie',
    icon:        '⚔️',
    gradient:    'linear-gradient(135deg,#0a1528,#162545)',
    thumb:       'linear-gradient(160deg,#162545,#1e3560,#0a1528)',
    title:       'DanMachi — Épisodes 1 à 12 disponibles en VOSTFR',
    excerpt:     "Bell Cranel débarque dans le donjon. Les 12 premiers épisodes de la saison 1 sont désormais disponibles en streaming et en téléchargement.",
    date:        'il y a 2h',
    author:      "L'équipe traduction",
    content: [
      "C'est avec plaisir que nous mettons en ligne les épisodes 1 à 12 de DanMachi — Is It Wrong to Try to Pick Up Girls in a Dungeon? — en version originale sous-titrée français (VOSTFR).",
      "Adapté du light novel de Fujino Ōmori, DanMachi nous plonge dans la ville d'Orario, un monde où des aventuriers rejoignent des familias dirigées par des dieux descendus sur Terre pour explorer un donjon souterrain infini aux étages sans fin. Bell Cranel, jeune aventurier naïf de la Familia d'Hestia, voit sa vie basculer le jour où il croise le chemin d'Aiz Wallenstein, la plus redoutable escrimeuse de la ville. Cette rencontre déclenche en lui une progression fulgurante qui va stupéfier tout le monde.",
      "Les sous-titres sont tirés des releases de Tsundere-Raws (WKN) et ont été vérifiés par notre équipe pour corriger les quelques approximations de traduction. La qualité vidéo est en 1080p WEB x264 AAC pour l'ensemble des épisodes.",
      "L'épisode 13 (OVA spéciale) sera mis en ligne très prochainement, dès que la vérification qualité sera terminée. Restez connectés et bon visionnage !",
    ],
    serieId:     'danmachi',
    episodeNums: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  },

  {
    id:          1,
    category:    'Sortie',
    icon:        '🎬',
    gradient:    'linear-gradient(135deg,#1a0d2e,#2a1050)',
    thumb:       'linear-gradient(160deg,#2a1050,#3d1570,#1a0d2e)',
    title:       'Jujutsu Kaisen S3 — Épisode 24 disponible',
    excerpt:     "Le final de l'arc Culling Game vient de sortir, sous-titré et prêt à regarder.",
    date:        'il y a 3h',
    author:      "L'équipe traduction",
    content: [
      "C'est l'heure du grand final ! L'épisode 24 de Jujutsu Kaisen S3 est disponible dès maintenant en streaming sur le site, sous-titré par notre équipe.",
      "Cet épisode conclut l'arc Culling Game dans une explosion de tension et de rebondissements. Nos traducteurs et correcteurs ont mis un point d'honneur à livrer une version à la hauteur de cette fin d'arc, avec une attention particulière portée aux dialogues les plus denses.",
      "Comme toujours, n'hésitez pas à nous remonter la moindre coquille via le serveur Discord — vos retours nous aident à améliorer chaque sortie.",
      "Bon visionnage à toutes et à tous, et merci de nous suivre sur cette saison !",
    ],
    serieId:     'jujutsu-kaisen-s3',
    episodeNums: [24],
  },
  {
    id:          2,
    category:    'Recrutement',
    icon:        '📢',
    gradient:    'linear-gradient(135deg,#0d1535,#182860)',
    thumb:       'linear-gradient(160deg,#182860,#22407a,#0d1535)',
    title:       "On recrute pour la saison d'automne",
    excerpt:     'Traducteurs JP/FR et correcteurs recherchés pour renforcer les équipes avant la rentrée.',
    date:        'il y a 1j',
    author:      "L'équipe staff",
    content: [
      "La saison d'automne approche à grands pas, et avec elle son lot de nouvelles séries à suivre. Pour assurer des sorties rapides et soignées, nous cherchons à agrandir notre équipe.",
      "Postes ouverts : traducteurs JP/FR (expérience appréciée mais pas obligatoire — un bon niveau de japonais et de français suffit pour candidater), correcteurs orthographiques et stylistiques, ainsi que des éditeurs/typesetters pour la mise en forme des sous-titres.",
      "Aucune contrainte de temps imposée : chacun contribue selon ses disponibilités, dans une ambiance détendue et bienveillante. Une bonne occasion de rejoindre une équipe passionnée tout en progressant dans une langue que vous aimez.",
      "Intéressé(e) ? Envoyez-nous un message sur le Discord du site, rubrique #recrutement, avec un petit mot sur vous et vos motivations.",
    ],
    serieId:     null,
    episodeNums: [],
  },
  {
    id:          3,
    category:    'Annonce',
    icon:        '🗓️',
    gradient:    'linear-gradient(135deg,#0d2010,#1a3a18)',
    thumb:       'linear-gradient(160deg,#1a3a18,#235024,#0d2010)',
    title:       'Calendrier des simulcasts du printemps publié',
    excerpt:     'Retrouve les jours et horaires de sortie de nos séries en simulcast cette saison.',
    date:        'il y a 2j',
    author:      "L'équipe planning",
    content: [
      "Le calendrier complet des simulcasts de la saison de printemps est désormais disponible sur le site, dans la section dédiée. Vous y retrouverez les jours et horaires de sortie de chaque épisode, mis à jour en temps réel selon la diffusion japonaise.",
      "Cette saison, l'équipe vise une mise en ligne des épisodes sous-titrés dans les heures suivant la diffusion originale, dès que les bruts sont disponibles et la traduction relue.",
      "Pensez à activer les notifications depuis votre profil pour ne manquer aucune sortie : vous recevrez une alerte dès qu'un nouvel épisode est mis en ligne pour les séries que vous suivez.",
      "Bonne saison de simulcasts à toutes et à tous !",
    ],
    serieId:     null,
    episodeNums: [],
  },
  {
    id:          4,
    category:    'Site',
    icon:        '🛠️',
    gradient:    'linear-gradient(135deg,#2c2c3a,#363648)',
    thumb:       'linear-gradient(160deg,#363648,#454560,#2c2c3a)',
    title:       'Nouveau lecteur vidéo et meilleures performances',
    excerpt:     'Chargement plus rapide, sous-titres ajustables et reprise automatique de la lecture.',
    date:        'il y a 4j',
    author:      "L'équipe technique",
    content: [
      "Après plusieurs semaines de travail en coulisses, le site passe sur un tout nouveau lecteur vidéo. Au programme : un chargement plus rapide des épisodes, une meilleure stabilité sur mobile, et une interface repensée pour aller à l'essentiel.",
      "Les sous-titres sont désormais personnalisables directement depuis le lecteur (taille, position, délai), et la lecture reprend automatiquement là où vous l'aviez laissée — pratique pour reprendre un épisode entamé la veille.",
      "Nous continuons à surveiller les performances de près : si vous rencontrez le moindre souci de lecture, faites-le nous savoir sur le Discord, section #support.",
      "Merci pour votre patience pendant cette transition, et bon visionnage avec ce nouveau lecteur !",
    ],
    serieId:     null,
    episodeNums: [],
  },
  {
    id:          5,
    category:    'Communauté',
    icon:        '🤝',
    gradient:    'linear-gradient(135deg,#2a0d10,#4a1418)',
    thumb:       'linear-gradient(160deg,#4a1418,#641b20,#2a0d10)',
    title:       'Notre Discord dépasse les 5 000 membres',
    excerpt:     'Merci à toute la communauté ! Rejoins-nous pour suivre les sorties en direct.',
    date:        'il y a 1 sem.',
    author:      "L'équipe communauté",
    content: [
      "Une belle étape vient d'être franchie : notre serveur Discord compte désormais plus de 5 000 membres ! Une communauté grandissante de passionné(e)s d'animation japonaise, de traduction et de découvertes en tout genre.",
      "Sur le serveur, vous pouvez discuter des derniers épisodes en direct, proposer des séries à traduire, suivre les coulisses des sorties, et échanger avec l'équipe et les autres membres autour d'un thé ou d'un café virtuel.",
      "Pour fêter ça, plusieurs animations et tirages au sort seront organisés dans les prochaines semaines — restez à l'affût des annonces.",
      "Merci à chacune et chacun d'entre vous pour votre soutien : c'est aussi grâce à cette communauté que l'équipe garde la motivation de continuer, saison après saison. Rejoignez-nous via le lien dans le pied de page !",
    ],
    serieId:     null,
    episodeNums: [],
  },
]

export function getNewsById(id) {
  return news.find(n => n.id === Number(id)) ?? null
}
