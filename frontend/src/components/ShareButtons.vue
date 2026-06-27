<template>
  <div class="relative shrink-0" ref="rootRef">
    <button
      type="button"
      @click="open = !open"
      class="share-btn gap-2 text-[12px] btn-outline"
      :class="open ? '!bg-bg-2' : ''"
    >
      <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
      </svg>
      Partager
    </button>

    <Transition name="share-drop">
      <div v-if="open" class="share-dropdown absolute right-0 top-full mt-2 w-52 bg-bg-1 border border-white/[0.1] rounded-xl shadow-2xl overflow-hidden z-30">
        <a :href="twitterUrl" target="_blank" rel="noopener" class="share-item" @click="open = false">
          <svg class="w-3.5 h-3.5 shrink-0 text-ink-3" fill="currentColor" viewBox="0 0 24 24"><path d="M18.9 1.95h3.68l-8.04 9.19L24 22.05h-7.4l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.95h7.58l5.24 6.93 6.08-6.93Zm-1.29 18.1h2.04L6.5 4.07H4.3L17.6 20.05Z"/></svg>
          Partager sur X
        </a>
        <button type="button" class="share-item" @click="copyForDiscord">
          <svg class="w-3.5 h-3.5 shrink-0 text-ink-3" fill="currentColor" viewBox="0 0 24 24"><path d="M20.32 4.37a19.8 19.8 0 0 0-4.93-1.53.07.07 0 0 0-.08.04c-.21.38-.45.87-.62 1.26a18.3 18.3 0 0 0-5.48 0 12.6 12.6 0 0 0-.63-1.26.08.08 0 0 0-.08-.04c-1.7.3-3.36.8-4.93 1.53a.07.07 0 0 0-.03.03C.8 8.47.16 12.43.48 16.33a.08.08 0 0 0 .03.06 20.2 20.2 0 0 0 5.7 2.85.08.08 0 0 0 .08-.03c.44-.6.82-1.23 1.16-1.9a.07.07 0 0 0-.04-.1 13 13 0 0 1-1.86-.88.08.08 0 0 1 0-.13c.13-.09.25-.19.37-.28a.07.07 0 0 1 .08 0c3.9 1.77 8.12 1.77 11.97 0a.07.07 0 0 1 .08 0c.12.1.24.19.37.28a.08.08 0 0 1 0 .13c-.6.34-1.22.63-1.87.88a.08.08 0 0 0-.04.1c.35.67.74 1.3 1.16 1.9a.08.08 0 0 0 .08.03 20.2 20.2 0 0 0 5.7-2.85.08.08 0 0 0 .04-.06c.4-4.5-.5-8.43-2.14-11.93a.06.06 0 0 0-.03-.03ZM8.02 13.95c-1.18 0-2.14-1.07-2.14-2.39 0-1.31.94-2.38 2.14-2.38 1.21 0 2.16 1.08 2.14 2.38 0 1.32-.94 2.39-2.14 2.39Zm7.97 0c-1.17 0-2.14-1.07-2.14-2.39 0-1.31.95-2.38 2.14-2.38 1.21 0 2.16 1.08 2.14 2.38 0 1.32-.93 2.39-2.14 2.39Z"/></svg>
          Copier pour Discord
        </button>
        <button type="button" class="share-item" @click="copyLink">
          <svg class="w-3.5 h-3.5 shrink-0 text-ink-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7.07 0l-2.83 2.83a5 5 0 0 0 7.07 7.07l1.5-1.5"/></svg>
          Copier le lien
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useToast } from '@/composables/useToast.js'

const props = defineProps({
  title: { type: String, default: '' },
})

const open    = ref(false)
const rootRef = ref(null)
const toast   = useToast()

const pageUrl = computed(() => (typeof window !== 'undefined' ? window.location.href : ''))
const twitterUrl = computed(() =>
  `https://twitter.com/intent/tweet?text=${encodeURIComponent(props.title)}&url=${encodeURIComponent(pageUrl.value)}`
)

async function copyLink() {
  try {
    await navigator.clipboard.writeText(pageUrl.value)
    toast.success('Lien copié dans le presse-papiers !')
  } catch {
    toast.error('Impossible de copier le lien')
  }
  open.value = false
}

async function copyForDiscord() {
  try {
    await navigator.clipboard.writeText(`${props.title} — ${pageUrl.value}`)
    toast.success('Copié ! Colle-le dans Discord.')
  } catch {
    toast.error('Impossible de copier')
  }
  open.value = false
}

function onOutsideClick(e) {
  if (rootRef.value && !rootRef.value.contains(e.target)) open.value = false
}
onMounted(() => document.addEventListener('click', onOutsideClick))
onBeforeUnmount(() => document.removeEventListener('click', onOutsideClick))
</script>

<style scoped>
.share-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  font-size: 12px;
  font-weight: 500;
  color: rgb(var(--color-ink-1));
  transition: background 0.15s, color 0.15s;
  cursor: pointer;
  width: 100%;
  text-align: left;
}
.share-item:hover { background: rgba(255, 255, 255, 0.06); color: white; }

.share-drop-enter-active, .share-drop-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.share-drop-enter-from, .share-drop-leave-to { opacity: 0; transform: translateY(-6px) scale(0.97); }
</style>
