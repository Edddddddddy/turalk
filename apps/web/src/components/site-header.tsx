import Link from 'next/link';

const navigation = [
  ['首页', '/'],
  ['论坛', '/forums'],
  ['实名说明', '/identity'],
  ['登录', '/auth/login'],
] as const;

export function SiteHeader() {
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
      </nav>
    </header>
  );
}
