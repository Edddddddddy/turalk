import type { Metadata } from 'next';

import { ForumBoard } from '../../features/forums';

export const metadata: Metadata = { title: '论坛分区' };

export default function ForumsPage() {
  return (
    <section>
      <div className="section-heading">
        <span className="eyebrow">Forums</span>
        <h1>论坛分区</h1>
        <p>选择分区浏览帖子。完成模拟实名认证后，可以用公开昵称发布新帖。</p>
      </div>
      <ForumBoard />
    </section>
  );
}
