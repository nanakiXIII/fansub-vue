<template>
  <Teleport to="body">
    <!-- Toggle button -->
    <button
      @click="toggle"
      class="chat-fab"
      :class="{ 'chat-fab--open': open }"
      aria-label="Chat"
    >
      <svg v-if="!open" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
      <span v-if="!open && unread > 0" class="chat-unread-badge">{{ unread > 9 ? '9+' : unread }}</span>
    </button>

    <!-- Panel -->
    <Transition name="chat-panel">
      <div v-if="open" class="chat-panel">
        <!-- Header -->
        <div class="chat-header">
          <div class="flex items-center gap-2">
            <span class="text-[13px] font-bold text-white">Chat</span>
            <span class="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
              {{ onlineCount }} en ligne
            </span>
          </div>
        </div>

        <!-- Messages -->
        <div ref="messagesEl" class="chat-messages">
          <div v-if="messages.length === 0" class="flex-1 flex items-center justify-center text-[12px] text-ink-3 py-8">
            Aucun message.
          </div>
          <div
            v-for="msg in messages"
            :key="msg._id || msg.tempId"
            class="chat-msg"
          >
            <!-- Avatar : image URL ou dégradé avec initiales -->
            <div
              class="w-7 h-7 rounded-full shrink-0 overflow-hidden flex items-center justify-center text-[10px] font-bold text-white"
              :style="isImageAvatar(msg.avatar) ? {} : { background: msg.avatar || 'linear-gradient(135deg,#6366f1,#8b5cf6)' }"
            >
              <img loading="lazy" v-if="isImageAvatar(msg.avatar)" :src="msg.avatar" class="w-full h-full object-cover" :alt="msg.username" />
              <span v-else>{{ (msg.username || '?').slice(0, 2).toUpperCase() }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-1.5 mb-0.5">
                <span class="text-[11px] font-bold text-white truncate">{{ msg.username }}</span>
                <span
                  v-if="msg.roleLabel"
                  class="text-[9px] font-bold px-1 py-px rounded"
                  :style="{ background: (msg.roleColor || '#555') + '30', color: msg.roleColor || '#aaa' }"
                >{{ msg.roleLabel }}</span>
                <span class="text-[9px] text-ink-3 ml-auto shrink-0">{{ formatTime(msg.createdAt) }}</span>
              </div>
              <p class="text-[11px] text-ink-1 break-words leading-relaxed">{{ msg.text }}</p>
            </div>
          </div>
        </div>

        <!-- Error -->
        <div v-if="errorMsg" class="px-3 py-1.5 text-[10px] text-red-400 bg-red-500/10 border-t border-red-500/20">
          {{ errorMsg }}
        </div>

        <!-- Input -->
        <div class="chat-input-area">
          <template v-if="isLoggedIn">
            <input
              v-model="draft"
              @keydown.enter.prevent="sendMessage"
              :disabled="sending"
              maxlength="500"
              placeholder="Votre message…"
              class="chat-input"
            />
            <button @click="sendMessage" :disabled="!draft.trim() || sending" class="chat-send-btn">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </template>
          <div v-else class="text-center w-full text-[11px] text-ink-3 py-2">
            <RouterLink to="/login" class="text-accent-1 hover:underline" @click="open = false">Connectez-vous</RouterLink>
            pour participer au chat.
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useChat } from '@/composables/useChat.js'
import { useSettings } from '@/composables/useSettings.js'

const { messages, unread, onlineCount, loadHistory, resetUnread, sendMessage: chatSend, socket } = useChat()
const settings   = useSettings()
const isLoggedIn = computed(() => !!settings.uid)

const open       = ref(false)
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

function toggle() {
  open.value = !open.value
  if (open.value) {
    resetUnread()
    loadHistory().then(() => nextTick(scrollToBottom))
    setTimeout(scrollToBottom, 280)
  }
}

async function sendMessage() {
  const text = draft.value.trim()
  if (!text || sending.value) return
  sending.value = true
  errorMsg.value = ''
  draft.value = ''
  chatSend(text)
  setTimeout(() => { sending.value = false }, 500)
}

function isImageAvatar(val) {
  return typeof val === 'string' && (val.startsWith('http') || val.startsWith('https') || val.startsWith('data:') || val.startsWith('/'))
}

function scrollToBottom() {
  if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight
}

function formatTime(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

watch(open, (val) => { if (val) resetUnread() })
</script>

<style scoped>
.chat-fab {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 9000;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-accent-1, #6366f1), var(--color-accent-2, #8b5cf6));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.45);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  border: none;
}
.chat-fab:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 28px rgba(99, 102, 241, 0.6);
}
.chat-fab--open {
  background: rgba(255,255,255,0.08);
  box-shadow: 0 2px 12px rgba(0,0,0,0.4);
}

.chat-unread-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  border-radius: 999px;
  background: #ef4444;
  color: white;
  font-size: 9px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.4);
}

.chat-panel {
  position: fixed;
  bottom: 5rem;
  right: 1.5rem;
  z-index: 8999;
  width: 320px;
  max-height: 480px;
  background: #1a1a2e;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.15);
  overflow: hidden;
}

.chat-header {
  padding: 10px 14px;
  background: rgba(99,102,241,0.1);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.1) transparent;
  min-height: 0;
}

.chat-msg {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.chat-input-area {
  padding: 8px 10px;
  border-top: 1px solid rgba(255,255,255,0.06);
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(0,0,0,0.2);
  flex-shrink: 0;
}

.chat-input {
  flex: 1;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  padding: 6px 10px;
  color: white;
  font-size: 12px;
  outline: none;
  transition: border-color 0.15s;
}
.chat-input:focus {
  border-color: rgba(99,102,241,0.5);
}
.chat-input::placeholder { color: rgba(255,255,255,0.3); }

.chat-send-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--color-accent-1, #6366f1), var(--color-accent-2, #8b5cf6));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: opacity 0.15s;
  flex-shrink: 0;
}
.chat-send-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.chat-send-btn:not(:disabled):hover { opacity: 0.85; }

/* Transition */
.chat-panel-enter-active {
  animation: chatPanelIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.chat-panel-leave-active {
  animation: chatPanelOut 0.18s ease-in forwards;
}
@keyframes chatPanelIn {
  from { opacity: 0; transform: translateY(16px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0)    scale(1); }
}
@keyframes chatPanelOut {
  from { opacity: 1; transform: translateY(0)    scale(1); }
  to   { opacity: 0; transform: translateY(12px) scale(0.96); }
}

@media (max-width: 400px) {
  .chat-panel { width: calc(100vw - 2rem); right: 1rem; }
}
</style>
