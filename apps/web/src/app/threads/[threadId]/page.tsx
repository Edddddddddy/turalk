import type { Metadata } from 'next';

export const metadata: Metadata = { title: '帖子详情' };

interface ThreadPageProps {
  params: Promise<{ threadId: string }>;
}

export default async function ThreadPage({ params }: ThreadPageProps) {
  const { threadId } = await params;

  return (
    <article className="content-card">
      <span className="eyebrow">Thread · {threadId}</span>
      <h1>帖子详情占位</h1>
      <p>正文、作者公开身份、评论与举报入口将在后续迭代实现。</p>
    </article>
  );
}
