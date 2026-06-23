'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useAuth } from '../features/auth';

const navigation = [
  ['首页', '/'],
  ['论坛', '/forums'],
  ['实名说明', '/identity'],
] as const;

export function SiteHeader() {
  const router = useRouter();
  const { loading, logout, user } = useAuth();

  async function handleLogout() {
    await logout();
    router.push('/');
  }

  return (
    <header className="site-header">
      <nav aria-label="主导航" className="nav-shell">
        <Link className="brand" href="/">
          Turalk
        </Link>
        <div className="nav-links">
          {navigation.map(([label, href]) => (
            <Link href={href} key={href}>
              {label}
            </Link>
          ))}
        </div>
        <div className="nav-auth">
          {loading ? (
            <span className="nav-muted">读取中</span>
          ) : user ? (
            <>
              <span className="nav-user">{user.displayName}</span>
              <Link href="/profile">个人页</Link>
              <button
                className="nav-button"
                onClick={handleLogout}
                type="button"
              >
                退出
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login">登录</Link>
              <Link className="nav-strong" href="/auth/register">
                注册
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
