import { useState, type FormEvent } from 'react';
import { Input } from '../../../shared/ui/Input';
import { Textarea } from '../../../shared/ui/Textarea';
import { Button } from '../../../shared/ui/Button';
import { useCategories } from '../../../entities/category/model/useCategories';
import { useCreateTodo } from '../../../entities/todo/model/useCreateTodo';
import { useUpdateTodo } from '../../../entities/todo/model/useUpdateTodo';
import { isValidDateRange } from '../../../shared/lib/date';
import { HttpError } from '../../../shared/api/httpClient';
import type { Todo } from '../../../entities/todo/types';

interface TodoFormProps {
  mode: 'create' | 'edit';
  todoId?: number;
  initialValues?: Todo;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TodoForm({ mode, todoId, initialValues, onSuccess, onCancel }: TodoFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [categoryId, setCategoryId] = useState<number | undefined>(initialValues?.categoryId);
  const [startDate, setStartDate] = useState(initialValues?.startDate ?? '');
  const [endDate, setEndDate] = useState(initialValues?.endDate ?? '');
  const [memo, setMemo] = useState(initialValues?.memo ?? '');
  const [dateError, setDateError] = useState('');

  const categories = useCategories();
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const mutation = mode === 'create' ? createTodo : updateTodo;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValidDateRange(startDate, endDate)) {
      setDateError('시작일은 종료일보다 늦을 수 없습니다.');
      return;
    }
    setDateError('');

    const payload = { title, memo: memo || null, startDate, endDate, categoryId };

    if (mode === 'create') {
      createTodo.mutate(payload, { onSuccess });
    } else if (todoId !== undefined) {
      updateTodo.mutate({ todoId, payload }, { onSuccess });
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Input label="제목" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <label className="input-field">
        <span className="input-label">카테고리</span>
        <select
          className="input"
          value={categoryId ?? ''}
          onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : undefined)}
        >
          <option value="">기본</option>
          {(categories.data ?? []).map((c) => (
            <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
          ))}
        </select>
      </label>
      <Input label="시작일" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
      <Input label="종료일" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} error={dateError} required />
      <Textarea label="메모" value={memo ?? ''} onChange={(e) => setMemo(e.target.value)} />
      {mutation.isError && (
        <p style={{ color: 'var(--color-danger)', fontSize: 'var(--fs-sm)' }}>
          {mutation.error instanceof HttpError ? mutation.error.message : '저장에 실패했습니다.'}
        </p>
      )}
      <div>
        <Button type="submit" disabled={mutation.isPending}>{mode === 'create' ? '등록' : '저장'}</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>취소</Button>
      </div>
    </form>
  );
}
