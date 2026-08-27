const pool = require('../db/pool');

// returns: [{ category_id, name, is_default, created_by, created_at, updated_by, updated_at }, ...]
async function findAllCategories() {
  const result = await pool.query('SELECT * FROM categories ORDER BY category_id ASC');
  return result.rows;
}

// returns: created row
async function createCategory({ name, createdBy }) {
  const result = await pool.query(
    'INSERT INTO categories (name, created_by) VALUES ($1, $2) RETURNING *',
    [name, createdBy]
  );
  return result.rows[0];
}

// returns: row | undefined
async function findCategoryById(id) {
  const result = await pool.query('SELECT * FROM categories WHERE category_id = $1', [id]);
  return result.rows[0];
}

// returns: updated row
async function updateCategory(id, { name, updatedBy }) {
  const result = await pool.query(
    'UPDATE categories SET name = $2, updated_by = $3, updated_at = now() WHERE category_id = $1 RETURNING *',
    [id, name, updatedBy]
  );
  return result.rows[0];
}

// returns: row (is_default=true인 카테고리, 없으면 undefined)
async function findDefaultCategory() {
  const result = await pool.query('SELECT * FROM categories WHERE is_default = true');
  return result.rows[0];
}

// 트랜잭션 client로 실행. returns: 참조 중인 todo 개수
async function countTodosByCategory(client, categoryId) {
  const result = await client.query('SELECT COUNT(*)::int AS count FROM todos WHERE category_id = $1', [categoryId]);
  return result.rows[0].count;
}

// 트랜잭션 client로 실행. returns: 재할당된 행 수
async function reassignTodosToDefaultCategory(client, fromCategoryId, toCategoryId) {
  const result = await client.query(
    'UPDATE todos SET category_id = $2, updated_at = now() WHERE category_id = $1',
    [fromCategoryId, toCategoryId]
  );
  return result.rowCount;
}

// 트랜잭션 client로 실행
async function deleteCategory(client, id) {
  await client.query('DELETE FROM categories WHERE category_id = $1', [id]);
}

module.exports = {
  findAllCategories,
  createCategory,
  findCategoryById,
  updateCategory,
  findDefaultCategory,
  countTodosByCategory,
  reassignTodosToDefaultCategory,
  deleteCategory,
};
