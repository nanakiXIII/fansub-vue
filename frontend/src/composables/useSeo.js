import { watchEffect, onUnmounted } from 'vue'
import { config } from '@/config.js'

function upsertMeta(attr, key, content) {
  if (!content) return
  let el = document.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertCanonical(href) {
  if (!href) return
  let el = document.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function upsertLdJson(data) {
  let el = document.querySelector('script[data-ld-json]')
  if (!el) {
    el = document.createElement('script')
    el.type = 'application/ld+json'
    el.setAttribute('data-ld-json', 'true')
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

function resetSeo() {
  const title = config.siteName
  const desc  = config.siteDescription || config.siteTagline
  const img   = config.siteUrl ? `${config.siteUrl}/og-default.jpg` : ''
  document.title = title
  upsertMeta('name',     'description',         desc)
  upsertMeta('property', 'og:title',            title)
  upsertMeta('property', 'og:description',      desc)
  upsertMeta('property', 'og:image',            img)
  upsertMeta('property', 'og:url',              config.siteUrl)
  upsertMeta('property', 'og:type',             'website')
  upsertMeta('name',     'twitter:title',       title)
  upsertMeta('name',     'twitter:description', desc)
  upsertMeta('name',     'twitter:image',       img)
  upsertCanonical(config.siteUrl)
  document.querySelector('script[data-ld-json]')?.remove()
}

export function useSeo(getter) {
  watchEffect(() => {
    const opts = typeof getter === 'function' ? getter() : getter
    if (!opts) return

    const { title, description, image, url, type = 'website', ldJson } = opts
    const fullTitle = title ? `${title} — ${config.siteName}` : config.siteName
    const desc      = description || config.siteDescription || config.siteTagline
    const img       = image || (config.siteUrl ? `${config.siteUrl}/og-default.jpg` : '')
    const pageUrl   = url || config.siteUrl

    document.title = fullTitle
    upsertMeta('name',     'description',         desc)
    upsertMeta('property', 'og:title',            fullTitle)
    upsertMeta('property', 'og:description',      desc)
    upsertMeta('property', 'og:image',            img)
    upsertMeta('property', 'og:url',              pageUrl)
    upsertMeta('property', 'og:type',             type)
    upsertMeta('property', 'og:site_name',        config.siteName)
    upsertMeta('name',     'twitter:card',        'summary_large_image')
    upsertMeta('name',     'twitter:title',       fullTitle)
    upsertMeta('name',     'twitter:description', desc)
    upsertMeta('name',     'twitter:image',       img)
    upsertCanonical(pageUrl)
    if (ldJson) upsertLdJson(ldJson)
  })

  onUnmounted(resetSeo)
}
