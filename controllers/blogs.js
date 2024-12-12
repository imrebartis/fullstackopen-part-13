const router = require('express').Router()
require('express-async-errors')
const validator = require('validator')

const Blog = require('../models/blog')
const { errorHandler } = require('../util/middleware')

const blogFinder = async (req, res, next) => {
    req.blog = await Blog.findByPk(req.params.id)
    next()
}

router.get('/', async (req, res) => {
  const blogs = await Blog.findAll()
  console.log(JSON.stringify(blogs, null, 2))
  res.json(blogs)
})

router.post('/', async (req, res, next) => {
  try {
    const { url } = req.body

    if (!url || !validator.isURL(String(url))) {
      console.log('Invalid URL')
      const error = new Error('Invalid URL')
      error.name = 'ValidationError'
      throw error
    }

    const blog = await Blog.create(req.body)
    res.json(blog)
  } catch (error) {
    next(error)
  }
})

router.get('/:id', blogFinder, async (req, res) => {
  res.json(req.blog)
})

router.delete('/:id', blogFinder, async (req, res, next) => {
  try {
    if (req.blog) {
      await req.blog.destroy()
      res.status(200).json({ message: 'Blog deleted successfully' })
    } else {
      const error = new Error('Blog not found')
      error.name = 'NotFoundError'
      throw error
    }
  } catch (error) {
    next(error)
  }
})

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

router.use(errorHandler)

module.exports = router
