const router = require('express').Router()
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { User } = require('../models')
const { SECRET } = require('../util/config')

router.post('/', async (req, res, next) => {
  try {
    const { username, password } = req.body

    const user = await User.findOne({
      where: { username }
    })

    if (!user) {
      return res.status(401).json({
        error: 'invalid username or password'
      })
    }

    if (!user.passwordHash) {
      return res.status(401).json({
        error: 'No password hash found for this user'
      })
    }

    const passwordCorrect = await bcryptjs.compare(password, user.passwordHash)

    if (!passwordCorrect) {
      return res.status(401).json({
        error: 'invalid username or password'
      })
    }

    const userForToken = {
      username: user.username,
      id: user.id
    }

    const token = jwt.sign(userForToken, SECRET, { expiresIn: 60 * 60 })

    res.status(200).send({ token, username: user.username, name: user.name })
  } catch (error) {
    next(error)
  }
})

module.exports = router
