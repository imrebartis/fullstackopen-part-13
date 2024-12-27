const jwt = require('jsonwebtoken')
require('dotenv').config()

const { SECRET } = require('../util/config')
const { User } = require('../models')

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

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Unauthorized', details: err.message })
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

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    request.token = authorization.replace('Bearer ', '')
  }
  next()
}

const userExtractor = async (request, response, next) => {
  if (!request.token) {
    return response.status(401).json({ error: 'token missing' })
  }

  let decodedToken

  try {
    decodedToken = jwt.verify(request.token, process.env.SECRET)
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      if (error.message === 'jwt expired') {
        return response.status(401).json({ error: 'token expired' })
      }
      return next({ name: 'JsonWebTokenError', message: 'invalid token' })
    }
    return next(error)
  }

  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }

  const user = await User.findByPk(decodedToken.id)

  if (!user) {
    return response.status(404).json({ error: 'user not found' })
  }

  request.user = user
  next()
}

module.exports = {
  errorHandler,
  tokenExtractor,
  userExtractor,
  unknownEndpoint
}
