// src/data/comments.js
// Commentaires — structure miroir d'une future API REST
//
// Endpoints simulés :
//   getCommentsByArticle(articleId)          → commentaires approuvés d'une news
//   getCommentsByEpisode(serieId, epNum)     → commentaires approuvés d'un épisode
//   addComment(payload)                      → ajoute (réactif, simule un POST)
//
// status : 'approved' | 'pending' | 'rejected'
// isLocal : true si posté par un utilisateur sans vrai compte (modération requise)

import { reactive } from 'vue'

// ── Helpers visuels ────────────────────────────────────────────────────────────
const GRADIENTS = [
  'linear-gradient(135deg,#a855f7,#7e22ce)',
  'linear-gradient(135deg,#22d3ee,#0e7490)',
  'linear-gradient(135deg,#f4537e,#be185d)',
  'linear-gradient(135deg,#f59e0b,#b45309)',
  'linear-gradient(135deg,#10b981,#065f46)',
  'linear-gradient(135deg,#6366f1,#3730a3)',
  'linear-gradient(135deg,#ef4444,#991b1b)',
  'linear-gradient(135deg,#14b8a6,#0f766e)',
]

function gradient(index) { return GRADIENTS[index % GRADIENTS.length] }
function initials(username) {
  return username.split(/[_\s]/).map(w => w[0]).join('').slice(0, 2).toUpperCase()
}
function relativeDate(isoDate) {
  const diff = Date.now() - new Date(isoDate).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)   return 'à l\'instant'
  if (m < 60)  return `il y a ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24)  return `il y a ${h}h`
  const d = Math.floor(h / 24)
  if (d < 7)   return `il y a ${d}j`
  return new Date(isoDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

// ── Store réactif (simule la BDD) ──────────────────────────────────────────────
export const commentsStore = reactive([

  // ══════════════════════════════════════════════════════════════════════════════
  // Article 6 — DanMachi saison 4 (10 commentaires)
  // ══════════════════════════════════════════════════════════════════════════════
  {
    id: 1, articleId: 6, serieId: null, epNum: null,
    userId: 'u-mei', username: 'Mei_Otaku', isLocal: false, status: 'approved',
    text: 'Toujours aussi rapide et nickel niveau qualité, merci pour le boulot l\'équipe !',
    likes: 14, createdAt: '2026-06-08T08:20:00Z',
  },
  {
    id: 2, articleId: 6, serieId: null, epNum: null,
    userId: 'u-ryo', username: 'Ryo_Sub', isLocal: false, status: 'approved',
    text: 'Hâte de voir ça ce soir, ça fait plaisir d\'avoir des nouvelles aussi régulièrement.',
    likes: 8, createdAt: '2026-06-08T06:05:00Z',
  },
  {
    id: 3, articleId: 6, serieId: null, epNum: null,
    userId: 'u-hana', username: 'Hana_Chan', isLocal: false, status: 'approved',
    text: 'Premier commentaire ! Continuez comme ça, on est nombreux à suivre derrière 🙌',
    likes: 21, createdAt: '2026-06-08T04:00:00Z',
  },
  {
    id: 4, articleId: 6, serieId: null, epNum: null,
    userId: 'u-bell', username: 'Bell_Fan_01', isLocal: false, status: 'approved',
    text: 'La saison 4 va déchirer, j\'ai lu le manga jusqu\'au bout et c\'est énorme ce qui attend Bell.',
    likes: 31, createdAt: '2026-06-07T22:10:00Z',
  },
  {
    id: 5, articleId: 6, serieId: null, epNum: null,
    userId: 'u-aiz', username: 'Aiz_Wallenstein', isLocal: false, status: 'approved',
    text: 'Merci pour les sous-titres stylés, le timing est vraiment bien travaillé cette saison.',
    likes: 17, createdAt: '2026-06-07T20:00:00Z',
  },
  {
    id: 6, articleId: 6, serieId: null, epNum: null,
    userId: 'u-eina', username: 'Eina_Tulle', isLocal: false, status: 'approved',
    text: 'L\'arc du Dungeon profond commence enfin, c\'est celui que j\'attendais le plus.',
    likes: 9, createdAt: '2026-06-07T17:30:00Z',
  },
  {
    id: 7, articleId: 6, serieId: null, epNum: null,
    userId: 'u-lili', username: 'Liliruca_P', isLocal: false, status: 'approved',
    text: 'Chaque saison la qualité s\'améliore, bravo à toute l\'équipe de sub.',
    likes: 12, createdAt: '2026-06-07T15:00:00Z',
  },
  {
    id: 8, articleId: 6, serieId: null, epNum: null,
    userId: 'u-welf', username: 'Welf_Crozzo', isLocal: false, status: 'approved',
    text: 'Je regardais les raws en attendant mais maintenant c\'est officiel, je peux savourer 🔥',
    likes: 6, createdAt: '2026-06-07T13:00:00Z',
  },
  {
    id: 9, articleId: 6, serieId: null, epNum: null,
    userId: 'local-dan1', username: 'danmachi_lover', isLocal: true, status: 'pending',
    text: 'Super travail comme toujours ! Est-ce que la saison 2 est prévue bientôt ?',
    likes: 0, createdAt: '2026-06-08T09:10:00Z',
  },
  {
    id: 10, articleId: 6, serieId: null, epNum: null,
    userId: 'u-freya', username: 'Freya_Sama', isLocal: false, status: 'approved',
    text: 'Franchement incroyable la vitesse de sortie. Vous êtes les meilleurs fansubbers FR !',
    likes: 44, createdAt: '2026-06-07T10:00:00Z',
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // Article 5 — Recrutement (10 commentaires)
  // ══════════════════════════════════════════════════════════════════════════════
  {
    id: 11, articleId: 5, serieId: null, epNum: null,
    userId: 'u-kaito', username: 'Kaito_TL', isLocal: false, status: 'approved',
    text: 'Candidature envoyée ! J\'espère pouvoir contribuer au projet 🤞',
    likes: 6, createdAt: '2026-06-05T14:30:00Z',
  },
  {
    id: 12, articleId: 5, serieId: null, epNum: null,
    userId: 'u-sora', username: 'Sora_Z', isLocal: false, status: 'approved',
    text: 'Bonne initiative, on manque souvent de relecteurs sur les gros projets.',
    likes: 11, createdAt: '2026-06-05T16:45:00Z',
  },
  {
    id: 13, articleId: 5, serieId: null, epNum: null,
    userId: 'u-trad01', username: 'Trad_Passionné', isLocal: false, status: 'approved',
    text: 'J\'ai un N1 en japonais mais je ne sais pas encoder, je peux quand même postuler pour la traduction ?',
    likes: 3, createdAt: '2026-06-05T18:00:00Z',
  },
  {
    id: 14, articleId: 5, serieId: null, epNum: null,
    userId: 'u-enc01', username: 'Encoder_Pro', isLocal: false, status: 'approved',
    text: 'Si vous avez besoin d\'un encodeur avec de l\'expérience x265, je suis dispo.',
    likes: 18, createdAt: '2026-06-05T19:30:00Z',
  },
  {
    id: 15, articleId: 5, serieId: null, epNum: null,
    userId: 'u-typo01', username: 'Typo_Kun', isLocal: false, status: 'approved',
    text: 'Je fais du karaoké depuis 2 ans sur Aegisub, est-ce que ça rentre dans le profil « effets » ?',
    likes: 7, createdAt: '2026-06-05T21:00:00Z',
  },
  {
    id: 16, articleId: 5, serieId: null, epNum: null,
    userId: 'u-sub02', username: 'Sub_Veteran', isLocal: false, status: 'approved',
    text: 'Content de voir que le recrutement est ouvert, la scène FR a besoin de sang neuf.',
    likes: 22, createdAt: '2026-06-06T08:00:00Z',
  },
  {
    id: 17, articleId: 5, serieId: null, epNum: null,
    userId: 'u-lect01', username: 'Lecteur_Attentif', isLocal: false, status: 'approved',
    text: 'Est-ce que le travail est rémunéré ou purement bénévole ? Je pose la question pour les gens qui hésitent.',
    likes: 14, createdAt: '2026-06-06T10:30:00Z',
  },
  {
    id: 18, articleId: 5, serieId: null, epNum: null,
    userId: 'u-cheer01', username: 'Fan_Anonyme', isLocal: false, status: 'approved',
    text: 'Bon courage à tous les candidats ! Le projet mérite les meilleurs.',
    likes: 5, createdAt: '2026-06-06T12:00:00Z',
  },
  {
    id: 19, articleId: 5, serieId: null, epNum: null,
    userId: 'local-rec1', username: 'visiteur42', isLocal: true, status: 'pending',
    text: 'Est-ce qu\'il faut avoir un niveau N2 en japonais pour postuler en tant que traducteur ?',
    likes: 0, createdAt: '2026-06-06T09:00:00Z',
  },
  {
    id: 20, articleId: 5, serieId: null, epNum: null,
    userId: 'u-dist01', username: 'Distrib_Chan', isLocal: false, status: 'approved',
    text: 'Vous avez pensé à ouvrir le recrutement sur les serveurs Discord anime FR ? Énorme vivier là-bas.',
    likes: 9, createdAt: '2026-06-06T14:00:00Z',
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // Article 4 — Bilan mensuel (10 commentaires)
  // ══════════════════════════════════════════════════════════════════════════════
  {
    id: 21, articleId: 4, serieId: null, epNum: null,
    userId: 'u-nami', username: 'Nami_Fansub', isLocal: false, status: 'approved',
    text: 'Incroyable le nombre de sorties ce mois-ci. Vous êtes une machine !',
    likes: 33, createdAt: '2026-06-01T10:00:00Z',
  },
  {
    id: 22, articleId: 4, serieId: null, epNum: null,
    userId: 'u-taro', username: 'Taro_DL', isLocal: false, status: 'approved',
    text: 'Le ratio qualité/vitesse est vraiment au top depuis quelques mois.',
    likes: 19, createdAt: '2026-06-01T11:20:00Z',
  },
  {
    id: 23, articleId: 4, serieId: null, epNum: null,
    userId: 'u-luna', username: 'Luna_W', isLocal: false, status: 'approved',
    text: 'Merci pour la transparence sur les stats, ça donne confiance 🙏',
    likes: 27, createdAt: '2026-06-01T13:00:00Z',
  },
  {
    id: 24, articleId: 4, serieId: null, epNum: null,
    userId: 'u-rio01', username: 'Rio_Stats', isLocal: false, status: 'approved',
    text: 'Ces chiffres sont impressionnants. Quelle est la série qui a eu le plus de téléchargements ce mois-ci ?',
    likes: 8, createdAt: '2026-06-01T14:30:00Z',
  },
  {
    id: 25, articleId: 4, serieId: null, epNum: null,
    userId: 'u-max01', username: 'Max_Viewer', isLocal: false, status: 'approved',
    text: 'Chaque mois je me dis que vous ne pourrez pas faire mieux, et à chaque fois vous me prouvez le contraire.',
    likes: 41, createdAt: '2026-06-01T16:00:00Z',
  },
  {
    id: 26, articleId: 4, serieId: null, epNum: null,
    userId: 'u-fen01', username: 'Fen_Animé', isLocal: false, status: 'approved',
    text: 'Le nombre de nouveaux membres de l\'équipe est rassurant, la relève est assurée !',
    likes: 15, createdAt: '2026-06-01T17:00:00Z',
  },
  {
    id: 27, articleId: 4, serieId: null, epNum: null,
    userId: 'u-jade01', username: 'Jade_fr', isLocal: false, status: 'approved',
    text: 'Est-ce qu\'il y aura un bilan annuel à la fin de l\'année ? J\'adorerais voir les stats cumulées.',
    likes: 11, createdAt: '2026-06-01T19:00:00Z',
  },
  {
    id: 28, articleId: 4, serieId: null, epNum: null,
    userId: 'u-stan01', username: 'StanAnimé', isLocal: false, status: 'approved',
    text: 'On voit clairement la progression depuis le lancement. Félicitations à toute l\'équipe 👏',
    likes: 36, createdAt: '2026-06-02T08:00:00Z',
  },
  {
    id: 29, articleId: 4, serieId: null, epNum: null,
    userId: 'u-clo01', username: 'Clo_Sub', isLocal: false, status: 'approved',
    text: 'Le plus impressionnant c\'est que la qualité n\'a pas baissé malgré l\'augmentation du volume.',
    likes: 29, createdAt: '2026-06-02T10:00:00Z',
  },
  {
    id: 30, articleId: 4, serieId: null, epNum: null,
    userId: 'u-pat01', username: 'Patrick_Fansub', isLocal: false, status: 'approved',
    text: 'Continuez comme ça ! Je partage ce bilan dans mon serveur Discord, vous méritez plus de visibilité.',
    likes: 23, createdAt: '2026-06-02T12:00:00Z',
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // Article 3 — Partenariat (10 commentaires)
  // ══════════════════════════════════════════════════════════════════════════════
  {
    id: 31, articleId: 3, serieId: null, epNum: null,
    userId: 'u-rex', username: 'Rex_Animé', isLocal: false, status: 'approved',
    text: 'Super nouvelle, j\'utilise leur service depuis des années, mariage parfait !',
    likes: 15, createdAt: '2026-05-28T09:30:00Z',
  },
  {
    id: 32, articleId: 3, serieId: null, epNum: null,
    userId: 'u-yuki', username: 'Yuki_Fr', isLocal: false, status: 'approved',
    text: 'Est-ce que ça veut dire qu\'on aura des simulcasts plus rapides ?',
    likes: 9, createdAt: '2026-05-28T14:00:00Z',
  },
  {
    id: 33, articleId: 3, serieId: null, epNum: null,
    userId: 'u-nico01', username: 'Nico_Watch', isLocal: false, status: 'approved',
    text: 'Excellente nouvelle ! Le partenariat va permettre de toucher un public bien plus large.',
    likes: 22, createdAt: '2026-05-28T15:30:00Z',
  },
  {
    id: 34, articleId: 3, serieId: null, epNum: null,
    userId: 'u-sara01', username: 'Sara_Otaku', isLocal: false, status: 'approved',
    text: 'J\'espère que ça n\'impactera pas le style de sous-titrage, j\'aime vraiment votre façon de travailler.',
    likes: 18, createdAt: '2026-05-28T17:00:00Z',
  },
  {
    id: 35, articleId: 3, serieId: null, epNum: null,
    userId: 'u-theo01', username: 'Theo_Stream', isLocal: false, status: 'approved',
    text: 'Le streaming légal + vos subs c\'est la combinaison parfaite. Merci pour cette initiative.',
    likes: 31, createdAt: '2026-05-29T08:00:00Z',
  },
  {
    id: 36, articleId: 3, serieId: null, epNum: null,
    userId: 'u-clem01', username: 'Clem_Fansub', isLocal: false, status: 'approved',
    text: 'Ce genre de partenariat ça montre que la scène fansub française est prise au sérieux.',
    likes: 14, createdAt: '2026-05-29T10:00:00Z',
  },
  {
    id: 37, articleId: 3, serieId: null, epNum: null,
    userId: 'u-alex01', username: 'Alex_DD', isLocal: false, status: 'approved',
    text: 'Bravo pour cette collaboration ! Je vais de ce pas m\'abonner à leur service pour les soutenir.',
    likes: 7, createdAt: '2026-05-29T12:00:00Z',
  },
  {
    id: 38, articleId: 3, serieId: null, epNum: null,
    userId: 'u-zoe01', username: 'Zoe_Animé', isLocal: false, status: 'approved',
    text: 'Vous pensez que d\'autres partenariats sont en cours ? Ce serait super d\'avoir encore plus de contenu.',
    likes: 5, createdAt: '2026-05-29T14:30:00Z',
  },
  {
    id: 39, articleId: 3, serieId: null, epNum: null,
    userId: 'local-par1', username: 'curious_viewer', isLocal: true, status: 'pending',
    text: 'Est-ce que le partenariat inclut les animes plus anciens ou seulement les nouvelles sorties ?',
    likes: 0, createdAt: '2026-05-29T16:00:00Z',
  },
  {
    id: 40, articleId: 3, serieId: null, epNum: null,
    userId: 'u-marc01', username: 'Marc_Subs', isLocal: false, status: 'approved',
    text: 'Après des années à regarder vos subs en tant que simple spectateur, voir cette progression est émouvant.',
    likes: 38, createdAt: '2026-05-30T09:00:00Z',
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // Article 2 — Berserk (10 commentaires)
  // ══════════════════════════════════════════════════════════════════════════════
  {
    id: 41, articleId: 2, serieId: null, epNum: null,
    userId: 'u-guts', username: 'Guts_Fan_01', isLocal: false, status: 'approved',
    text: 'Enfin ! On attendait ça depuis si longtemps. Le manga est une masterpiece.',
    likes: 52, createdAt: '2026-05-20T18:00:00Z',
  },
  {
    id: 42, articleId: 2, serieId: null, epNum: null,
    userId: 'u-griffith', username: 'Griffith_Btw', isLocal: false, status: 'approved',
    text: 'L\'adaptation 2016 était décevante, j\'espère que celle-ci sera à la hauteur du manga.',
    likes: 38, createdAt: '2026-05-20T19:30:00Z',
  },
  {
    id: 43, articleId: 2, serieId: null, epNum: null,
    userId: 'u-caska', username: 'Caska_Lover', isLocal: false, status: 'approved',
    text: 'Merci à toute l\'équipe pour ce projet titanesque 🖤',
    likes: 44, createdAt: '2026-05-21T08:00:00Z',
  },
  {
    id: 44, articleId: 2, serieId: null, epNum: null,
    userId: 'u-puck01', username: 'Puck_Elf', isLocal: false, status: 'approved',
    text: 'Berserk en simulcast subé en FR c\'était impensable il y a 5 ans. Bravo à vous.',
    likes: 61, createdAt: '2026-05-21T10:00:00Z',
  },
  {
    id: 45, articleId: 2, serieId: null, epNum: null,
    userId: 'u-schi01', username: 'Schierke_Sub', isLocal: false, status: 'approved',
    text: 'La question c\'est : va-t-on avoir du karaoké sur l\'opening ? J\'espère !',
    likes: 17, createdAt: '2026-05-21T12:00:00Z',
  },
  {
    id: 46, articleId: 2, serieId: null, epNum: null,
    userId: 'u-farn01', username: 'Farnese_TV', isLocal: false, status: 'approved',
    text: 'J\'ai lu le manga 3 fois et je vais quand même tout regarder. C\'est la magie de Berserk.',
    likes: 29, createdAt: '2026-05-21T14:00:00Z',
  },
  {
    id: 47, articleId: 2, serieId: null, epNum: null,
    userId: 'u-ser01', username: 'Serpico_Watcher', isLocal: false, status: 'approved',
    text: 'Merci de prendre soin de cette licence, elle le mérite vraiment.',
    likes: 23, createdAt: '2026-05-22T08:00:00Z',
  },
  {
    id: 48, articleId: 2, serieId: null, epNum: null,
    userId: 'u-void01', username: 'Void_IsGod', isLocal: false, status: 'approved',
    text: 'L\'OST de la saison 1997 reste imbattable, j\'espère que la nouvelle sera à la hauteur.',
    likes: 35, createdAt: '2026-05-22T10:00:00Z',
  },
  {
    id: 49, articleId: 2, serieId: null, epNum: null,
    userId: 'local-ber1', username: 'Berserk_Reader', isLocal: true, status: 'pending',
    text: 'Est-ce qu\'il y aura une version VF également, ou uniquement VOSTFR ?',
    likes: 0, createdAt: '2026-05-22T12:00:00Z',
  },
  {
    id: 50, articleId: 2, serieId: null, epNum: null,
    userId: 'u-ish01', username: 'Isidro_Kun', isLocal: false, status: 'approved',
    text: 'Je suis en train de relire tout le manga pour me préparer. Merci pour cette bonne nouvelle !',
    likes: 19, createdAt: '2026-05-22T14:00:00Z',
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // Article 1 — Lancement du site (10 commentaires)
  // ══════════════════════════════════════════════════════════════════════════════
  {
    id: 51, articleId: 1, serieId: null, epNum: null,
    userId: 'u-first', username: 'Premier_Fan', isLocal: false, status: 'approved',
    text: 'Bienvenue dans le monde du fansub ! Le site est vraiment bien fait.',
    likes: 67, createdAt: '2026-05-01T10:00:00Z',
  },
  {
    id: 52, articleId: 1, serieId: null, epNum: null,
    userId: 'u-veteran', username: 'OldSchool_Sub', isLocal: false, status: 'approved',
    text: 'Ça fait du bien de voir de nouveaux projets sérieux. Good luck à toute l\'équipe !',
    likes: 43, createdAt: '2026-05-01T11:30:00Z',
  },
  {
    id: 53, articleId: 1, serieId: null, epNum: null,
    userId: 'u-new01', username: 'Nouveau_Venu', isLocal: false, status: 'approved',
    text: 'C\'est mon premier groupe fansub que je suis, le design du site est vraiment pro.',
    likes: 31, createdAt: '2026-05-01T13:00:00Z',
  },
  {
    id: 54, articleId: 1, serieId: null, epNum: null,
    userId: 'u-tech01', username: 'Tech_Animé', isLocal: false, status: 'approved',
    text: 'Le site tourne nickel sur mobile, c\'est rare pour des projets fansub, bravo !',
    likes: 25, createdAt: '2026-05-01T15:00:00Z',
  },
  {
    id: 55, articleId: 1, serieId: null, epNum: null,
    userId: 'u-hist01', username: 'Histoire_Sub', isLocal: false, status: 'approved',
    text: 'J\'ai suivi des dizaines de groupes fansub depuis les années 2000. Celui-ci a l\'air parti pour durer.',
    likes: 58, createdAt: '2026-05-01T17:00:00Z',
  },
  {
    id: 56, articleId: 1, serieId: null, epNum: null,
    userId: 'u-amb01', username: 'Ambia_FR', isLocal: false, status: 'approved',
    text: 'Partagé à tous mes contacts otaku ! On va vous suivre de près 👀',
    likes: 14, createdAt: '2026-05-02T09:00:00Z',
  },
  {
    id: 57, articleId: 1, serieId: null, epNum: null,
    userId: 'u-ques01', username: 'Curieux_Kun', isLocal: false, status: 'approved',
    text: 'Quelles séries sont prévues pour les prochains mois ? Vous avez un planning accessible ?',
    likes: 19, createdAt: '2026-05-02T11:00:00Z',
  },
  {
    id: 58, articleId: 1, serieId: null, epNum: null,
    userId: 'u-sou01', username: 'Soutien_Total', isLocal: false, status: 'approved',
    text: 'Je partage et j\'attends les premières sorties avec impatience. Longue vie au groupe !',
    likes: 22, createdAt: '2026-05-02T13:00:00Z',
  },
  {
    id: 59, articleId: 1, serieId: null, epNum: null,
    userId: 'local-lan1', username: 'anime_newbie', isLocal: true, status: 'pending',
    text: 'Est-ce que vous prévoyez de faire des animes pour les plus jeunes aussi ?',
    likes: 0, createdAt: '2026-05-02T14:00:00Z',
  },
  {
    id: 60, articleId: 1, serieId: null, epNum: null,
    userId: 'u-big01', username: 'Big_Fan_FR', isLocal: false, status: 'approved',
    text: 'Bookmarké, Discord rejoint, notifs activées. Je suis ready ! Allez l\'équipe 🚀',
    likes: 77, createdAt: '2026-05-02T16:00:00Z',
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // Commentaires de série (DetailPage — onglet Commentaires)
  // epNum: null = commentaire global sur la série (pas un épisode précis)
  // ══════════════════════════════════════════════════════════════════════════════
  // Naruto — série
  {
    id: 61, articleId: null, serieId: 'naruto', epNum: null,
    userId: 'u-nar1', username: 'Naruto_Fan_FR', isLocal: false, status: 'approved',
    text: 'Un classique indétrônable. Merci pour ce travail de sous-titrage, la traduction est fidèle et fluide.',
    likes: 112, createdAt: '2026-03-15T10:00:00Z',
  },
  {
    id: 62, articleId: null, serieId: 'naruto', epNum: null,
    userId: 'u-nar2', username: 'Kakashi_Sensei', isLocal: false, status: 'approved',
    text: 'Je le regarde pour la 3e fois et à chaque visionnage je remarque des détails que j\'avais manqués. Le sous-titrage aide vraiment.',
    likes: 74, createdAt: '2026-03-20T14:30:00Z',
  },
  {
    id: 63, articleId: null, serieId: 'naruto', epNum: null,
    userId: 'u-nar3', username: 'Jiraiya_Kun', isLocal: false, status: 'approved',
    text: 'Le meilleur groupe fansub FR pour Naruto sans hésiter. Qualité irréprochable.',
    likes: 88, createdAt: '2026-04-01T09:00:00Z',
  },
  {
    id: 64, articleId: null, serieId: 'naruto', epNum: null,
    userId: 'u-nar4', username: 'Tsunade_FR', isLocal: false, status: 'approved',
    text: 'Est-ce que Naruto Shippuden sera disponible aussi ? J\'espère !',
    likes: 56, createdAt: '2026-04-05T16:00:00Z',
  },
  {
    id: 65, articleId: null, serieId: 'naruto', epNum: null,
    userId: 'local-nar1', username: 'nouveau_otaku', isLocal: true, status: 'pending',
    text: 'C\'est mon premier animé, je commence tout juste. Merci pour les subs !',
    likes: 0, createdAt: '2026-04-10T11:00:00Z',
  },
  // DanMachi — série
  {
    id: 66, articleId: null, serieId: 'danmachi', epNum: null,
    userId: 'u-dan1', username: 'Bell_Club', isLocal: false, status: 'approved',
    text: 'DanMachi c\'est vraiment une pépite sous-estimée. Merci de lui donner la visibilité qu\'elle mérite avec des subs FR impeccables.',
    likes: 63, createdAt: '2026-06-05T10:00:00Z',
  },
  {
    id: 67, articleId: null, serieId: 'danmachi', epNum: null,
    userId: 'u-dan2', username: 'Hestia_Is_Bestia', isLocal: false, status: 'approved',
    text: 'La saison 4 est tellement intense, j\'adore suivre ça avec vos sous-titres. Timing parfait.',
    likes: 41, createdAt: '2026-06-06T14:00:00Z',
  },
  {
    id: 68, articleId: null, serieId: 'danmachi', epNum: null,
    userId: 'u-dan3', username: 'Ryuu_Lion_Fan', isLocal: false, status: 'approved',
    text: 'Le world-building de cet animé est incroyable. Vos notes de traducteur sur les termes du Dungeon sont vraiment appréciées.',
    likes: 29, createdAt: '2026-06-07T09:00:00Z',
  },
  {
    id: 69, articleId: null, serieId: 'danmachi', epNum: null,
    userId: 'u-dan4', username: 'Wiene_Cute', isLocal: false, status: 'approved',
    text: 'Merci pour la rapidité ! Je peux regarder le lendemain de la diffusion JP, c\'est top.',
    likes: 37, createdAt: '2026-06-08T08:00:00Z',
  },
  {
    id: 70, articleId: null, serieId: 'danmachi', epNum: null,
    userId: 'local-dan2', username: 'fan_anonyme_dan', isLocal: true, status: 'pending',
    text: 'Est-ce que vous prévoyez de sous-titrer le film aussi ?',
    likes: 0, createdAt: '2026-06-08T13:00:00Z',
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // Commentaires d'épisodes (WatchPage)
  // ══════════════════════════════════════════════════════════════════════════════
  // Naruto — Épisode 1
  {
    id: 71, articleId: null, serieId: 'naruto', epNum: 1,
    userId: 'u-sakura', username: 'Sakura_Haruno', isLocal: false, status: 'approved',
    text: 'L\'épisode qui a tout lancé. La nostalgie à fond 💛',
    likes: 88, createdAt: '2026-04-01T12:00:00Z',
  },
  {
    id: 62, articleId: null, serieId: 'naruto', epNum: 1,
    userId: 'u-sasuke', username: 'Uchiha_Fan', isLocal: false, status: 'approved',
    text: 'Sous-titres impeccables, merci pour la qualité du travail.',
    likes: 34, createdAt: '2026-04-02T09:00:00Z',
  },
  // Naruto — Épisode 2
  {
    id: 63, articleId: null, serieId: 'naruto', epNum: 2,
    userId: 'u-hinata', username: 'Hinata_Hyuga', isLocal: false, status: 'approved',
    text: 'La dynamique entre Naruto et Sasuke est parfaitement retranscrite.',
    likes: 21, createdAt: '2026-04-03T15:00:00Z',
  },
  // DanMachi — Épisode 1
  {
    id: 64, articleId: null, serieId: 'danmachi', epNum: 1,
    userId: 'u-bellc', username: 'Bell_Cranel_Fan', isLocal: false, status: 'approved',
    text: 'Quelle intro ! Le doublage japonais est top, les sous-titres suivent parfaitement.',
    likes: 41, createdAt: '2026-06-08T10:00:00Z',
  },
  {
    id: 65, articleId: null, serieId: 'danmachi', epNum: 1,
    userId: 'u-hestia', username: 'Hestia_Bestia', isLocal: false, status: 'approved',
    text: 'Merci pour la rapidité ! L\'épisode est sorti ce matin et c\'est déjà là 👏',
    likes: 57, createdAt: '2026-06-08T11:30:00Z',
  },
])

// ── Getters (simulant des requêtes GET) ────────────────────────────────────────

// ── Getters publics ────────────────────────────────────────────────────────────

export function getCommentsByArticle(articleId) {
  return commentsStore.filter(
    c => c.articleId === articleId && c.status === 'approved'
  ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export function getCommentsByEpisode(serieId, epNum) {
  return commentsStore.filter(
    c => c.serieId === serieId && c.epNum === epNum && c.status === 'approved'
  ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export function getCommentCount(articleId) {
  return commentsStore.filter(
    c => c.articleId === articleId && c.status === 'approved'
  ).length
}

// ── Getter admin (tous statuts, approved en tête, pending ensuite) ─────────────

export function getCommentsByArticleAdmin(articleId) {
  return commentsStore.filter(
    c => c.articleId === articleId && c.status !== 'rejected'
  ).sort((a, b) => {
    if (a.status === b.status) return new Date(b.createdAt) - new Date(a.createdAt)
    if (a.status === 'pending') return -1
    return 1
  })
}

export function getCommentsBySerie(serieId) {
  return commentsStore.filter(
    c => c.serieId === serieId && c.epNum === null && c.status === 'approved'
  ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export function getCommentsBySerieAdmin(serieId) {
  return commentsStore.filter(
    c => c.serieId === serieId && c.epNum === null && c.status !== 'rejected'
  ).sort((a, b) => {
    if (a.status === b.status) return new Date(b.createdAt) - new Date(a.createdAt)
    if (a.status === 'pending') return -1
    return 1
  })
}

// ── Mutations (simulant des appels API) ────────────────────────────────────────

let _nextId = commentsStore.length + 1

export function addComment({ articleId = null, serieId = null, epNum = null,
                             userId, username, isLocal, text }) {
  const comment = {
    id:        _nextId++,
    articleId,
    serieId,
    epNum,
    userId,
    username,
    isLocal,
    status:    isLocal ? 'pending' : 'approved',
    text,
    likes:     0,
    createdAt: new Date().toISOString(),
  }
  commentsStore.unshift(comment)
  return comment
}

export function approveComment(id) {
  const c = commentsStore.find(c => c.id === id)
  if (c) c.status = 'approved'
}

export function disapproveComment(id) {
  const c = commentsStore.find(c => c.id === id)
  if (c) c.status = 'pending'
}

export function rejectComment(id) {
  const c = commentsStore.find(c => c.id === id)
  if (c) c.status = 'rejected'
}

export function deleteComment(id) {
  const idx = commentsStore.findIndex(c => c.id === id)
  if (idx !== -1) commentsStore.splice(idx, 1)
}

// ── Helpers exportés pour le rendu ────────────────────────────────────────────

export { initials, gradient, relativeDate }
