const router = require('express').Router()
require('express-async-errors')
const { body, validationResult } = require('express-validator')
const { Op } = require('sequelize')

const Blog = require('../models/blog')
const User = require('../models/user')
const {
  tokenExtractor,
  sessionChecker
} = require('../util/middleware')

const blogFinder = async (req, res, next) => {
  req.blog = await Blog.findByPk(req.params.id, {
    include: {
      model: User,
      attributes: ['id', 'username', 'name']
    }
  })
  next()
}

router.get('/', async (req, res) => {
  const where = {}
  const search = req.query.search?.trim()
  if (search) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${search}%` } },
      { author: { [Op.iLike]: `%${search}%` } }
    ]
  }
  const blogs = await Blog.findAll({
    attributes: { exclude: ['userId'] },
    include: { model: User, attributes: ['name'] },
    order: [['likes', 'DESC']],
    where
  })
  console.log(JSON.stringify(blogs, null, 2))
  res.json(blogs)
})

router.post(
  '/',
  tokenExtractor,
  sessionChecker,
  body('title').notEmpty().withMessage('Title is required'),
  body('url').isURL().withMessage('URL must be valid'),
  async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const user = req.user
      const blog = await Blog.create({ ...req.body, userId: user.id })
      res.json(blog)
    } catch (error) {
      next(error)
    }
  }
)

router.get('/:id', blogFinder, async (req, res) => {
  res.json(req.blog)
})

router.delete(
  '/:id',
  blogFinder,
  tokenExtractor,
  sessionChecker,
  async (req, res, next) => {
    const { blog, user } = req

    try {
      if (!blog) {
        const error = new Error('Blog not found')
        error.name = 'NotFoundError'
        throw error
      }

      if (blog.userId !== user.id) {
        return res
          .status(401)
          .json({ error: 'You are not authorized to delete this blog' })
      }

      await req.blog.destroy()
      res.status(200).json({ message: 'Blog deleted successfully' })
    } catch (error) {
      next(error)
    }
  }
)

router.put(
  '/:id',
  blogFinder,
  tokenExtractor,
  sessionChecker,
  async (req, res, next) => {
    const { blog, user, body } = req

    if (blog.userId !== user.id) {
      return res
        .status(401)
        .json({ error: 'You are not authorized to update this blog' })
    }

    try {
      if (blog) {
        if (body.likes !== undefined) {
          if (typeof body.likes === 'number') {
            blog.likes = body.likes
            await blog.save()
            res.json(blog)
          } else {
            const error = new Error('Likes field must be a number')
            error.name = 'ValidationError'
            throw error
          }
        } else {
          const error = new Error('Likes field is required')
          error.name = 'ValidationError'
          throw error
        }
      } else {
        const error = new Error('Blog not found')
        error.name = 'NotFoundError'
        throw error
      }
    } catch (error) {
      next(error)
    }
  }
)

module.exports = router
