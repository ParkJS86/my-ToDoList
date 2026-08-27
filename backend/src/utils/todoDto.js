const { deriveStatus } = require('./todoStatus');

function toYMD(value) {
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return String(value).slice(0, 10);
}

function toTodoDto(row, today) {
  return {
    todoId: row.todo_id,
    userId: row.user_id,
    categoryId: row.category_id,
    title: row.title,
    memo: row.memo,
    startDate: toYMD(row.start_date),
    endDate: toYMD(row.end_date),
    completed: row.completed,
    status: deriveStatus({ completed: row.completed, startDate: row.start_date, endDate: row.end_date }, today),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

module.exports = { toTodoDto };
