'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { FormEvent } from 'react';

import { useAuth } from './use-auth';

export function LoginForm() {
  const router = useRouter();
  const { error, loading, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (!email || !password) {
      setFormError('请填写邮箱和密码。');
      return;
    }

    try {
      await login({ email, password });
      router.push('/profile');
    } catch {
      // AuthProvider owns the user-facing API error state.
    }
  }

  const message = formError ?? error;

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {message ? <p className="form-error">{message}</p> : null}
      <label>
        <span>邮箱</span>
        <input
          autoComplete="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="auth-ui-test@example.com"
          type="email"
          value={email}
        />
      </label>
      <label>
        <span>密码</span>
        <input
          autoComplete="current-password"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="至少 8 位，包含字母和数字"
          type="password"
          value={password}
        />
      </label>
      <button
        className="button button-primary"
        disabled={loading}
        type="submit"
      >
        {loading ? '登录中...' : '登录'}
      </button>
      <p className="form-hint">
        还没有账号？<Link href="/auth/register">前往注册</Link>
      </p>
    </form>
  );
}
