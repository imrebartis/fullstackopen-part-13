const jwt = require('jsonwebtoken')
require('dotenv').config()

const { SECRET } = require('../util/config')

const errorHandler = (err, req, res, next) => {
  console.error(err.name)

  if (
    err.name === 'SequelizeValidationError' ||
    err.name === 'ValidationError'
  ) {
    const message = err.errors
      ? err.errors.map((e) => e.message).join(', ')
      : err.message
    return res.status(400).json({ error: 'Validation error', details: message })
  }

  if (err.name === 'NotFoundError') {
    return res
      .status(404)
      .json({ error: 'Resource not found', details: err.message })
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res
      .status(400)
      .json({ error: 'Unique constraint error', details: err.message })
  }

  return res
    .status(500)
    .json({ error: 'Internal server error', details: err.message })
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      req.decodedToken = jwt.verify(authorization.substring(7), SECRET)
    } catch (error) {
      console.log(error)
      return res.status(401).json({ error: 'token invalid' })
    }
  } else {
    return res.status(401).json({ error: 'token missing' })
  }

  next()
}

module.exports = {
  errorHandler,
  tokenExtractor,
  unknownEndpoint
}
