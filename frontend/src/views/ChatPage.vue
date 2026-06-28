<template>
  <div v-if="!chatEnabled" class="max-w-2xl mx-auto px-4 py-16 text-center">
    <strong class="block text-[15px] font-extrabold text-white mb-1.5">Chat désactivé</strong>
    <p class="text-[12px] text-ink-2">Le chat est temporairement désactivé par l'équipe.</p>
  </div>

  <div v-else class="max-w-2xl mx-auto px-4 py-6 h-[calc(100vh-56px)] flex flex-col gap-4">

    <!-- Header -->
    <div v-if="isGundam" class="cp-gh-header">
      <div class="cp-gh-header-mark"></div>
      <div>
        <div class="cp-gh-header-title">Canal de communication</div>
        <div class="cp-gh-header-sys">MODULE-CHAT // TRANSMISSION EN DIRECT</div>
      </div>
      <div class="ml-auto flex items-center gap-1.5 text-[9px] font-mono text-emerald-400">
        <span class="w-1.5 h-1.5 bg-emerald-400 inline-block animate-pulse"></span>
        {{ onlineCount }} connecté{{ onlineCount > 1 ? 's' : '' }}
      </div>
    </div>
    <div v-else class="flex items-center justify-between">
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
      class="flex-1 min-h-0 overflow-y-auto flex flex-col gap-3 p-4"
      :class="isGundam
        ? 'cp-gh-messages'
        : 'bg-bg-1 border border-white/[0.07] rounded-2xl scrollbar-thin'"
    >
      <div v-if="!messages.length" class="flex-1 flex items-center justify-center text-ink-3">
        <span v-if="isGundam" class="font-mono text-[10px] tracking-widest uppercase opacity-50">// Aucune transmission</span>
        <span v-else class="text-[13px]">Aucun message pour l'instant.</span>
      </div>
      <div
        v-for="msg in messages"
        :key="msg._id || msg.tempId"
        class="flex items-start gap-3"
        :class="{ 'cp-gh-msg': isGundam }"
      >
        <!-- Avatar -->
        <div
          :class="[
            'shrink-0 overflow-hidden flex items-center justify-center text-[11px] font-bold text-white',
            isGundam ? 'w-8 h-8' : 'w-8 h-8 rounded-full'
          ]"
          :style="isImageAvatar(msg.avatar) ? {} : { background: msg.avatar || (isGundam ? 'linear-gradient(135deg,#f47521,#fb923c)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)') }"
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
              class="text-[9px] font-bold px-1.5 py-px"
              :class="isGundam ? '' : 'rounded'"
              :style="{ background: (msg.roleColor || '#555') + '30', color: msg.roleColor || '#aaa' }"
            >{{ msg.roleLabel }}</span>
            <span class="text-[10px] text-ink-3 ml-auto shrink-0" :class="{ 'font-mono': isGundam }">{{ formatTime(msg.createdAt) }}</span>
          </div>
          <p class="text-[13px] text-ink-1 break-words leading-relaxed">{{ msg.text }}</p>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-if="errorMsg"
      class="px-3 py-2 text-[11px] text-red-400 bg-red-500/10 border border-red-500/20"
      :class="isGundam ? 'font-mono tracking-wide' : 'rounded-lg'">
      {{ errorMsg }}
    </div>

    <!-- Input -->
    <div
      class="p-3 flex items-center gap-3"
      :class="isGundam ? 'cp-gh-input-wrap' : 'bg-bg-1 border border-white/[0.07] rounded-2xl'"
    >
      <template v-if="isLoggedIn">
        <!-- Avatar utilisateur -->
        <div
          :class="[
            'shrink-0 overflow-hidden flex items-center justify-center text-[11px] font-bold text-white',
            isGundam ? 'w-8 h-8' : 'w-8 h-8 rounded-full'
          ]"
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
          :class="isGundam
            ? 'cp-gh-input'
            : 'flex-1 bg-bg-2 border border-white/[0.08] rounded-xl px-4 py-2 text-[13px] text-ink-1 placeholder:text-ink-3 outline-none focus:border-orange/40 transition-colors'"
        />
        <button
          @click="send"
          :disabled="!draft.trim() || sending"
          :class="isGundam
            ? 'cp-gh-send-btn disabled:opacity-30'
            : 'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-opacity disabled:opacity-30'"
          :style="isGundam ? {} : { background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }"
        >
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </template>
      <div v-else class="flex-1 text-center text-ink-3 py-1"
        :class="isGundam ? 'text-[10px] font-mono tracking-wider uppercase' : 'text-[13px]'">
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
import { layout } from '@/composables/useTheme.js'
import { useBeta } from '@/composables/useBeta.js'

const { chatEnabled } = useBeta()
const { messages, onlineCount, loadHistory, resetUnread, sendMessage: chatSend, socket } = useChat()
const settings   = useSettings()
const isLoggedIn = computed(() => !!settings.uid)
const isGundam   = computed(() => layout.value === 'gundam')

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
  if (!chatEnabled.value) return
  resetUnread()
  await loadHistory()
  nextTick(scrollToBottom)
})
</script>

<style scoped>
/* ── GUNDAM THEME ─────────────────────────────────── */
.cp-gh-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: rgb(var(--color-bg-1));
  border: 1px solid rgba(var(--color-orange), 0.12);
  border-top: 2px solid rgba(var(--color-orange), 0.45);
}
.cp-gh-header-mark {
  width: 3px;
  height: 20px;
  background: rgb(var(--color-orange));
  box-shadow: 0 0 8px rgba(var(--color-orange), 0.6);
  flex-shrink: 0;
}
.cp-gh-header-title {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-family: 'Courier New', monospace;
  color: white;
}
.cp-gh-header-sys {
  font-size: 8px;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgb(var(--color-orange));
  opacity: 0.55;
  margin-top: 2px;
}

.cp-gh-messages {
  background: rgb(var(--color-bg-1));
  border: 1px solid rgba(var(--color-orange), 0.12);
  border-top: none;
  scrollbar-color: rgba(var(--color-orange), 0.35) transparent;
}
.cp-gh-messages::-webkit-scrollbar-thumb {
  border-radius: 0;
  background: rgba(var(--color-orange), 0.35);
}

.cp-gh-msg {
  border-left: 2px solid transparent;
  padding-left: 6px;
  transition: border-color 0.15s;
}
.cp-gh-msg:hover {
  border-left-color: rgba(var(--color-orange), 0.4);
}

.cp-gh-input-wrap {
  background: rgb(var(--color-bg-1));
  border: 1px solid rgba(var(--color-orange), 0.15);
  border-top: none;
}

.cp-gh-input {
  flex: 1;
  background: rgba(var(--color-orange), 0.03);
  border: 1px solid rgba(var(--color-orange), 0.18);
  color: rgb(var(--color-ink-1));
  font-size: 13px;
  padding: 8px 12px;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.cp-gh-input:focus {
  border-color: rgba(var(--color-orange), 0.5);
  box-shadow: 0 0 0 1px rgba(var(--color-orange), 0.12);
}
.cp-gh-input::placeholder { color: rgb(var(--color-ink-3)); }

.cp-gh-send-btn {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(var(--color-orange));
  border: none;
  cursor: pointer;
  clip-path: polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%);
  box-shadow: 0 0 12px rgba(var(--color-orange), 0.4);
  transition: filter 0.15s, box-shadow 0.15s;
}
.cp-gh-send-btn:not(:disabled):hover {
  filter: brightness(1.12);
  box-shadow: 0 0 20px rgba(var(--color-orange), 0.6);
}
.cp-gh-send-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
</style>
