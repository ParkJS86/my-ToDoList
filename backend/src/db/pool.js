const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.POSTGRES_CONNECTION_STRING,
  max: 20,
});

module.exports = pool;
