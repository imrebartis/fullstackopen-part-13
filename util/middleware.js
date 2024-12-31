const jwt = require('jsonwebtoken')
require('dotenv').config()

const { SECRET } = require('../util/config')
const { User, Session } = require('../models')

const errorHandler = (err, req, res, next) => {
  console.error(err.message)
  if (
    err.name === 'SequelizeValidationError' ||
    err.name === 'ValidationError'
  ) {
    const message = err.errors
      ? err.errors.map((e) => e.message).join(', ')
      : err.message
    return res.status(400).json({ error: 'Validation error' })
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (err.name === 'NotFoundError') {
    return res
      .status(404)
      .json({ error: 'Resource not found' })
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res
      .status(400)
      .json({ error: 'Unique constraint error' })
  }

  return res
    .status(500)
    .json({ error: 'Internal server error' })
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

const verifyToken = (token) => {
  if (!token) {
    const error = new Error('token missing')
    error.statusCode = 401
    throw error
  }

  try {
    return jwt.verify(token, SECRET)
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      error.statusCode = 401
      if (error.message === 'jwt expired') {
        error.customMessage = 'token expired'
      } else {
        error.customMessage = 'invalid token'
      }
    }
    throw error
  }
}

const authenticateUser = async (request, decodedToken) => {
  const user = await User.findByPk(decodedToken.id || decodedToken.userId)

  if (!user) {
    const error = new Error('user not found')
    error.statusCode = 404
    throw error
  }

  return user
}

const sessionChecker = async (request, response, next) => {
  try {
    if (!request.token) {
      return response.status(401).json({ error: 'token missing' })
    }

    const session = await Session.findOne({
      where: { token: request.token },
      include: {
        model: User,
        attributes: ['id', 'username', 'isDisabled']
      }
    })

    if (!session) {
      return response.status(401).json({
        error: 'Session expired. Please log in again.'
      })
    }

    if (session.user.isDisabled) {
      return response.status(401).json({
        error: 'Account is disabled. Please contact support.'
      })
    }

    request.user = session.user
    next()
  } catch (error) {
    next(error)
  }
}

module.exports = {
  errorHandler,
  tokenExtractor,
  unknownEndpoint,
  sessionChecker
}
