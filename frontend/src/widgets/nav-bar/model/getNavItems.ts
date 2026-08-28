export interface NavItem {
  label: string;
  to: string;
}

export function getNavItems(role: string | undefined): NavItem[] {
  const base: NavItem[] = [
    { label: 'Todo 목록', to: '/todos' },
    { label: '회원정보수정', to: '/profile' },
  ];
  if (role === 'Admin') {
    base.push({ label: '회원관리', to: '/admin/users' }, { label: '카테고리관리', to: '/admin/categories' });
  }
  return base;
}
