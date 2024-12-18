const router = require('express').Router()
require('express-async-errors')
const validator = require('validator')
const { Op } = require('sequelize')

const Blog = require('../models/blog')
const User = require('../models/user')
const middleware = require('../util/middleware')

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
    order: [
      ['likes', 'DESC'],
    ],
    where
  })
  console.log(JSON.stringify(blogs, null, 2))
  res.json(blogs)
})

router.post('/', middleware.tokenExtractor, async (req, res, next) => {
  try {
    const user = await User.findOne()
    const blog = await Blog.create({ ...req.body, userId: user.id })

    const { url } = req.body

    if (!url || !validator.isURL(String(url))) {
      const error = new Error('Invalid URL')
      error.name = 'ValidationError'
      throw error
    }

    res.json(blog)
  } catch (error) {
    next(error)
  }
})

router.get('/:id', blogFinder, async (req, res) => {
  res.json(req.blog)
})

router.delete(
  '/:id',
  blogFinder,
  middleware.tokenExtractor,
  async (req, res, next) => {
    try {
      if (!req.blog) {
        const error = new Error('Blog not found')
        error.name = 'NotFoundError'
        throw error
      }

      if (req.blog.userId !== req.decodedToken.id) {
        return res
          .status(403)
          .json({ error: 'You are not authorized to delete this blog' })
      }

      await req.blog.destroy()
      res.status(200).json({ message: 'Blog deleted successfully' })
    } catch (error) {
      next(error)
    }
  }
)

router.put('/:id', blogFinder, async (req, res, next) => {
  try {
    if (req.blog) {
      if (req.body.likes !== undefined) {
        if (typeof req.body.likes === 'number') {
          req.blog.likes = req.body.likes
          await req.blog.save()
          res.json(req.blog)
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
})

module.exports = router
