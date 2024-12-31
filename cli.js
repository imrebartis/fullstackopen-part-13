const { Sequelize, QueryTypes } = require('sequelize')
require('dotenv').config()

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialectOptions: {
    ssl: false
  },
})

const main = async () => {
  try {
    await sequelize.authenticate()
    console.log('Connection has been established successfully.')

    // Terminate active connections to the database
    await sequelize.query(
      `SELECT pg_terminate_backend(pg_stat_activity.pid)
       FROM pg_stat_activity
       WHERE pg_stat_activity.datname = 'fullstackopen-part-13-db'
         AND pid <> pg_backend_pid();`,
      { type: QueryTypes.RAW }
    )
    console.log('Active connections terminated successfully.')

    // Run the equivalent of \d to describe tables
    const tables = await sequelize.query(
      "SELECT * FROM information_schema.tables WHERE table_schema = 'public';",
      { type: QueryTypes.SELECT }
    )
    console.log('Tables in the public schema:', tables)

    // Create the SequelizeMeta table if it does not exist
    await sequelize.query(
      `CREATE TABLE IF NOT EXISTS "SequelizeMeta" (
        "name" VARCHAR(255) PRIMARY KEY
      );`,
      { type: QueryTypes.RAW }
    )
    console.log('SequelizeMeta table created successfully.')

    // Run the query to check the migrations table
    const migrations = await sequelize.query(
      'SELECT * FROM migrations;',
      { type: QueryTypes.SELECT }
    )
    console.log('Migrations:', migrations)

    // Close the connection after all queries are done
    await sequelize.close()
    console.log('Connection closed successfully.')
  } catch (error) {
    console.error('Unable to connect to the database:', error)
    // Make sure to close the connection even if there's an error
    try {
      await sequelize.close()
    } catch (closeError) {
      console.error('Error while closing connection:', closeError)
    }
  }
}

// Execute the main function
main()