import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../../entities/session/model/authStore';
import { useLogout } from '../../../features/auth/model/useLogout';
import { getTheme, toggleTheme } from '../../../shared/lib/theme';
import { getNavItems } from '../model/getNavItems';
import './NavBar.css';

export function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState(getTheme());
  const currentUser = useAuthStore((state) => state.currentUser);
  const logout = useLogout();
  const items = getNavItems(currentUser?.role);

  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <nav className="navbar">
      <span className="navbar-logo">my-ToDoList</span>
      <button
        className="navbar-toggle"
        onClick={() => setIsOpen((v) => !v)}
        aria-label="메뉴 열기/닫기"
      >
        {isOpen ? '✕' : '☰'}
      </button>
      <div className={`navbar-menu ${isOpen ? 'navbar-menu-open' : ''}`}>
        {/* FE-11/12/13에서 /profile, /admin/users, /admin/categories 실제 페이지 연결 예정 */}
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={closeMenu}
            className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
        <button
          className="nav-link nav-logout"
          onClick={() => {
            closeMenu();
            logout.mutate();
          }}
        >
          로그아웃
        </button>
      </div>
      <button
        className="navbar-theme-toggle"
        onClick={() => setTheme(toggleTheme())}
        aria-label="다크모드/라이트모드 전환"
      >
        {theme === 'dark' ? '🌙' : '☀️'}
      </button>
    </nav>
  );
}
