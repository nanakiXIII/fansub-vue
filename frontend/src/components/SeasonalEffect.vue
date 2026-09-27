<template>
  <canvas v-if="active" ref="canvasEl" class="seasonal-canvas" aria-hidden="true"></canvas>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useBeta } from '@/composables/useBeta.js'

const { seasonalEffect } = useBeta()
const active = computed(() => seasonalEffect.value === 'snow' || seasonalEffect.value === 'sakura')

const canvasEl = ref(null)
let ctx = null
let particles = []
let rafId = null
let width = 0
let height = 0
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// ── Palette par effet ──────────────────────────────────────────────
function makeParticle() {
  const isSakura = seasonalEffect.value === 'sakura'
  return {
    x: Math.random() * width,
    y: Math.random() * -height,
    size: isSakura ? 6 + Math.random() * 7 : 2 + Math.random() * 3.5,
    speedY: isSakura ? 0.6 + Math.random() * 1.1 : 0.8 + Math.random() * 1.6,
    speedX: isSakura ? (Math.random() - 0.5) * 1.4 : (Math.random() - 0.5) * 0.6,
    sway: Math.random() * Math.PI * 2,
    swaySpeed: 0.01 + Math.random() * 0.02,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * (isSakura ? 0.04 : 0.01),
    opacity: isSakura ? 0.55 + Math.random() * 0.4 : 0.35 + Math.random() * 0.55,
  }
}

function resize() {
  if (!canvasEl.value) return
  width  = window.innerWidth
  height = window.innerHeight
  const dpr = window.devicePixelRatio || 1
  canvasEl.value.width  = width * dpr
  canvasEl.value.height = height * dpr
  canvasEl.value.style.width  = width + 'px'
  canvasEl.value.style.height = height + 'px'
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function drawSnowflake(p) {
  ctx.beginPath()
  ctx.globalAlpha = p.opacity
  ctx.fillStyle = '#ffffff'
  ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2)
  ctx.fill()
}

function drawPetal(p) {
  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.rotate(p.rotation)
  ctx.globalAlpha = p.opacity
  ctx.fillStyle = '#f7a8c4'
  ctx.beginPath()
  ctx.moveTo(0, -p.size / 2)
  ctx.quadraticCurveTo(p.size / 2, -p.size / 4, 0, p.size / 2)
  ctx.quadraticCurveTo(-p.size / 2, -p.size / 4, 0, -p.size / 2)
  ctx.fill()
  ctx.restore()
}

function tick() {
  ctx.clearRect(0, 0, width, height)
  const isSakura = seasonalEffect.value === 'sakura'
  for (const p of particles) {
    p.sway += p.swaySpeed
    p.x += p.speedX + Math.sin(p.sway) * (isSakura ? 0.6 : 0.25)
    p.y += p.speedY
    p.rotation += p.rotationSpeed
    if (p.y > height + 20) { p.y = -20; p.x = Math.random() * width }
    if (p.x > width + 20) p.x = -20
    if (p.x < -20) p.x = width + 20
    isSakura ? drawPetal(p) : drawSnowflake(p)
  }
  ctx.globalAlpha = 1
  rafId = requestAnimationFrame(tick)
}

function start() {
  if (!canvasEl.value) return
  ctx = canvasEl.value.getContext('2d')
  resize()
  const count = seasonalEffect.value === 'sakura' ? 28 : 55
  particles = Array.from({ length: count }, makeParticle)
  window.addEventListener('resize', resize)
  document.addEventListener('visibilitychange', onVisibility)
  if (reduceMotion) {
    // Respecte la préférence système : un rendu statique plutôt qu'une animation continue
    tickOnce()
  } else {
    tick()
  }
}

function tickOnce() {
  ctx.clearRect(0, 0, width, height)
  for (const p of particles) (seasonalEffect.value === 'sakura' ? drawPetal(p) : drawSnowflake(p))
  ctx.globalAlpha = 1
}

function onVisibility() {
  if (document.hidden) { cancelAnimationFrame(rafId); rafId = null }
  else if (!reduceMotion && !rafId) tick()
}

function stop() {
  if (rafId) cancelAnimationFrame(rafId)
  rafId = null
  window.removeEventListener('resize', resize)
  document.removeEventListener('visibilitychange', onVisibility)
}

watch(active, async (val) => {
  stop()
  if (val) {
    await new Promise(r => requestAnimationFrame(r)) // laisse le <canvas> apparaître dans le DOM
    start()
  }
})
watch(seasonalEffect, (val, old) => {
  if (val !== old && active.value) { stop(); start() }
})

onMounted(() => { if (active.value) start() })
onBeforeUnmount(stop)
</script>

<style scoped>
.seasonal-canvas {
  position: fixed;
  inset: 0;
  z-index: 60;
  pointer-events: none;
}
</style>
