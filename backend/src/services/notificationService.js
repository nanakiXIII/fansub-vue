const Follow       = require('../models/Follow')
const Notification = require('../models/Notification')
const Series       = require('../models/Series')
const { emitToUser } = require('../socket')

async function notifyFollowers(serieId, { seasonSlug, epNum }) {
  const [follows, serie] = await Promise.all([
    Follow.find({ serieId }).lean(),
    Series.findOne({ id: serieId }).select('title poster seasons episodes').lean(),
  ])
  if (!follows.length || !serie) return

  let epTitle = ''
  if (serie.seasons?.length) {
    const season = serie.seasons.find(s => s.slug === seasonSlug)
    epTitle = season?.episodes?.find(e => e.num === epNum)?.title ?? ''
  } else {
    epTitle = serie.episodes?.find(e => e.num === epNum)?.title ?? ''
  }

  const docs = follows.map(f => ({
    userId:      f.userId,
    serieId,
    serieTitle:  serie.title,
    seriePoster: serie.poster ?? '',
    seasonSlug,
    epNum,
    epTitle,
    read:        false,
  }))

  const created = await Notification.insertMany(docs, { ordered: false })

  for (const notif of created) {
    emitToUser(notif.userId, 'notification:new', notif)
  }
}

module.exports = { notifyFollowers }
