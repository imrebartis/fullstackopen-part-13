const validateYear = (value) => {
  if (value < 1991) {
    throw new Error('Year must be greater than or equal to 1991')
  }
  const currentYear = new Date().getFullYear()
  if (value > currentYear) {
    throw new Error(`Year must be less than or equal to ${currentYear}`)
  }
}

module.exports = { validateYear }
