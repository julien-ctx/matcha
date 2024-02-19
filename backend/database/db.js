const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgre',
  host: 'localhost',
  database: 'matcha',
  password: '',
  port: 5432,
});

module.exports = pool;
