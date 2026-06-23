import type { Metadata } from 'next';

import { LoginForm } from '../../../features/auth';

export const metadata: Metadata = { title: '登录' };

export default function LoginPage() {
  return (
    <section className="auth-card">
      <span className="eyebrow">Account</span>
      <h1>登录</h1>
      <p>使用邮箱和密码进入 Turalk。前台只展示社区昵称，不展示真实身份。</p>
      <LoginForm />
    </section>
  );
}
