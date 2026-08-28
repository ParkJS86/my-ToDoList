import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTodos } from '../../../entities/todo/model/useTodos';
import { useUpdateTodo } from '../../../entities/todo/model/useUpdateTodo';
import { useDeleteTodo } from '../../../entities/todo/model/useDeleteTodo';
import { useCategories } from '../../../entities/category/model/useCategories';
import { TodoFilter } from '../../../features/todo-filter/ui/TodoFilter';
import type { TodoFilter as TodoFilterType, Todo, TodoStatus } from '../../../entities/todo/types';
import './TodoBoard.css';

function statusClass(status: TodoStatus): string {
  const map: Record<TodoStatus, string> = {
    '시작전': 'status-upcoming',
    '진행중': 'status-active',
    '완료': 'status-done',
    '지연': 'status-overdue',
  };
  return map[status];
}

export function TodoBoard() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<TodoFilterType>({});
  const todos = useTodos(filter);
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();
  const categories = useCategories();
  const categoryMap = new Map((categories.data ?? []).map((c) => [c.categoryId, c.name]));

  return (
    <div className="todo-board">
      <div className="todo-board-toolbar">
        <TodoFilter
          categories={categories.data ?? []}
          categoryId={filter.categoryId}
          status={filter.status}
          onCategoryChange={(categoryId) => setFilter((f) => ({ ...f, categoryId }))}
          onStatusChange={(status) => setFilter((f) => ({ ...f, status }))}
        />
        <button type="button" className="todo-board-add" onClick={() => navigate('/todos/new')}>+ Todo 등록</button>
      </div>

      {todos.isLoading && <p className="todo-board-message">불러오는 중...</p>}
      {todos.isError && <p className="todo-board-message">목록을 불러오지 못했습니다.</p>}
      {!todos.isLoading && !todos.isError && todos.data?.length === 0 && (
        <p className="todo-board-message">표시할 Todo가 없습니다</p>
      )}

      {!todos.isLoading && !todos.isError && todos.data && todos.data.length > 0 && (
        <>
          <table className="todo-table">
            <thead>
              <tr>
                <th></th>
                <th>제목</th>
                <th>카테고리</th>
                <th>상태</th>
                <th>기간</th>
                <th>메모</th>
                <th>편집</th>
                <th>삭제</th>
              </tr>
            </thead>
            <tbody>
              {todos.data.map((todo: Todo) => (
                <tr key={todo.todoId}>
                  <td>
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => updateTodo.mutate({ todoId: todo.todoId, payload: { completed: !todo.completed } })}
                    />
                  </td>
                  <td className={todo.completed ? 'todo-title-done' : ''}>{todo.title}</td>
                  <td>{categoryMap.get(todo.categoryId) ?? '-'}</td>
                  <td><span className={`todo-badge ${statusClass(todo.status)}`}>{todo.status}</span></td>
                  <td>{todo.startDate} ~ {todo.endDate}</td>
                  <td>{todo.memo || '-'}</td>
                  <td><button type="button" onClick={() => navigate(`/todos/${todo.todoId}/edit`)}>편집</button></td>
                  <td>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('정말 삭제하시겠습니까?')) {
                          deleteTodo.mutate(todo.todoId);
                        }
                      }}
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <ul className="todo-card-list">
            {todos.data.map((todo: Todo) => (
              <li key={todo.todoId} className={`todo-card ${statusClass(todo.status)}`}>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => updateTodo.mutate({ todoId: todo.todoId, payload: { completed: !todo.completed } })}
                />
                <div className="todo-card-body">
                  <p className={todo.completed ? 'todo-title-done' : ''}>{todo.title}</p>
                  <p className="todo-card-meta">
                    {categoryMap.get(todo.categoryId) ?? '-'} · <span className={`todo-badge ${statusClass(todo.status)}`}>{todo.status}</span>
                  </p>
                  <p className="todo-card-meta">{todo.startDate} ~ {todo.endDate}</p>
                  {todo.memo && <p className="todo-card-meta">{todo.memo}</p>}
                  <div className="todo-card-actions">
                    <button type="button" onClick={() => navigate(`/todos/${todo.todoId}/edit`)}>편집</button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('정말 삭제하시겠습니까?')) {
                          deleteTodo.mutate(todo.todoId);
                        }
                      }}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
