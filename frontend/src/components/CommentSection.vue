<template>
  <div>
    <!-- En-tête -->
    <div class="section-title mb-4 flex items-center gap-3">
      <span>
        Commentaires
        <span class="text-ink-3 font-normal">({{ total }})</span>
      </span>
      <span v-if="settings.isAdmin" class="flex items-center gap-1.5 text-[10px] font-semibold bg-orange/15 text-orange border border-orange/30 rounded-full px-2.5 py-0.5">
        <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        Mode modération
      </span>
    </div>

    <!-- CAS 1 : vrai compte connecté -->
    <div v-if="settings.uid" class="bg-bg-1 border border-white/[0.06] rounded-xl p-4">
      <template v-if="commentSent">
        <div class="flex items-center gap-2 text-green-400 text-[13px] font-medium py-2">
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          Commentaire publié !
        </div>
      </template>
      <template v-else>
        <div class="flex gap-3">
          <div class="w-9 h-9 rounded-full bg-orange flex items-center justify-center text-[12px] font-bold text-white shrink-0 mt-0.5">
            {{ settings.username?.slice(0,2).toUpperCase() ?? '?' }}
          </div>
          <div class="flex-1 flex flex-col gap-3">
            <textarea v-model="commentText" rows="3" :placeholder="placeholder" class="comment-input"/>
            <AppCaptcha ref="captchaRef"/>
            <div class="flex justify-end">
              <button class="btn-primary text-[12px] py-1.5 px-4" :disabled="!commentText.trim() || submitting" @click="submitComment(false)">
                <svg v-if="submitting" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                {{ submitting ? 'Publication…' : 'Publier' }}
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- CAS 2 : compte local -->
    <div v-else-if="settings.username" class="bg-bg-1 border border-white/[0.06] rounded-xl p-4">
      <div class="flex items-start gap-2 bg-orange/10 border border-orange/25 rounded-lg px-3 py-2.5 mb-4 text-[11px] text-orange leading-snug">
        <svg class="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <span>
          <strong>Compte local</strong> — ton commentaire sera soumis à modération avant d'être publié.
          <RouterLink to="/inscription" class="underline ml-1 hover:text-orange-hover transition-colors">Créer un vrai compte</RouterLink> pour publier immédiatement.
        </span>
      </div>
      <template v-if="commentSent">
        <div class="flex items-center gap-2 text-orange text-[13px] font-medium py-2">
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          Commentaire envoyé — en attente de validation.
        </div>
      </template>
      <template v-else>
        <div class="flex gap-3">
          <div class="w-9 h-9 rounded-full bg-bg-3 border border-white/10 flex items-center justify-center text-[12px] font-bold text-ink-2 shrink-0 mt-0.5">
            {{ settings.username.slice(0,2).toUpperCase() }}
          </div>
          <div class="flex-1 flex flex-col gap-3">
            <textarea v-model="commentText" rows="3" :placeholder="placeholder" class="comment-input"/>
            <AppCaptcha ref="captchaRef"/>
            <div class="flex justify-end">
              <button class="btn-primary text-[12px] py-1.5 px-4" :disabled="!commentText.trim() || submitting" @click="submitComment(true)">
                <svg v-if="submitting" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                {{ submitting ? 'Envoi…' : 'Soumettre à modération' }}
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- CAS 3 : non connecté -->
    <div v-else class="bg-bg-1 border border-white/[0.06] rounded-xl p-6 text-center text-ink-2">
      <div class="text-2xl mb-3">💬</div>
      <div class="text-[13px] font-semibold text-white mb-1">Envie de réagir ?</div>
      <div class="text-[12px] mb-4">Connecte-toi pour rejoindre la discussion et laisser un commentaire.</div>
      <div class="flex items-center justify-center gap-3">
        <RouterLink to="/connexion" class="btn-primary">Se connecter</RouterLink>
        <RouterLink to="/inscription" class="btn-outline">Créer un compte</RouterLink>
      </div>
    </div>

    <!-- Liste des commentaires -->
    <div class="flex flex-col gap-3 mt-5">
      <div
        v-for="(c, i) in comments" :key="c._id ?? c.id"
        class="flex gap-3"
        :class="{ 'opacity-60': c.status === 'rejected' }"
      >
        <div
          class="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold text-white shrink-0"
          :style="{ background: gradient(i) }"
        >
          {{ initials(c.username) }}
        </div>
        <div
          class="flex-1 bg-bg-1 rounded-lg px-3 py-2.5"
          :class="c.status === 'pending' ? 'border border-orange/40' : 'border border-white/[0.06]'"
        >
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <span class="text-[12px] font-semibold text-ink-1">{{ c.username }}</span>
            <span class="text-[10px] text-ink-3">{{ relativeDate(c.createdAt) }}</span>
            <span v-if="settings.isAdmin && c.status === 'pending'"
                  class="text-[9px] font-bold uppercase tracking-wide bg-orange/20 text-orange rounded px-1.5 py-0.5">
              En attente
            </span>
            <span v-else-if="settings.isAdmin && c.status === 'approved'"
                  class="text-[9px] font-bold uppercase tracking-wide bg-green-500/15 text-green-400 rounded px-1.5 py-0.5">
              Approuvé
            </span>
            <span v-if="c.isLocal" class="text-[9px] font-semibold text-ink-3 bg-white/5 rounded px-1.5 py-0.5">local</span>
          </div>
          <p class="text-[12px] leading-relaxed text-ink-2">{{ c.text }}</p>

          <div v-if="settings.isAdmin" class="flex items-center gap-2 mt-2 pt-2 border-t border-white/[0.05]">
            <button v-if="c.status === 'pending'" class="admin-btn admin-btn-approve" @click="approveComment(c._id)">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              Approuver
            </button>
            <button v-if="c.status === 'pending'" class="admin-btn admin-btn-reject" @click="rejectComment(c._id)">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Rejeter
            </button>
            <button v-if="c.status === 'approved'" class="admin-btn admin-btn-disapprove" @click="disapproveComment(c._id)">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
              Désapprouver
            </button>
            <template v-if="confirmDeleteId === c._id">
              <span class="text-[10px] text-ink-2 ml-auto">Êtes-vous sûr ?</span>
              <button class="admin-btn admin-btn-delete-confirm" @click="deleteComment(c._id); confirmDeleteId = null">Oui, supprimer</button>
              <button class="admin-btn admin-btn-cancel" @click="confirmDeleteId = null">Annuler</button>
            </template>
            <button v-else class="admin-btn admin-btn-delete ml-auto" @click="confirmDeleteId = c._id">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Charger plus -->
    <div v-if="currentPage < totalPages" class="flex justify-center mt-4">
      <button
        class="btn-outline text-[12px] py-1.5 px-5 flex items-center gap-2"
        :disabled="loadingMore"
        @click="loadMore"
      >
        <svg v-if="loadingMore" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        {{ loadingMore ? 'Chargement…' : `Charger plus (${total - comments.length} restants)` }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import AppCaptcha from '@/components/AppCaptcha.vue'
import { useSettings } from '@/composables/useSettings.js'
import { userId } from '@/composables/useUserId.js'
import { initials, gradient, relativeDate } from '@/data/comments.js'
import { commentsService } from '@/services/comments.js'

const props = defineProps({
  articleId:   { type: [Number, String], default: null },
  serieId:     { type: String, default: null },
  placeholder: { type: String, default: 'Partage ton avis…' },
})

const emit            = defineEmits(['update:count'])
const settings        = useSettings()
const captchaRef      = ref(null)
const commentText     = ref('')
const submitting      = ref(false)
const commentSent     = ref(false)
const confirmDeleteId = ref(null)
const comments        = ref([])
const total           = ref(0)
const currentPage     = ref(1)
const totalPages      = ref(1)
const loadingMore     = ref(false)

async function fetchPage(page) {
  if (props.articleId !== null) {
    return commentsService.getByArticle(props.articleId, settings.isAdmin, page)
  } else if (props.serieId !== null) {
    return commentsService.getBySerie(props.serieId, settings.isAdmin, page)
  }
  return null
}

async function fetchComments() {
  try {
    const data = await fetchPage(1)
    if (!data) return
    comments.value  = data.comments ?? []
    total.value     = data.total    ?? 0
    currentPage.value  = 1
    totalPages.value   = data.pages ?? 1
    emit('update:count', total.value)
  } catch (err) {
    console.error('Erreur chargement commentaires :', err)
  }
}

async function loadMore() {
  if (loadingMore.value || currentPage.value >= totalPages.value) return
  loadingMore.value = true
  try {
    const next = currentPage.value + 1
    const data = await fetchPage(next)
    if (!data) return
    comments.value.push(...(data.comments ?? []))
    currentPage.value = next
    totalPages.value  = data.pages ?? totalPages.value
  } catch (err) {
    console.error('Erreur chargement commentaires :', err)
  } finally {
    loadingMore.value = false
  }
}

onMounted(fetchComments)
watch(() => settings.isAdmin, fetchComments)

async function submitComment(isLocal) {
  if (!commentText.value.trim()) return
  if (!captchaRef.value?.validate()) return
  submitting.value = true
  try {
    const created = await commentsService.post({
      articleId: props.articleId,
      serieId:   props.serieId,
      epNum:     null,
      userId:    settings.uid ?? userId,
      username:  settings.username,
      isLocal,
      text:      commentText.value.trim(),
    })
    if (created.status === 'approved') {
      comments.value.unshift(created)
      total.value++
      emit('update:count', total.value)
    }
    commentSent.value = true
  } catch (err) {
    console.error('Erreur envoi commentaire :', err)
  } finally {
    submitting.value = false
  }
}

async function approveComment(id) {
  const updated = await commentsService.approve(id)
  const i = comments.value.findIndex(c => c._id === id)
  if (i !== -1) comments.value[i] = updated
}

async function disapproveComment(id) {
  const updated = await commentsService.disapprove(id)
  const i = comments.value.findIndex(c => c._id === id)
  if (i !== -1) comments.value[i] = updated
}

async function rejectComment(id) {
  const updated = await commentsService.reject(id)
  const i = comments.value.findIndex(c => c._id === id)
  if (i !== -1) comments.value[i] = updated
}

async function deleteComment(id) {
  await commentsService.delete(id)
  comments.value = comments.value.filter(c => c._id !== id)
  total.value = Math.max(0, total.value - 1)
  emit('update:count', total.value)
}
</script>

<style scoped>
.comment-input {
  width: 100%;
  background: rgb(var(--color-bg-2));
  border: 1px solid rgb(255 255 255 / 0.1);
  border-radius: 0.5rem;
  padding: 0.6rem 0.75rem;
  font-size: 13px;
  color: rgb(var(--color-ink-1));
  outline: none;
  resize: vertical;
  min-height: 80px;
  transition: border-color 0.15s;
  font-family: inherit;
}
.comment-input::placeholder { color: rgb(var(--color-ink-3)); }
.comment-input:focus { border-color: rgb(var(--color-orange) / 0.6); }

.admin-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 10px;
  font-weight: 600;
  padding: 0.25rem 0.6rem;
  border-radius: 0.35rem;
  border: 1px solid transparent;
  cursor: pointer;
  transition: opacity 0.15s, background 0.15s;
}
.admin-btn:hover { opacity: 0.85; }
.admin-btn-approve      { background: rgb(34 197 94 / 0.12);  color: rgb(74 222 128);   border-color: rgb(34 197 94 / 0.3);  }
.admin-btn-reject       { background: rgb(239 68 68 / 0.1);   color: rgb(252 165 165);  border-color: rgb(239 68 68 / 0.25); }
.admin-btn-disapprove   { background: rgb(99 102 241 / 0.1);  color: rgb(165 180 252);  border-color: rgb(99 102 241 / 0.25);}
.admin-btn-delete       { background: rgb(255 255 255 / 0.04);color: rgb(var(--color-ink-3)); border-color: rgb(255 255 255 / 0.08); }
.admin-btn-delete:hover { background: rgb(239 68 68 / 0.1);   color: rgb(252 165 165);  border-color: rgb(239 68 68 / 0.25); opacity: 1; }
.admin-btn-delete-confirm { background: rgb(239 68 68 / 0.15); color: rgb(252 165 165); border-color: rgb(239 68 68 / 0.4); margin-left: auto; }
.admin-btn-cancel       { background: rgb(255 255 255 / 0.04);color: rgb(var(--color-ink-2)); border-color: rgb(255 255 255 / 0.08); }
</style>
