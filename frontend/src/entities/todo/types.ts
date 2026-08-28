export type TodoStatus = '시작전' | '진행중' | '완료' | '지연';

export interface Todo {
  todoId: number;
  userId: number;
  categoryId: number;
  title: string;
  memo: string | null;
  startDate: string;
  endDate: string;
  completed: boolean;
  status: TodoStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TodoFilter {
  categoryId?: number;
  status?: TodoStatus;
}

export interface CreateTodoRequest {
  title: string;
  memo?: string | null;
  startDate: string;
  endDate: string;
  categoryId?: number;
}

export interface UpdateTodoRequest {
  title?: string;
  memo?: string | null;
  startDate?: string;
  endDate?: string;
  categoryId?: number;
  completed?: boolean;
}
