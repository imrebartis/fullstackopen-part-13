const router = require('express').Router()
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const { User, Session } = require('../models')
const { SECRET } = require('../util/config')

router.post(
  '/',
  body('username').isEmail().withMessage('Username must be a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

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

      const passwordCorrect = await bcryptjs.compare(
        password,
        user.passwordHash
      )

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

      const session = await Session.create({
        userId: user.id,
        token
      })

      userForToken.sessionId = session.id

      res.status(201).send({ token, username: user.username, name: user.name })
    } catch (error) {
      next(error)
    }
  }
)

module.exports = router
