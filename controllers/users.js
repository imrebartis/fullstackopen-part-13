const router = require('express').Router()
require('express-async-errors')
const bcryptjs = require('bcryptjs')

const { User, Blog, ReadingList } = require('../models')

router.get('/', async (req, res, next) => {
  try {
    const users = await User.findAll({
      include: {
        model: Blog,
        attributes: { exclude: ['userId', 'createdAt', 'updatedAt'] }
      },
      attributes: { exclude: ['userId', 'passwordHash', 'createdAt', 'updatedAt'] }
    })
    res.json(users)
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { username, password, name } = req.body

    const saltRounds = 10
    const passwordHash = await bcryptjs.hash(password, saltRounds)

    const user = await User.create({
      username,
      name,
      passwordHash
    })

    res.json(user)
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      error.message = 'Username already taken'
    }
    next(error)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      const error = new Error('Invalid user ID')
      error.name = 'ValidationError'
      throw error
    }

    const user = await User.findByPk(id, {
      include: [
        {
          model: Blog,
          as: 'readings',
          attributes: { exclude: ['userId', 'createdAt', 'updatedAt'] },
          through: {
            model: ReadingList,
            as: 'readinglists',
            attributes: ['id', 'read']
          }
        }
      ],
      attributes: {
        exclude: ['userId', 'passwordHash', 'createdAt', 'updatedAt']
      }
    })
    if (user) {
      res.json(user)
    } else {
      const error = new Error('User not found')
      error.name = 'NotFoundError'
      throw error
    }
  } catch (error) {
    next(error)
  }
})

router.put('/:username', async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { username: req.params.username }
    })
    if (user) {
      await user.update(req.body)
      res.json(user)
    } else {
      const error = new Error('User not found')
      error.name = 'NotFoundError'
      throw error
    }
  } catch (error) {
    next(error)
  }
})

router.delete('/:username', async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { username: req.params.username }
    })
    if (user) {
      await user.destroy()
      res.status(204).end()
    } else {
      const error = new Error('User not found')
      error.name = 'NotFoundError'
      throw error
    }
  } catch (error) {
    next(error)
  }
})

module.exports = router
