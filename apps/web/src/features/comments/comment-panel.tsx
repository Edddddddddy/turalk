'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CommentDTO } from '@turalk/types';

import { useAuth } from '../auth';
import { ReportButton } from '../reports';
import { commentsApi } from '../../lib/api/comments';
import { getAccessToken } from '../../lib/auth/token-storage';

interface CommentPanelProps {
  threadId: string;
}

interface CommentFormState {
  content: string;
  parentId?: string;
}

const initialForm: CommentFormState = { content: '' };

export function CommentPanel({ threadId }: CommentPanelProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentDTO[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [form, setForm] = useState<CommentFormState>(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const repliesByParent = useMemo(() => {
    const groups = new Map<string, CommentDTO[]>();

    for (const comment of comments) {
      if (!comment.parentId) {
        continue;
      }

      groups.set(comment.parentId, [
        ...(groups.get(comment.parentId) ?? []),
        comment,
      ]);
    }

    return groups;
  }, [comments]);
  const visibleCommentIds = useMemo(
    () => new Set(comments.map((comment) => comment.id)),
    [comments],
  );
  const topLevelComments = comments.filter(
    (comment) => !comment.parentId || !visibleCommentIds.has(comment.parentId),
  );

  const loadComments = useCallback(
    async (cursor?: string) => {
      const page = await commentsApi.list({
        cursor,
        limit: 50,
        threadId,
      });

      setComments((current) =>
        cursor ? [...current, ...page.items] : page.items,
      );
      setNextCursor(page.nextCursor);
    },
    [threadId],
  );

  useEffect(() => {
    setLoading(true);
    setError(null);

    void loadComments()
      .catch(() => setError('评论加载失败，请稍后再试。'))
      .finally(() => setLoading(false));
  }, [loadComments]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const accessToken = getAccessToken();

    if (!accessToken) {
      setError('请先登录后再评论。');
      return;
    }

    setSubmitting(true);
    setError(null);
    setNotice(null);

    try {
      await commentsApi.create(accessToken, {
        content: form.content,
        parentId: form.parentId,
        threadId,
      });
      setForm(initialForm);
      setNotice('评论已发布。');
      await loadComments();
    } catch {
      setError('评论失败：请确认已登录并完成模拟实名认证。');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(commentId: string) {
    const accessToken = getAccessToken();

    if (!accessToken) {
      setError('请先登录后再删除评论。');
      return;
    }

    setError(null);
    setNotice(null);

    try {
      await commentsApi.delete(accessToken, commentId);
      setNotice('评论已删除。');
      await loadComments();
    } catch {
      setError('删除失败：只能删除自己发布且仍可见的评论。');
    }
  }

  function renderComment(comment: CommentDTO, isReply = false) {
    return (
      <div className={isReply ? 'comment-row comment-reply' : 'comment-row'}>
        <div className="comment-meta">
          <strong>{comment.author.displayName}</strong>
          <span>{new Date(comment.createdAt).toLocaleString('zh-CN')}</span>
        </div>
        <p>{comment.content}</p>
        <div className="comment-actions">
          <button
            className="nav-button"
            onClick={() =>
              setForm({
                content: '',
                parentId: comment.id,
              })
            }
            type="button"
          >
            回复
          </button>
          {user?.id === comment.author.id ? (
            <button
              className="nav-button"
              onClick={() => void handleDelete(comment.id)}
              type="button"
            >
              删除
            </button>
          ) : null}
          <ReportButton
            targetId={comment.id}
            targetLabel="评论"
            targetType="COMMENT"
          />
        </div>
        {(repliesByParent.get(comment.id) ?? []).map((reply) =>
          renderComment(reply, true),
        )}
      </div>
    );
  }

  return (
    <section className="comments-card content-card">
      <div className="comments-header">
        <span className="eyebrow">Comments</span>
        <h2>评论</h2>
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      {notice ? <p className="form-success">{notice}</p> : null}

      <form className="comment-form" onSubmit={handleSubmit}>
        {form.parentId ? (
          <p className="form-hint">
            正在回复评论{' '}
            <button
              className="nav-button"
              onClick={() => setForm(initialForm)}
              type="button"
            >
              取消回复
            </button>
          </p>
        ) : null}
        <textarea
          disabled={!user || submitting}
          maxLength={5000}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              content: event.target.value,
            }))
          }
          placeholder={
            user
              ? '写下你的想法。评论需要完成模拟实名认证。'
              : '登录后可以参与评论。'
          }
          required
          rows={4}
          value={form.content}
        />
        <button
          className="button button-primary"
          disabled={!user || submitting}
          type="submit"
        >
          {submitting ? '发布中...' : '发布评论'}
        </button>
      </form>

      {loading ? <p className="forum-state">正在加载评论...</p> : null}
      {!loading && topLevelComments.length === 0 ? (
        <p className="forum-state">还没有评论，来坐第一排。</p>
      ) : null}
      <div className="comment-list">
        {topLevelComments.map((comment) => (
          <div key={comment.id}>{renderComment(comment)}</div>
        ))}
      </div>

      {nextCursor ? (
        <button
          className="button"
          onClick={() => void loadComments(nextCursor)}
          type="button"
        >
          加载更多评论
        </button>
      ) : null}
    </section>
  );
}
