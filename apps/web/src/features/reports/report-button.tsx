'use client';

import { useState } from 'react';
import type { ReportReasonCode, ReportTargetType } from '@turalk/types';

import { useAuth } from '../auth';
import { ApiClientError } from '../../lib/api/client';
import { reportsApi } from '../../lib/api/reports';
import { getAccessToken } from '../../lib/auth/token-storage';

interface ReportButtonProps {
  targetId: string;
  targetLabel: string;
  targetType: Extract<ReportTargetType, 'COMMENT' | 'THREAD'>;
}

const reasonOptions: Array<{ label: string; value: ReportReasonCode }> = [
  { label: '垃圾广告', value: 'SPAM' },
  { label: '骚扰攻击', value: 'HARASSMENT' },
  { label: '违法违规', value: 'ILLEGAL_CONTENT' },
  { label: '隐私泄露', value: 'PRIVACY_LEAK' },
  { label: '偏离主题', value: 'OFF_TOPIC' },
  { label: '其他问题', value: 'OTHER' },
];

export function ReportButton({
  targetId,
  targetLabel,
  targetType,
}: ReportButtonProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reasonCode, setReasonCode] = useState<ReportReasonCode>('SPAM');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const accessToken = getAccessToken();

    if (!user || !accessToken) {
      setError('请先登录后再提交举报。');
      return;
    }

    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      await reportsApi.create(accessToken, {
        details: details.trim() || undefined,
        reasonCode,
        targetId,
        targetType,
      });
      setDetails('');
      setMessage('举报已提交，后续会进入人工复核。');
      setOpen(false);
    } catch (caught) {
      if (
        caught instanceof ApiClientError &&
        caught.code === 'REPORT_ALREADY_OPEN'
      ) {
        setError('你已经举报过该内容，尚在处理队列中。');
      } else if (
        caught instanceof ApiClientError &&
        caught.code === 'REPORT_REQUIRES_VERIFIED_IDENTITY'
      ) {
        setError('请先完成模拟实名认证后再提交举报。');
      } else {
        setError('举报提交失败，请稍后再试。');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="report-box">
      <button
        className="nav-button"
        onClick={() => {
          setOpen((current) => !current);
          setError(null);
          setMessage(null);
        }}
        type="button"
      >
        举报
      </button>
      {message ? <span className="report-message">{message}</span> : null}
      {open ? (
        <form className="report-form" onSubmit={handleSubmit}>
          <strong>举报{targetLabel}</strong>
          {error ? <p className="form-error">{error}</p> : null}
          <label>
            <span>原因</span>
            <select
              disabled={submitting}
              onChange={(event) =>
                setReasonCode(event.target.value as ReportReasonCode)
              }
              value={reasonCode}
            >
              {reasonOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>补充说明</span>
            <textarea
              disabled={submitting}
              maxLength={1000}
              onChange={(event) => setDetails(event.target.value)}
              placeholder="可选。请不要粘贴身份证、手机号、真实邮箱等隐私信息。"
              rows={3}
              value={details}
            />
          </label>
          <div className="report-actions">
            <button
              className="button button-primary"
              disabled={submitting}
              type="submit"
            >
              {submitting ? '提交中...' : '提交举报'}
            </button>
            <button
              className="button"
              disabled={submitting}
              onClick={() => setOpen(false)}
              type="button"
            >
              取消
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
