import { useNavigate } from 'react-router-dom';
import { Modal } from '../../../shared/ui/Modal';
import { TodoForm } from '../../../features/todo-create-edit/ui/TodoForm';

export function TodoCreatePage() {
  const navigate = useNavigate();
  const close = () => navigate('/todos');

  return (
    <Modal isOpen title="Todo 등록" onClose={close}>
      <TodoForm mode="create" onSuccess={close} onCancel={close} />
    </Modal>
  );
}
