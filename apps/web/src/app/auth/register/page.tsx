import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: '注册' };

export default function RegisterPage() {
  return (
    <section className="auth-card">
      <span className="eyebrow">Account</span>
      <h1>注册</h1>
      <p>注册流程将在用户认证迭代中实现，真实身份核验会作为独立步骤处理。</p>
      <Link href="/auth/login">已有账号？返回登录</Link>
    </section>
  );
}
