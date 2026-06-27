<template>
  <div class="bg-bg-1 border border-white/[0.06] rounded-xl overflow-hidden">
    <div class="flex items-center gap-2 px-4 py-3.5 border-b border-white/[0.06]">
      <svg class="w-4 h-4 text-orange shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" v-html="icon"></svg>
      <span class="text-[13px] font-bold text-white">{{ title }}</span>
    </div>
    <div v-if="!rows.length" class="px-4 py-8 text-center text-[12px] text-ink-3">{{ emptyText }}</div>
    <div v-else class="divide-y divide-white/[0.05]">
      <RouterLink
        v-for="(row, i) in rows"
        :key="row.userId"
        :to="`/profil/${row.userId}`"
        class="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors"
      >
        <span class="w-6 shrink-0 text-center text-[13px] font-bold" :class="i < 3 ? 'text-[15px]' : 'text-ink-3'">{{ rankLabel(i) }}</span>
        <div class="w-8 h-8 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-[10px] font-bold text-white"
             :style="isImageUrl(row.avatar) ? {} : { background: row.avatar || defaultAvatar }">
          <img loading="lazy" v-if="isImageUrl(row.avatar)" :src="row.avatar" class="w-full h-full object-cover" />
          <span v-else>{{ initials(row.username) }}</span>
        </div>
        <div class="flex-1 min-w-0 flex items-center gap-1.5">
          <span class="text-[12px] font-semibold text-ink-1 truncate">{{ row.username }}</span>
          <span v-if="row.isAdmin" class="text-[8px] font-bold bg-orange/20 text-orange rounded px-1.5 py-px leading-none shrink-0">ADMIN</span>
        </div>
        <span class="text-[12px] font-bold text-orange shrink-0">{{ row.count }} {{ unit }}</span>
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title:     { type: String, required: true },
  icon:      { type: String, required: true },
  unit:      { type: String, required: true },
  emptyText: { type: String, default: 'Aucune donnée pour le moment.' },
  rows:      { type: Array,  default: () => [] },
})

const defaultAvatar = 'linear-gradient(135deg,#f97316,#fb923c)'

function isImageUrl(val) {
  return typeof val === 'string' && (val.startsWith('http') || val.startsWith('data:'))
}
function initials(name) {
  return (name ?? '').replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase() || '?'
}
function rankLabel(i) {
  return i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`
}
</script>
