const router = require('express').Router()
require('express-async-errors')
const sequelize = require('sequelize')

const Blog = require('../models/blog')

router.get('/', async (req, res, next) => {
  try {
    const authors = await Blog.findAll({
      attributes: [
        'author',
        [sequelize.fn('COUNT', sequelize.col('id')), 'blogs'],
        [sequelize.fn('SUM', sequelize.col('likes')), 'total_likes']
      ],
      group: ['author'],
      order: [[sequelize.literal('total_likes'), 'DESC']]
    })
    res.json(authors)
  } catch (error) {
    next(error)
  }
})

module.exports = router
