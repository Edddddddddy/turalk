import type { Metadata } from 'next';

import { ThreadDetail } from '../../../features/threads';

export const metadata: Metadata = { title: '帖子详情' };

interface ThreadPageProps {
  params: Promise<{ threadId: string }>;
}

export default async function ThreadPage({ params }: ThreadPageProps) {
  const { threadId } = await params;

  return <ThreadDetail threadId={threadId} />;
}
