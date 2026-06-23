'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { FormEvent } from 'react';

import { useAuth } from './use-auth';

export function RegisterForm() {
  const router = useRouter();
  const { error, loading, register } = useAuth();
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (!email || !nickname || !password || !confirmPassword) {
      setFormError('请完整填写注册信息。');
      return;
    }

    if (nickname.trim().length < 2 || nickname.trim().length > 24) {
      setFormError('昵称长度需要在 2 到 24 个字符之间。');
      return;
    }

    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,128}$/.test(password)) {
      setFormError('密码需要 8-128 位，并包含至少一个字母和一个数字。');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('两次输入的密码不一致。');
      return;
    }

    try {
      await register({ email, nickname: nickname.trim(), password });
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
        <span>社区昵称</span>
        <input
          autoComplete="nickname"
          maxLength={24}
          onChange={(event) => setNickname(event.target.value)}
          placeholder="AuthUITest"
          type="text"
          value={nickname}
        />
      </label>
      <label>
        <span>密码</span>
        <input
          autoComplete="new-password"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="至少 8 位，包含字母和数字"
          type="password"
          value={password}
        />
      </label>
      <label>
        <span>确认密码</span>
        <input
          autoComplete="new-password"
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="再次输入密码"
          type="password"
          value={confirmPassword}
        />
      </label>
      <button
        className="button button-primary"
        disabled={loading}
        type="submit"
      >
        {loading ? '注册中...' : '注册并登录'}
      </button>
      <p className="form-hint">
        已有账号？<Link href="/auth/login">返回登录</Link>
      </p>
    </form>
  );
}
