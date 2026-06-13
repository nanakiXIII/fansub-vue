<template>
  <div>
    <label class="block text-[11px] font-semibold text-ink-2 mb-1.5">
      Vérification — Question manga
    </label>

    <div
      class="rounded-xl border p-4 transition-colors"
      :class="error ? 'border-red-500/40 bg-red-500/5' : 'border-white/[0.08] bg-bg-2'"
    >
      <!-- Question + bouton rafraîchir -->
      <div class="flex items-start justify-between gap-3 mb-3">
        <p class="text-[12px] font-semibold text-ink-1 leading-snug flex-1">
          <span class="text-orange mr-1">?</span>{{ current.q }}
        </p>
        <button
          type="button"
          @click="pick"
          class="w-7 h-7 flex items-center justify-center rounded-lg bg-bg-3 hover:bg-bg-4 text-ink-3 hover:text-ink-1 transition-colors shrink-0 mt-0.5"
          title="Autre question"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
            <path d="M21 3v5h-5"/>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
            <path d="M8 16H3v5"/>
          </svg>
        </button>
      </div>

      <!-- Réponses -->
      <div class="grid grid-cols-2 gap-1.5">
        <button
          v-for="opt in current.opts"
          :key="opt"
          type="button"
          @click="select(opt)"
          class="text-left px-2.5 py-2 rounded-lg text-[11px] font-medium transition-all border"
          :class="optClass(opt)"
        >
          {{ opt }}
        </button>
      </div>

      <!-- Erreur -->
      <p v-if="error" class="text-[10px] text-red-400 mt-2.5 flex items-center gap-1">
        <svg class="w-3 h-3 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="0.5" fill="currentColor"/>
        </svg>
        {{ error }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

// ── Pool de questions ─────────────────────────────────────────────────────────
const POOL = [
  {
    q:    "Quel est le prénom du héros de Naruto ?",
    a:    "Naruto",
    opts: ["Naruto", "Sasuke", "Kakashi", "Gaara"],
  },
  {
    q:    "Dans One Piece, quel est le rêve de Luffy ?",
    a:    "Devenir Roi des Pirates",
    opts: ["Devenir Roi des Pirates", "Trouver le trésor", "Sauver ses amis", "Conquérir le monde"],
  },
  {
    q:    "De quelle couleur sont les cheveux de Goku en Super Saiyan ?",
    a:    "Doré",
    opts: ["Doré", "Argenté", "Rouge", "Bleu"],
  },
  {
    q:    "Dans L'Attaque des Titans, à quoi servent les murs ?",
    a:    "Protéger les humains des Titans",
    opts: ["Protéger les humains des Titans", "Retenir l'eau", "Délimiter les pays", "Emprisonner les criminels"],
  },
  {
    q:    "Dans Dragon Ball, combien de boules de cristal faut-il réunir ?",
    a:    "7",
    opts: ["7", "4", "12", "3"],
  },
  {
    q:    "Quel animal de compagnie Ash possède-t-il dans Pokémon ?",
    a:    "Pikachu",
    opts: ["Pikachu", "Bulbizarre", "Salameche", "Ronflex"],
  },
  {
    q:    "Dans My Hero Academia, comment appelle-t-on les super-pouvoirs ?",
    a:    "Alter",
    opts: ["Alter", "Nen", "Chakra", "Haki"],
  },
  {
    q:    "Dans Death Note, à quoi sert le cahier ?",
    a:    "Tuer en écrivant un nom",
    opts: ["Tuer en écrivant un nom", "Invoquer des démons", "Voir l'avenir", "Voyager dans le temps"],
  },
  {
    q:    "Dans Fullmetal Alchemist, quel membre du corps Edward a-t-il perdu ?",
    a:    "Son bras et sa jambe",
    opts: ["Son bras et sa jambe", "Ses deux jambes", "Un œil", "Sa main droite"],
  },
  {
    q:    "Dans Naruto, quel animal est lié à Naruto ?",
    a:    "Un renard à neuf queues",
    opts: ["Un renard à neuf queues", "Un serpent", "Une grenouille", "Un loup"],
  },
  {
    q:    "Dans One Piece, que cherche-t-on pour réaliser un vœu ?",
    a:    "Le One Piece",
    opts: ["Le One Piece", "Les 7 étoiles", "Le fruit légendaire", "La carte du monde"],
  },
  {
    q:    "Dans Bleach, Ichigo est un…",
    a:    "Shinigami",
    opts: ["Shinigami", "Vampire", "Démon", "Ninja"],
  },
  {
    q:    "Dans Sword Art Online, dans quel type de jeu les joueurs sont-ils piégés ?",
    a:    "Un jeu vidéo en réalité virtuelle",
    opts: ["Un jeu vidéo en réalité virtuelle", "Un jeu de société", "Une simulation militaire", "Un film interactif"],
  },
  {
    q:    "Dans Pokémon, contre quoi Lance-t-on les Pokéballs ?",
    a:    "Des Pokémon sauvages",
    opts: ["Des Pokémon sauvages", "Des dresseurs ennemis", "Des objets cachés", "Des boss"],
  },
  {
    q:    "Quelle est la couleur du costume de Naruto ?",
    a:    "Orange",
    opts: ["Orange", "Bleu", "Noir", "Rouge"],
  },
  {
    q:    "Dans Dragon Ball Z, comment s'appelle le fils de Goku ?",
    a:    "Gohan",
    opts: ["Gohan", "Vegeta", "Piccolo", "Trunks"],
  },
  {
    q:    "Dans L'Attaque des Titans, comment s'appellent les soldats qui combattent les Titans ?",
    a:    "L'Armée d'exploration",
    opts: ["L'Armée d'exploration", "Les Gardiens", "Les Sentinelles", "Les Chasseurs"],
  },
  {
    q:    "Dans Jujutsu Kaisen, Yuji Itadori avale le doigt de quel démon ?",
    a:    "Ryomen Sukuna",
    opts: ["Ryomen Sukuna", "Mahito", "Geto", "Jogo"],
  },
]

// ── Utilitaires ───────────────────────────────────────────────────────────────
function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

// ── État ──────────────────────────────────────────────────────────────────────
const current  = reactive({ q: '', a: '', opts: [] })
const selected = ref(null)
const error    = ref('')

function pick() {
  const item   = POOL[Math.floor(Math.random() * POOL.length)]
  current.q    = item.q
  current.a    = item.a
  current.opts = shuffle(item.opts)
  selected.value = null
  error.value    = ''
}

function select(opt) {
  selected.value = opt
  error.value    = ''
}

function optClass(opt) {
  if (selected.value === opt) {
    return 'bg-orange/15 border-orange/50 text-orange'
  }
  return 'bg-bg-1 border-white/[0.07] text-ink-2 hover:bg-bg-3 hover:text-ink-1 hover:border-white/15'
}

// ── API publique ──────────────────────────────────────────────────────────────
function validate() {
  if (!selected.value) {
    error.value = 'Sélectionne une réponse.'
    return false
  }
  if (selected.value !== current.a) {
    error.value = 'Mauvaise réponse. Essaie avec cette nouvelle question !'
    pick()
    return false
  }
  return true
}

defineExpose({ validate })
pick()
</script>
