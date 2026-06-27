const SITE_URL = process.env.SITE_URL || ''

// Couleur orange du thème par défaut (braise), en décimal pour l'embed Discord.
const EMBED_COLOR = 0xf47521

// Envoie une alerte dans le salon Discord configuré quand une actualité est publiée.
// No-op silencieux si aucun webhook n'est configuré, ne doit jamais faire échouer l'appelant.
async function notifyNewsPublished(article) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  if (!webhookUrl) return

  const excerpt = (article.excerpt || article.content?.[0] || '').slice(0, 280)
  const url     = SITE_URL ? `${SITE_URL}/actualite/${article._id}` : undefined

  const embed = {
    title:       article.title,
    description: excerpt || undefined,
    url,
    color:       EMBED_COLOR,
    author:      { name: '📰 Nouvelle actualité' },
    footer:      article.author ? { text: `Par ${article.author}` } : undefined,
    timestamp:   new Date().toISOString(),
  }
  if (article.thumb) embed.thumbnail = { url: article.thumb }

  const res = await fetch(webhookUrl, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ embeds: [embed] }),
  })
  if (!res.ok) throw new Error(`Discord webhook error ${res.status}`)
}

module.exports = { notifyNewsPublished }
