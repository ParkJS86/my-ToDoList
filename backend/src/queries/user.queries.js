const pool = require('../db/pool');

// returns: { user_id, email, password_hash, name, role, created_at, updated_at } | undefined
async function findUserByEmail(email) {
  const result = await pool.query(
    'SELECT user_id, email, password_hash, name, role, created_at, updated_at FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0];
}

// returns: { user_id, email, name, role, created_at, updated_at }
async function createUser({ email, passwordHash, name }) {
  const result = await pool.query(
    'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING user_id, email, name, role, created_at, updated_at',
    [email, passwordHash, name]
  );
  return result.rows[0];
}

// returns: { user_id, email, name, role } | undefined
async function findUserById(userId) {
  const result = await pool.query(
    'SELECT user_id, email, name, role FROM users WHERE user_id = $1',
    [userId]
  );
  return result.rows[0];
}

module.exports = { findUserByEmail, createUser, findUserById };
