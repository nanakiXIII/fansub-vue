<template>
  <div class="max-w-2xl mx-auto px-4 py-6 h-[calc(100vh-56px)] flex flex-col gap-4">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-[18px] font-extrabold text-white">Chat</h1>
        <div class="flex items-center gap-1.5 mt-0.5">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
          <span class="text-[11px] text-emerald-400 font-medium">{{ onlineCount }} en ligne</span>
        </div>
      </div>
    </div>

    <!-- Messages -->
    <div
      ref="messagesEl"
      class="flex-1 min-h-0 overflow-y-auto flex flex-col gap-3 bg-bg-1 border border-white/[0.07] rounded-2xl p-4 scrollbar-thin"
    >
      <div v-if="!messages.length" class="flex-1 flex items-center justify-center text-[13px] text-ink-3">
        Aucun message pour l'instant.
      </div>
      <div
        v-for="msg in messages"
        :key="msg._id || msg.tempId"
        class="flex items-start gap-3"
      >
        <!-- Avatar -->
        <div
          class="w-8 h-8 rounded-full shrink-0 overflow-hidden flex items-center justify-center text-[11px] font-bold text-white"
          :style="isImageAvatar(msg.avatar) ? {} : { background: msg.avatar || 'linear-gradient(135deg,#6366f1,#8b5cf6)' }"
        >
          <img loading="lazy" v-if="isImageAvatar(msg.avatar)" :src="msg.avatar" class="w-full h-full object-cover" :alt="msg.username" />
          <span v-else>{{ (msg.username || '?').slice(0, 2).toUpperCase() }}</span>
        </div>

        <!-- Contenu -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-0.5 flex-wrap">
            <span class="text-[12px] font-bold text-white">{{ msg.username }}</span>
            <span
              v-if="msg.roleLabel"
              class="text-[9px] font-bold px-1.5 py-px rounded"
              :style="{ background: (msg.roleColor || '#555') + '30', color: msg.roleColor || '#aaa' }"
            >{{ msg.roleLabel }}</span>
            <span class="text-[10px] text-ink-3 ml-auto shrink-0">{{ formatTime(msg.createdAt) }}</span>
          </div>
          <p class="text-[13px] text-ink-1 break-words leading-relaxed">{{ msg.text }}</p>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-if="errorMsg" class="px-3 py-2 text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg">
      {{ errorMsg }}
    </div>

    <!-- Input -->
    <div class="bg-bg-1 border border-white/[0.07] rounded-2xl p-3 flex items-center gap-3">
      <template v-if="isLoggedIn">
        <!-- Avatar utilisateur -->
        <div
          class="w-8 h-8 rounded-full shrink-0 overflow-hidden flex items-center justify-center text-[11px] font-bold text-white"
          :style="isImageAvatar(settings.avatar) ? {} : { background: settings.avatar || 'linear-gradient(135deg,#f97316,#fb923c)' }"
        >
          <img loading="lazy" v-if="isImageAvatar(settings.avatar)" :src="settings.avatar" class="w-full h-full object-cover" />
          <span v-else>{{ (settings.username || '?').slice(0, 2).toUpperCase() }}</span>
        </div>
        <input
          v-model="draft"
          @keydown.enter.prevent="send"
          :disabled="sending"
          maxlength="500"
          placeholder="Votre message…"
          class="flex-1 bg-bg-2 border border-white/[0.08] rounded-xl px-4 py-2 text-[13px] text-ink-1 placeholder:text-ink-3 outline-none focus:border-orange/40 transition-colors"
        />
        <button
          @click="send"
          :disabled="!draft.trim() || sending"
          class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-opacity disabled:opacity-30"
          style="background: linear-gradient(135deg,#6366f1,#8b5cf6)"
        >
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </template>
      <div v-else class="flex-1 text-center text-[13px] text-ink-3 py-1">
        <RouterLink to="/connexion" class="text-orange hover:underline">Connecte-toi</RouterLink>
        pour participer au chat.
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useChat } from '@/composables/useChat.js'
import { useSettings } from '@/composables/useSettings.js'

const { messages, onlineCount, loadHistory, resetUnread, sendMessage: chatSend, socket } = useChat()
const settings   = useSettings()
const isLoggedIn = computed(() => !!settings.uid)

const draft      = ref('')
const sending    = ref(false)
const errorMsg   = ref('')
const messagesEl = ref(null)

let errorTimer = null
function setError(msg) {
  errorMsg.value = msg
  clearTimeout(errorTimer)
  errorTimer = setTimeout(() => { errorMsg.value = '' }, 4000)
}

socket.on('chat:message', () => nextTick(scrollToBottom))
socket.on('chat:history', () => nextTick(scrollToBottom))
socket.on('chat:error', (payload) => {
  const msg = typeof payload === 'string' ? payload : (payload?.message ?? 'Erreur')
  setError(msg)
  sending.value = false
})

function scrollToBottom() {
  if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight
}

function isImageAvatar(val) {
  return typeof val === 'string' && (val.startsWith('http') || val.startsWith('https') || val.startsWith('data:') || val.startsWith('/'))
}

function formatTime(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

async function send() {
  const text = draft.value.trim()
  if (!text || sending.value) return
  sending.value = true
  errorMsg.value = ''
  draft.value = ''
  chatSend(text)
  setTimeout(() => { sending.value = false }, 500)
}

onMounted(async () => {
  resetUnread()
  await loadHistory()
  nextTick(scrollToBottom)
})
</script>
