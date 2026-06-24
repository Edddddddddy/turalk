'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { ThreadDTO } from '@turalk/types';

import { CommentPanel } from '../comments';
import { ReportButton } from '../reports';
import { threadsApi } from '../../lib/api/threads';

interface ThreadDetailProps {
  threadId: string;
}

export function ThreadDetail({ threadId }: ThreadDetailProps) {
  const [thread, setThread] = useState<ThreadDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    void threadsApi
      .get(threadId)
      .then(setThread)
      .catch(() => setError('帖子不存在，或当前不可见。'))
      .finally(() => setLoading(false));
  }, [threadId]);

  if (loading) {
    return <p className="forum-state">正在加载帖子...</p>;
  }

  if (error || !thread) {
    return (
      <article className="content-card">
        <p className="form-error">{error ?? '帖子加载失败。'}</p>
        <Link href="/forums">返回论坛</Link>
      </article>
    );
  }

  return (
    <>
      <article className="thread-detail content-card">
        <span className="eyebrow">Thread · {thread.forum.name}</span>
        <h1>{thread.title}</h1>
        <p className="thread-meta">
          {thread.author.displayName} ·{' '}
          {new Date(thread.createdAt).toLocaleString('zh-CN')}
        </p>
        <div className="thread-content">{thread.content}</div>
        <div className="thread-detail-footer">
          <Link className="button" href="/forums">
            返回论坛
          </Link>
          <ReportButton
            targetId={thread.id}
            targetLabel="帖子"
            targetType="THREAD"
          />
          <span>举报和审核入口将在后续迭代接入。</span>
        </div>
      </article>
      <CommentPanel threadId={thread.id} />
    </>
  );
}
