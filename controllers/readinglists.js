const router = require('express').Router()
require('express-async-errors')

const {ReadingList, User, Blog } = require('../models')
const { tokenExtractor, userExtractor } = require('../util/middleware')

router.get('/', async (req, res, next) => {
  try {
    const readingLists = await ReadingList.findAll()
    res.json(readingLists)
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    console.log(req.body)
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
})

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

router.put('/:id', tokenExtractor, userExtractor, async (req, res, next) => {
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

    if (req.user.id !== readingList.userId) {
      const error = new Error('Unauthorized')
      error.name = 'UnauthorizedError'
      throw error
    }

    readingList.read = req.body.read
    await readingList.save()
    res.json(readingList)
  } catch (error) {
    next(error)
  }
})

module.exports = router
