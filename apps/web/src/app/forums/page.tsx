import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: '论坛分区' };

const forums = ['综合讨论', '攻略研究', '剧情与角色', '同人创作'];

export default function ForumsPage() {
  return (
    <section>
      <div className="section-heading">
        <span className="eyebrow">Forums</span>
        <h1>论坛分区</h1>
        <p>分区数据将在论坛核心功能迭代中接入 API。</p>
      </div>
      <div className="list-card">
        {forums.map((forum, index) => (
          <Link className="list-row" href={`/threads/demo-${index + 1}`} key={forum}>
            <span>
              <strong>{forum}</strong>
              <small>分区说明与统计信息占位</small>
            </span>
            <span aria-hidden="true">→</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
