<template>
  <div class="mascot-container select-none" :style="{ width: size + 'px' }">

    <!-- Bulle de dialogue au-dessus de la mascotte -->
    <Transition name="bubble">
      <div v-if="message" class="speech-bubble" :class="bubbleClass">
        {{ message }}
        <span class="bubble-tail" :class="tailClass"/>
      </div>
    </Transition>

    <!-- Image -->
    <div :style="{ width: size + 'px', height: size + 'px' }" class="mascot-img-wrap">
      <img loading="lazy"
        :src="imgSrc"
        :width="size"
        :height="size"
        :alt="`${name} — mascotte`"
        class="mascot-img"
        :class="{ 'mascot-shake': shaking }"
        draggable="false"
      />
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  size:    { type: [Number, String], default: 160 },
  name:    { type: String, default: 'Kurama' },
  message: { type: String, default: '' },
  type:    { type: String, default: 'error' }, // 'error' | 'success' | 'info'
})

const imgSrc = '/a3c51b3b-8ad0-40d7-89c2-9d387f817782.png'

const bubbleClass = computed(() => ({
  'bubble-error':   props.type === 'error',
  'bubble-success': props.type === 'success',
  'bubble-info':    props.type === 'info',
}))

const tailClass = computed(() => ({
  'tail-error':   props.type === 'error',
  'tail-success': props.type === 'success',
  'tail-info':    props.type === 'info',
}))

// Petit shake quand un message d'erreur apparaît
const shaking = ref(false)
watch(() => props.message, (val) => {
  if (val && props.type === 'error') {
    shaking.value = true
    setTimeout(() => { shaking.value = false }, 500)
  }
})
</script>

<style scoped>
.mascot-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

/* ── Bulle ──────────────────────────────────────────── */
.speech-bubble {
  position: relative;
  max-width: 220px;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.45;
  text-align: center;
  margin-bottom: 10px;
  border: 1px solid;
}

.bubble-error   { background: rgb(239 68 68 / 0.12); border-color: rgb(239 68 68 / 0.35); color: #f87171; }
.bubble-success { background: rgb(34 197 94 / 0.12); border-color: rgb(34 197 94 / 0.35); color: #4ade80; }
.bubble-info    { background: rgb(var(--color-orange) / 0.12); border-color: rgb(var(--color-orange) / 0.4); color: rgb(var(--color-orange)); }

/* Queue triangulaire en bas de la bulle */
.bubble-tail {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
}
.tail-error   { border-top: 8px solid rgb(239 68 68 / 0.35); }
.tail-success { border-top: 8px solid rgb(34 197 94 / 0.35); }
.tail-info    { border-top: 8px solid rgb(var(--color-orange) / 0.4); }

/* ── Transitions bulle ──────────────────────────────── */
.bubble-enter-active { transition: all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1); }
.bubble-leave-active { transition: all 0.18s ease-in; }
.bubble-enter-from, .bubble-leave-to {
  opacity: 0;
  transform: translateY(6px) scale(0.9);
}

/* ── Image mascotte ─────────────────────────────────── */
.mascot-img-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}

.mascot-img {
  object-fit: contain;
  animation: mascot-float 3.4s ease-in-out infinite;
  transform-origin: center 90%;
  will-change: transform;
  filter: drop-shadow(0 6px 16px rgba(255, 100, 0, 0.2));
}

@keyframes mascot-float {
  0%   { transform: translateY(0)    scale(1);    }
  25%  { transform: translateY(-7px) scale(0.99); }
  55%  { transform: translateY(-4px) scale(1.02); }
  80%  { transform: translateY(-6px) scale(1.01); }
  100% { transform: translateY(0)    scale(1);    }
}

/* Shake sur erreur */
.mascot-shake {
  animation: mascot-shake 0.48s ease-in-out !important;
}

@keyframes mascot-shake {
  0%, 100% { transform: translateX(0) rotate(0deg); }
  15%       { transform: translateX(-6px) rotate(-3deg); }
  35%       { transform: translateX(6px)  rotate(3deg);  }
  55%       { transform: translateX(-4px) rotate(-2deg); }
  75%       { transform: translateX(4px)  rotate(2deg);  }
  90%       { transform: translateX(-2px) rotate(-1deg); }
}
</style>
