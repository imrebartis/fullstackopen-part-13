const router = require('express').Router()
require('express-async-errors')

const ReadingList = require('../models/readingList')

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
    const readingList = await ReadingList.create(req.body)
    res.json(readingList)
  } catch (error) {
    next(error)
  }
})

module.exports = router
