'use client';

import Link from 'next/link';

import { useAuth } from './use-auth';

export function ProfilePanel() {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <section className="content-card">
        <span className="eyebrow">Profile</span>
        <h1>正在读取登录状态</h1>
        <p>请稍等片刻。</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="content-card">
        <span className="eyebrow">Profile</span>
        <h1>需要登录后查看个人主页</h1>
        <p>个人主页只展示公开社区身份，不展示邮箱、密码或任何实名信息。</p>
        <div className="actions">
          <Link className="button button-primary" href="/auth/login">
            去登录
          </Link>
          <Link className="button" href="/auth/register">
            注册账号
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="content-card">
      <span className="eyebrow">Profile</span>
      <h1>{user.displayName}</h1>
      <div className="profile-summary" aria-label="当前用户信息">
        <span>公开 ID</span>
        <strong>{user.id}</strong>
        <span>账号状态</span>
        <strong>{user.status}</strong>
      </div>
      <p>这里未来会展示公开资料和发帖记录。实名信息不会出现在个人主页。</p>
    </section>
  );
}
