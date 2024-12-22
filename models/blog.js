const { Model, DataTypes } = require('sequelize')

const { sequelize } = require('../util/db')
const { validateYear } = require('../util/validators')

class Blog extends Model {}

Blog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    author: {
      type: DataTypes.STRING,
      defaultValue: 'Anonymous'
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    year: {
      type: DataTypes.INTEGER,
      validate: {
        isValidYear: validateYear
      }
    }
  },
  {
    sequelize,
    underscored: true,
    timestamps: true,
    modelName: 'blog'
  }
)

module.exports = Blog
