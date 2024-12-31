const router = require('express').Router()
const { Session } = require('../models')
const { tokenExtractor } = require('../util/middleware')

router.delete('/', tokenExtractor, async (req, res, next) => {
  try {
    if (!req.token) {
      return res.status(401).json({ error: 'token missing' })
    }

    const session = await Session.findOne({
      where: { token: req.token }
    })

    if (!session) {
      return res.status(404).json({
        error: 'Session not found or already expired'
      })
    }

    await session.destroy()
    res.status(200).json({ message: 'Logged out successfully' })
  } catch (error) {
    next(error)
  }
})

module.exports = router
