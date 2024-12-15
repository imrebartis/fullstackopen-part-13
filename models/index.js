const Blog = require('./blog')
const User = require('./user')

const syncDatabase = async () => {
  await Blog.sync({ alter: true })
  await User.sync({ alter: true })
}

syncDatabase()

module.exports = {
  Blog,
  User
}
