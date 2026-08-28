import { useState, type FormEvent } from 'react';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';
import { useCreateCategory } from '../../../entities/category/model/useCreateCategory';
import { HttpError } from '../../../shared/api/httpClient';

export function CategoryCreateForm() {
  const [name, setName] = useState('');
  const createCategory = useCreateCategory();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    createCategory.mutate({ name }, { onSuccess: () => setName('') });
  }

  return (
    <form onSubmit={handleSubmit} className="category-create-form">
      <Input placeholder="신규 카테고리 이름" value={name} onChange={(e) => setName(e.target.value)} required />
      <Button type="submit" disabled={createCategory.isPending}>추가</Button>
      {createCategory.isError && (
        <p style={{ color: 'var(--color-danger)' }}>
          {createCategory.error instanceof HttpError ? createCategory.error.message : '등록에 실패했습니다.'}
        </p>
      )}
    </form>
  );
}
