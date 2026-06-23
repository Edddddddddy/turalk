'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import type { IdentityVerificationStatusDTO } from '@turalk/types';

import { useAuth } from '../auth';
import { identityApi } from '../../lib/api/identity';
import { getAccessToken } from '../../lib/auth/token-storage';

const statusText: Record<IdentityVerificationStatusDTO['status'], string> = {
  EXPIRED: '已过期',
  NOT_STARTED: '尚未开始',
  PENDING: '模拟核验中',
  REJECTED: '未通过',
  VERIFIED: '已通过',
};

export function IdentityPanel() {
  const { loading: authLoading, user } = useAuth();
  const [status, setStatus] = useState<IdentityVerificationStatusDTO | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const withAccessToken = useCallback(
    async (
      action: (accessToken: string) => Promise<IdentityVerificationStatusDTO>,
    ) => {
      const accessToken = getAccessToken();

      if (!accessToken) {
        setError('请先登录后再查看实名认证状态。');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        setStatus(await action(accessToken));
      } catch {
        setError('实名认证模拟请求失败，请稍后再试。');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!user) {
      setStatus(null);
      return;
    }

    void withAccessToken(identityApi.getStatus);
  }, [user, withAccessToken]);

  if (authLoading) {
    return <p className="identity-muted">正在读取登录状态...</p>;
  }

  if (!user) {
    return (
      <div className="identity-panel">
        <p>登录后可以查看模拟实名认证状态。当前页面不会收集身份证号。</p>
        <Link className="button button-primary" href="/auth/login">
          去登录
        </Link>
      </div>
    );
  }

  return (
    <div className="identity-panel">
      {error ? <p className="form-error">{error}</p> : null}
      <div className="profile-summary">
        <span>当前状态</span>
        <strong>{status ? statusText[status.status] : '读取中'}</strong>
        <span>Provider</span>
        <strong>{status?.provider ?? 'mock provider 未启动'}</strong>
        <span>通过时间</span>
        <strong>{status?.verifiedAt ?? '无'}</strong>
      </div>
      <p className="identity-muted">
        Mock provider 只生成非个人身份的 provider token 和
        hash；这些值不会返回到前端。
      </p>
      <div className="actions">
        <button
          className="button button-primary"
          disabled={loading}
          onClick={() => void withAccessToken(identityApi.startMock)}
          type="button"
        >
          {loading ? '处理中...' : '开始模拟核验'}
        </button>
        <button
          className="button"
          disabled={loading || status?.status !== 'PENDING'}
          onClick={() =>
            void withAccessToken((accessToken) =>
              identityApi.completeMock(accessToken, 'verified'),
            )
          }
          type="button"
        >
          模拟通过
        </button>
        <button
          className="button"
          disabled={loading || status?.status !== 'PENDING'}
          onClick={() =>
            void withAccessToken((accessToken) =>
              identityApi.completeMock(accessToken, 'rejected'),
            )
          }
          type="button"
        >
          模拟拒绝
        </button>
      </div>
    </div>
  );
}
