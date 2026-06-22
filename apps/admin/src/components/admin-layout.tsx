import { NavLink, Outlet } from 'react-router-dom';

const navigation = [
  ['概览', '/'],
  ['用户管理', '/users'],
  ['内容管理', '/content'],
  ['举报处理', '/reports'],
  ['审计日志', '/audit-logs'],
] as const;

export function AdminLayout() {
  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <div>
          <span className="product-name">Turalk</span>
          <small>治理后台</small>
        </div>
        <nav aria-label="后台导航">
          {navigation.map(([label, href]) => (
            <NavLink
              className={({ isActive }) => (isActive ? 'active' : undefined)}
              end={href === '/'}
              key={href}
              to={href}
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <p className="sidebar-note">当前为工程占位，尚未启用管理员认证。</p>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
