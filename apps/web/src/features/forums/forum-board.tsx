'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  ForumDTO,
  IdentityVerificationStatusDTO,
  ThreadListItemDTO,
} from '@turalk/types';

import { useAuth } from '../auth';
import { forumsApi } from '../../lib/api/forums';
import { identityApi } from '../../lib/api/identity';
import { threadsApi } from '../../lib/api/threads';
import { getAccessToken } from '../../lib/auth/token-storage';

const initialForm = {
  content: '',
  title: '',
};

export function ForumBoard() {
  const { user } = useAuth();
  const [forums, setForums] = useState<ForumDTO[]>([]);
  const [threads, setThreads] = useState<ThreadListItemDTO[]>([]);
  const [selectedForumSlug, setSelectedForumSlug] = useState<string>('');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [identityStatus, setIdentityStatus] =
    useState<IdentityVerificationStatusDTO | null>(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const selectedForum = useMemo(
    () => forums.find((forum) => forum.slug === selectedForumSlug) ?? null,
    [forums, selectedForumSlug],
  );
  const canPublish = Boolean(user && identityStatus?.status === 'VERIFIED');

  const loadThreads = useCallback(
    async (forumSlug: string, cursor?: string) => {
      const page = await threadsApi.list({
        cursor,
        forumSlug: forumSlug || undefined,
        limit: 10,
      });

      setThreads((current) =>
        cursor ? [...current, ...page.items] : page.items,
      );
      setNextCursor(page.nextCursor);
    },
    [],
  );

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [forumItems] = await Promise.all([forumsApi.list()]);
      const firstForumSlug = forumItems[0]?.slug ?? '';

      setForums(forumItems);
      setSelectedForumSlug(firstForumSlug);
      await loadThreads(firstForumSlug);
    } catch {
      setError('论坛数据加载失败，请稍后再试。');
    } finally {
      setLoading(false);
    }
  }, [loadThreads]);

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    const accessToken = getAccessToken();

    if (!user || !accessToken) {
      setIdentityStatus(null);
      return;
    }

    void identityApi
      .getStatus(accessToken)
      .then(setIdentityStatus)
      .catch(() => setIdentityStatus(null));
  }, [user]);

  async function handleForumChange(forumSlug: string) {
    setSelectedForumSlug(forumSlug);
    setError(null);

    try {
      await loadThreads(forumSlug);
    } catch {
      setError('帖子列表加载失败，请稍后再试。');
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const accessToken = getAccessToken();

    if (!accessToken) {
      setError('请先登录后再发帖。');
      return;
    }

    if (!selectedForum) {
      setError('请先选择一个有效分区。');
      return;
    }

    setSubmitting(true);
    setError(null);
    setNotice(null);

    try {
      const created = await threadsApi.create(accessToken, {
        content: form.content,
        forumSlug: selectedForum.slug,
        title: form.title,
      });

      setForm(initialForm);
      setNotice('帖子已发布。');
      await loadThreads(created.forum.slug);
    } catch {
      setError('发帖失败：请确认已登录并完成模拟实名认证。');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="forum-state">正在加载论坛分区...</p>;
  }

  if (error && forums.length === 0) {
    return (
      <div className="content-card">
        <p className="form-error">{error}</p>
      </div>
    );
  }

  return (
    <div className="forum-layout">
      <aside className="forum-sidebar" aria-label="论坛分区">
        {forums.length === 0 ? (
          <p className="forum-state">暂无分区，请先由管理员初始化分区。</p>
        ) : (
          forums.map((forum) => (
            <button
              className={
                forum.slug === selectedForumSlug
                  ? 'forum-tab forum-tab-active'
                  : 'forum-tab'
              }
              key={forum.id}
              onClick={() => void handleForumChange(forum.slug)}
              type="button"
            >
              <strong>{forum.name}</strong>
              <span>{forum.threadCount} 个帖子</span>
            </button>
          ))
        )}
      </aside>

      <section className="forum-main">
        {error ? <p className="form-error">{error}</p> : null}
        {notice ? <p className="form-success">{notice}</p> : null}

        <div className="composer-card">
          <h2>发布新帖</h2>
          <p>
            发帖需要登录并完成模拟实名认证。前台只展示公开昵称，不展示实名信息。
          </p>
          {!canPublish ? (
            <p className="form-hint">
              当前账号尚未满足发帖条件，可先前往{' '}
              <Link href="/identity">实名认证说明</Link> 完成 mock 核验。
            </p>
          ) : null}
          <form className="thread-form" onSubmit={handleSubmit}>
            <label>
              <span>标题</span>
              <input
                disabled={!canPublish || submitting}
                maxLength={80}
                minLength={4}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="例如：这次活动剧情哪里最戳你？"
                required
                value={form.title}
              />
            </label>
            <label>
              <span>正文</span>
              <textarea
                disabled={!canPublish || submitting}
                maxLength={10000}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    content: event.target.value,
                  }))
                }
                placeholder="先写一点观点，后续评论系统会接上。"
                required
                rows={7}
                value={form.content}
              />
            </label>
            <button
              className="button button-primary"
              disabled={!canPublish || submitting}
              type="submit"
            >
              {submitting ? '发布中...' : '发布帖子'}
            </button>
          </form>
        </div>

        <div className="thread-list">
          {threads.length === 0 ? (
            <p className="forum-state">
              这个分区还没有帖子，等第一位玩家开聊。
            </p>
          ) : (
            threads.map((thread) => (
              <Link
                className="thread-row"
                href={`/threads/${thread.id}`}
                key={thread.id}
              >
                <span className="thread-meta">
                  {thread.forum.name} · {thread.author.displayName}
                </span>
                <strong>{thread.title}</strong>
                <p>{thread.contentPreview}</p>
                <span className="thread-meta">
                  {new Date(thread.createdAt).toLocaleString('zh-CN')} ·{' '}
                  {thread.commentCount} 条评论
                </span>
              </Link>
            ))
          )}
        </div>

        {nextCursor ? (
          <button
            className="button"
            onClick={() => void loadThreads(selectedForumSlug, nextCursor)}
            type="button"
          >
            加载更多
          </button>
        ) : null}
      </section>
    </div>
  );
}
