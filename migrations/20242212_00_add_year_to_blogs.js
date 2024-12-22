const { DataTypes } = require('sequelize')

const  { validateYear } = require('../util/validators')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('blogs', 'year', {
      type: DataTypes.INTEGER,
      validate: {
        isValidYear: validateYear
      }
    })
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('blogs', 'year')
  }
}
