import { useNavigate, useParams } from 'react-router-dom';
import { Modal } from '../../../shared/ui/Modal';
import { TodoForm } from '../../../features/todo-create-edit/ui/TodoForm';
import { useTodos } from '../../../entities/todo/model/useTodos';

export function TodoEditPage() {
  const navigate = useNavigate();
  const { todoId } = useParams();
  const todos = useTodos({});
  const todo = todos.data?.find((t) => t.todoId === Number(todoId));
  const close = () => navigate('/todos');

  if (todos.isLoading) {
    return <Modal isOpen title="Todo 편집" onClose={close}><p>불러오는 중...</p></Modal>;
  }
  if (!todo) {
    return <Modal isOpen title="Todo 편집" onClose={close}><p>해당 Todo를 찾을 수 없습니다.</p></Modal>;
  }

  return (
    <Modal isOpen title="Todo 편집" onClose={close}>
      <TodoForm mode="edit" todoId={todo.todoId} initialValues={todo} onSuccess={close} onCancel={close} />
    </Modal>
  );
}
