import { useUsers } from '../../../entities/user/model/useUsers';
import './AdminUserListPage.css';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ko-KR');
}

export function AdminUserListPage() {
  const users = useUsers();

  return (
    <div className="admin-user-list-page">
      <h2>회원 목록</h2>

      {users.isLoading && <p>불러오는 중...</p>}
      {users.isError && <p>목록을 불러오지 못했습니다.</p>}

      {users.data && (
        <>
          <table className="user-table">
            <thead>
              <tr><th>이메일</th><th>이름</th><th>역할</th><th>가입일</th></tr>
            </thead>
            <tbody>
              {users.data.map((u) => (
                <tr key={u.userId}>
                  <td>{u.email}</td>
                  <td>{u.name}</td>
                  <td>{u.role}</td>
                  <td>{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <ul className="user-card-list">
            {users.data.map((u) => (
              <li key={u.userId} className="user-card">
                <p className="user-card-email">{u.email}</p>
                <p className="user-card-meta">{u.name} · {u.role}</p>
                <p className="user-card-meta">가입일 {formatDate(u.createdAt)}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
