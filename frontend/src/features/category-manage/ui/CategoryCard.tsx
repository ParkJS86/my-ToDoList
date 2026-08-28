import { useState } from 'react';
import { useUpdateCategory } from '../../../entities/category/model/useUpdateCategory';
import { useDeleteCategory } from '../../../entities/category/model/useDeleteCategory';
import type { Category } from '../../../entities/category/types';

export function CategoryCard({ category }: { category: Category }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(category.name);
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  function handleSave() {
    updateCategory.mutate(
      { categoryId: category.categoryId, payload: { name: draftName } },
      { onSuccess: () => setIsEditing(false) }
    );
  }

  function handleDelete() {
    if (window.confirm('정말 삭제하시겠습니까? 참조 중인 Todo는 기본 카테고리로 재할당됩니다.')) {
      deleteCategory.mutate(category.categoryId);
    }
  }

  return (
    <li className="category-card">
      {isEditing ? (
        <input value={draftName} onChange={(e) => setDraftName(e.target.value)} className="input" />
      ) : (
        <p>{category.name} {category.isDefault && <span className="category-badge-default">기본</span>}</p>
      )}
      <p className="category-card-meta">{category.createdAt.slice(0, 10)}</p>
      <div className="category-card-actions">
        {isEditing ? (
          <>
            <button type="button" onClick={handleSave} disabled={updateCategory.isPending}>저장</button>
            <button type="button" onClick={() => { setIsEditing(false); setDraftName(category.name); }}>취소</button>
          </>
        ) : (
          <button type="button" onClick={() => setIsEditing(true)} disabled={category.isDefault}>수정</button>
        )}
        <button type="button" onClick={handleDelete} disabled={category.isDefault}>삭제</button>
      </div>
    </li>
  );
}
