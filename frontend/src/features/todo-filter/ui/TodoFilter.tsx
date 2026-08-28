import type { Category } from '../../../entities/category/types';
import type { TodoStatus } from '../../../entities/todo/types';
import './TodoFilter.css';

const STATUS_OPTIONS: { label: string; value: TodoStatus | undefined }[] = [
  { label: '전체', value: undefined },
  { label: '시작전', value: '시작전' },
  { label: '진행중', value: '진행중' },
  { label: '완료', value: '완료' },
  { label: '지연', value: '지연' },
];

interface TodoFilterProps {
  categories: Category[];
  categoryId?: number;
  status?: TodoStatus;
  onCategoryChange: (categoryId?: number) => void;
  onStatusChange: (status?: TodoStatus) => void;
}

export function TodoFilter({ categories, categoryId, status, onCategoryChange, onStatusChange }: TodoFilterProps) {
  return (
    <div className="todo-filter">
      <select
        className="todo-filter-select"
        value={categoryId ?? ''}
        onChange={(e) => onCategoryChange(e.target.value ? Number(e.target.value) : undefined)}
      >
        <option value="">전체 카테고리</option>
        {categories.map((c) => (
          <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
        ))}
      </select>
      <div className="todo-filter-chips">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.label}
            type="button"
            aria-pressed={status === opt.value}
            className={`todo-filter-chip${status === opt.value ? ' todo-filter-chip-active' : ''}`}
            onClick={() => onStatusChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
