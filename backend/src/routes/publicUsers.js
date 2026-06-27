const express         = require('express')
const mongoose        = require('mongoose')
const User            = require('../models/User')
const Role            = require('../models/Role')
const Achievement     = require('../models/Achievement')
const UserAchievement = require('../models/UserAchievement')
const WatchProgress   = require('../models/WatchProgress')
const Download        = require('../models/Download')
const Comment         = require('../models/Comment')

const router = express.Router()

// GET /api/users/:id — profil public en lecture seule
router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: 'Utilisateur introuvable' })
    }

    const user = await User.findById(req.params.id, 'username avatar isAdmin role activeTitleId createdAt socials favoriteMedia').lean()
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' })

    let roleLabel = null
    let roleColor = null
    if (!user.isAdmin && user.role) {
      const roleDoc = await Role.findOne({ name: user.role }).lean()
      roleLabel = roleDoc?.label ?? null
      roleColor = roleDoc?.color ?? null
    }

    let activeTitle = null
    if (user.activeTitleId) {
      const ach = await Achievement.findById(user.activeTitleId).select('rewardTitle color').lean()
      if (ach?.rewardTitle) activeTitle = { label: ach.rewardTitle, color: ach.color ?? null }
    }

    const [watched, downloads, comments, unlocked] = await Promise.all([
      WatchProgress.countDocuments({ userId: user._id, pct: { $gte: 90 } }),
      Download.countDocuments({ userId: user._id }),
      Comment.countDocuments({ userId: String(user._id), status: 'approved' }),
      UserAchievement.find({ userId: user._id }).sort({ unlockedAt: -1 }).lean(),
    ])

    const achievementDocs = await Achievement.find(
      { _id: { $in: unlocked.map(a => a.achievementId) } },
      'name description icon color rewardTitle'
    ).lean()
    const achievementMap = Object.fromEntries(achievementDocs.map(a => [String(a._id), a]))

    const achievements = unlocked
      .map(a => {
        const def = achievementMap[String(a.achievementId)]
        if (!def) return null
        return {
          id:          String(a.achievementId),
          name:        def.name,
          description: def.description,
          icon:        def.icon,
          color:       def.color,
          rewardTitle: def.rewardTitle,
          unlockedAt:  a.unlockedAt,
        }
      })
      .filter(Boolean)

    res.json({
      id:          String(user._id),
      username:    user.username,
      avatar:      user.avatar,
      isAdmin:     user.isAdmin,
      roleLabel,
      roleColor,
      activeTitle,
      memberSince: user.createdAt,
      stats: { watched, downloads, comments },
      achievements,
      socials: user.socials ?? {},
      favoriteMedia: user.favoriteMedia ?? [],
    })
  } catch (err) { next(err) }
})

module.exports = router
