import { useCategories } from '../../../entities/category/model/useCategories';
import { CategoryCreateForm } from '../../../features/category-manage/ui/CategoryCreateForm';
import { CategoryRow } from '../../../features/category-manage/ui/CategoryRow';
import { CategoryCard } from '../../../features/category-manage/ui/CategoryCard';
import './AdminCategoryPage.css';

export function AdminCategoryPage() {
  const categories = useCategories();

  return (
    <div className="admin-category-page">
      <h2>카테고리 관리</h2>
      <CategoryCreateForm />

      {categories.isLoading && <p>불러오는 중...</p>}
      {categories.isError && <p>목록을 불러오지 못했습니다.</p>}

      {categories.data && (
        <>
          <table className="category-table">
            <thead>
              <tr><th>이름</th><th>기본여부</th><th>생성일</th><th>수정</th><th>삭제</th></tr>
            </thead>
            <tbody>
              {categories.data.map((c) => <CategoryRow key={c.categoryId} category={c} />)}
            </tbody>
          </table>
          <ul className="category-card-list">
            {categories.data.map((c) => <CategoryCard key={c.categoryId} category={c} />)}
          </ul>
        </>
      )}

      <p className="category-manage-warning">[!] 삭제 시 해당 카테고리를 사용 중인 Todo는 '기본'으로 자동 재할당됩니다.</p>
    </div>
  );
}
