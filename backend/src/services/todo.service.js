const { createTodo, findTodosByUserId, findTodoById, updateTodo, deleteTodo } = require('../queries/todo.queries');
const { findDefaultCategory } = require('../queries/category.queries');
const { toTodoDto } = require('../utils/todoDto');

function toYMD(value) {
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return String(value).slice(0, 10);
}

function validateDateRange(startDate, endDate) {
  if (toYMD(startDate) > toYMD(endDate)) {
    const e = new Error('시작일은 종료일보다 늦을 수 없습니다.');
    e.status = 400;
    throw e;
  }
}

async function create({ userId, categoryId, title, memo, startDate, endDate }) {
  validateDateRange(startDate, endDate);
  let finalCategoryId = categoryId;
  if (finalCategoryId === undefined || finalCategoryId === null) {
    const defaultCategory = await findDefaultCategory();
    finalCategoryId = defaultCategory.category_id;
  }
  const row = await createTodo({ userId, categoryId: finalCategoryId, title, memo, startDate, endDate });
  console.log('[todo] 등록', { userId, todoId: row.todo_id });
  return toTodoDto(row);
}

async function list(userId, { categoryId, status } = {}) {
  const rows = await findTodosByUserId(userId, { categoryId: categoryId !== undefined ? Number(categoryId) : undefined });
  let dtos = rows.map((row) => toTodoDto(row));
  if (status !== undefined) {
    dtos = dtos.filter((dto) => dto.status === status);
  }
  return dtos;
}

async function update(todoId, userId, fields) {
  const todo = await findTodoById(todoId);
  if (!todo) {
    const e = new Error('존재하지 않는 Todo입니다.');
    e.status = 404;
    throw e;
  }
  if (todo.user_id !== userId) {
    const e = new Error('본인의 Todo만 수정할 수 있습니다.');
    e.status = 403;
    throw e;
  }
  if (fields.startDate !== undefined || fields.endDate !== undefined) {
    const nextStart = fields.startDate ?? toYMD(todo.start_date);
    const nextEnd = fields.endDate ?? toYMD(todo.end_date);
    validateDateRange(nextStart, nextEnd);
  }
  const row = await updateTodo(todoId, { ...fields, updatedBy: userId });
  console.log('[todo] 수정', { userId, todoId });
  return toTodoDto(row);
}

async function remove(todoId, userId) {
  const todo = await findTodoById(todoId);
  if (!todo) {
    const e = new Error('존재하지 않는 Todo입니다.');
    e.status = 404;
    throw e;
  }
  if (todo.user_id !== userId) {
    const e = new Error('본인의 Todo만 삭제할 수 있습니다.');
    e.status = 403;
    throw e;
  }
  await deleteTodo(todoId);
  console.log('[todo] 삭제', { userId, todoId });
}

module.exports = { create, list, update, remove };
