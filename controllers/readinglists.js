const router = require('express').Router()
require('express-async-errors')
const { body, validationResult } = require('express-validator')

const { ReadingList, User, Blog } = require('../models')
const { tokenExtractor, sessionChecker } = require('../util/middleware')

router.get('/', async (req, res, next) => {
  try {
    const readingLists = await ReadingList.findAll()
    res.json(readingLists)
  } catch (error) {
    next(error)
  }
})

router.post(
  '/',
  tokenExtractor,
  sessionChecker,
  body('userId').isInt().withMessage('User ID must be an integer'),
  body('blogId').isInt().withMessage('Blog ID must be an integer'),
  async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const { userId, blogId } = req.body

      const user = await User.findByPk(userId)
      if (!user) {
        return res.status(400).json({ error: 'User not found' })
      }

      const blog = await Blog.findByPk(blogId)
      if (!blog) {
        return res.status(400).json({ error: 'Blog not found' })
      }

      const readingList = await ReadingList.create(req.body)
      res.json(readingList)
    } catch (error) {
      next(error)
    }
  }
)

router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      const error = new Error('Invalid reading list ID')
      error.name = 'ValidationError'
      throw error
    }

    const readingList = await ReadingList.findByPk(id)
    if (!readingList) {
      const error = new Error('Reading list not found')
      error.name = 'NotFoundError'
      throw error
    }

    res.json(readingList)
  } catch (error) {
    next(error)
  }
})

router.put(
  '/:id',
  tokenExtractor,
  sessionChecker,
  body('read').isBoolean().withMessage('Read must be a boolean'),
  async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const id = parseInt(req.params.id, 10)
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid reading list ID' })
      }

      const readingList = await ReadingList.findByPk(id)
      if (!readingList) {
        return res.status(404).json({ error: 'Reading list not found' })
      }

      if (req.user.id !== readingList.userId) {
        return res
          .status(401)
          .json({ error: 'You are not authorized to update this reading list' })
      }

      readingList.read = req.body.read
      await readingList.save()
      res.json(readingList)
    } catch (error) {
      next(error)
    }
  }
)

module.exports = router
