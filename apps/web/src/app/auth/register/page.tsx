import type { Metadata } from 'next';

import { RegisterForm } from '../../../features/auth';

export const metadata: Metadata = { title: '注册' };

export default function RegisterPage() {
  return (
    <section className="auth-card">
      <span className="eyebrow">Account</span>
      <h1>注册</h1>
      <p>创建社区账号。真实身份核验会作为后续独立步骤处理。</p>
      <RegisterForm />
    </section>
  );
}
