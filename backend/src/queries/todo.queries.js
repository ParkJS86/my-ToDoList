const pool = require('../db/pool');

async function createTodo({ userId, categoryId, title, memo, startDate, endDate }) {
  const result = await pool.query(
    `INSERT INTO todos (user_id, category_id, title, memo, start_date, end_date)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [userId, categoryId, title, memo ?? null, startDate, endDate]
  );
  return result.rows[0];
}

async function findTodosByUserId(userId, { categoryId } = {}) {
  if (categoryId !== undefined) {
    const result = await pool.query(
      'SELECT * FROM todos WHERE user_id = $1 AND category_id = $2 ORDER BY todo_id ASC',
      [userId, categoryId]
    );
    return result.rows;
  }
  const result = await pool.query('SELECT * FROM todos WHERE user_id = $1 ORDER BY todo_id ASC', [userId]);
  return result.rows;
}

async function findTodoById(id) {
  const result = await pool.query('SELECT * FROM todos WHERE todo_id = $1', [id]);
  return result.rows[0];
}

async function updateTodo(id, { categoryId, title, memo, startDate, endDate, completed, updatedBy }) {
  const result = await pool.query(
    `UPDATE todos
     SET category_id = COALESCE($2, category_id),
         title = COALESCE($3, title),
         memo = COALESCE($4, memo),
         start_date = COALESCE($5, start_date),
         end_date = COALESCE($6, end_date),
         completed = COALESCE($7, completed),
         updated_by = $8,
         updated_at = now()
     WHERE todo_id = $1
     RETURNING *`,
    [id, categoryId ?? null, title ?? null, memo ?? null, startDate ?? null, endDate ?? null, completed ?? null, updatedBy]
  );
  return result.rows[0];
}

async function deleteTodo(id) {
  await pool.query('DELETE FROM todos WHERE todo_id = $1', [id]);
}

module.exports = { createTodo, findTodosByUserId, findTodoById, updateTodo, deleteTodo };
