const express       = require('express')
const mongoose      = require('mongoose')
const WatchProgress = require('../models/WatchProgress')
const Download      = require('../models/Download')
const Comment       = require('../models/Comment')
const User          = require('../models/User')

const router = express.Router()

// GET /api/leaderboard — classement public (top visionneurs, téléchargeurs, commentateurs)
router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50)

    const [watchAgg, downloadAgg, commentAgg] = await Promise.all([
      WatchProgress.aggregate([
        { $match: { pct: { $gte: 90 } } },
        { $group: { _id: '$userId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit },
      ]),
      Download.aggregate([
        { $group: { _id: '$userId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit },
      ]),
      Comment.aggregate([
        { $match: { status: 'approved' } },
        { $group: { _id: '$userId', username: { $first: '$username' }, isLocal: { $first: '$isLocal' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit },
      ]),
    ])

    // Visionneurs et téléchargeurs sont toujours des comptes réels (userId ObjectId) → une seule jointure User.
    const accountIds = [...new Set([...watchAgg, ...downloadAgg].map(r => String(r._id)))]
    const accountUsers = await User.find({ _id: { $in: accountIds } }, 'username avatar isAdmin').lean()
    const accountMap = Object.fromEntries(accountUsers.map(u => [String(u._id), u]))

    function mapAccountRows(agg) {
      return agg
        .map(r => {
          const u = accountMap[String(r._id)]
          if (!u) return null
          return { userId: String(r._id), username: u.username, avatar: u.avatar, isAdmin: u.isAdmin, count: r.count }
        })
        .filter(Boolean)
    }

    const topWatchers    = mapAccountRows(watchAgg)
    const topDownloaders = mapAccountRows(downloadAgg)

    // Les commentateurs peuvent être des comptes locaux (non-ObjectId) → username dénormalisé en repli.
    const commenterIds = commentAgg
      .filter(r => !r.isLocal && mongoose.isValidObjectId(r._id))
      .map(r => r._id)
    const commenterUsers = await User.find({ _id: { $in: commenterIds } }, 'username avatar isAdmin').lean()
    const commenterMap = Object.fromEntries(commenterUsers.map(u => [String(u._id), u]))

    const topCommenters = commentAgg.map(r => {
      const u = commenterMap[String(r._id)]
      return {
        userId:   String(r._id),
        username: u?.username ?? r.username,
        avatar:   u?.avatar   ?? null,
        isAdmin:  u?.isAdmin  ?? false,
        count:    r.count,
      }
    })

    res.json({ topWatchers, topDownloaders, topCommenters })
  } catch (err) { next(err) }
})

module.exports = router
