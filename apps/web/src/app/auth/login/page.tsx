import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: '登录' };

export default function LoginPage() {
  return (
    <section className="auth-card">
      <span className="eyebrow">Account</span>
      <h1>登录</h1>
      <p>登录表单将在用户认证迭代中实现。</p>
      <Link href="/auth/register">还没有账号？前往注册</Link>
    </section>
  );
}
