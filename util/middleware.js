const errorHandler = (err, req, res, next) => {
  console.error(err.name)

  if (
    err.name === 'SequelizeValidationError' ||
    err.name === 'ValidationError'
  ) {
    const message = err.errors
      ? err.errors.map((e) => e.message).join(', ')
      : err.message
    return res
      .status(400)
      .json({ error: 'Validation error', details: message })
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

  return res.status(500).json({ error: 'Internal server error' })
}

module.exports = { errorHandler }
