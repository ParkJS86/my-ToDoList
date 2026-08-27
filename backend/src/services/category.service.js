const pool = require('../db/pool');
const {
  findAllCategories,
  createCategory,
  findCategoryById,
  updateCategory,
  findDefaultCategory,
  countTodosByCategory,
  reassignTodosToDefaultCategory,
  deleteCategory,
} = require('../queries/category.queries');
const { toCategoryDto } = require('../utils/categoryDto');

async function listCategories() {
  const rows = await findAllCategories();
  return rows.map(toCategoryDto);
}

async function create({ name, adminId }) {
  const row = await createCategory({ name, createdBy: adminId });
  console.log('[category] 등록', { adminId, categoryId: row.category_id });
  return toCategoryDto(row);
}

async function update(id, { name, adminId }) {
  const category = await findCategoryById(id);
  if (!category) {
    const e = new Error('존재하지 않는 카테고리입니다.');
    e.status = 404;
    throw e;
  }
  if (category.is_default) {
    const e = new Error('기본 카테고리는 수정할 수 없습니다.');
    e.status = 400;
    throw e;
  }
  const row = await updateCategory(id, { name, updatedBy: adminId });
  console.log('[category] 수정', { adminId, categoryId: id });
  return toCategoryDto(row);
}

async function remove(id, adminId) {
  const category = await findCategoryById(id);
  if (!category) {
    const e = new Error('존재하지 않는 카테고리입니다.');
    e.status = 404;
    throw e;
  }
  if (category.is_default) {
    const e = new Error('기본 카테고리는 삭제할 수 없습니다.');
    e.status = 400;
    throw e;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const defaultCategory = await findDefaultCategory();
    if (!defaultCategory) {
      throw new Error('기본 카테고리가 존재하지 않습니다.');
    }
    const count = await countTodosByCategory(client, id);
    if (count > 0) {
      const reassigned = await reassignTodosToDefaultCategory(client, id, defaultCategory.category_id);
      console.log('[category] Todo 재할당', { fromCategoryId: id, toCategoryId: defaultCategory.category_id, count: reassigned });
    }
    await deleteCategory(client, id);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  console.log('[category] 삭제', { adminId, categoryId: id });
}

module.exports = { listCategories, create, update, remove };
