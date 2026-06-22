import type { Metadata } from 'next';

export const metadata: Metadata = { title: '个人主页' };

interface ProfilePageProps {
  params: Promise<{ userId: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { userId } = await params;

  return (
    <section className="content-card">
      <span className="eyebrow">Profile · {userId}</span>
      <h1>玩家公开主页</h1>
      <p>这里未来展示社区昵称、头像、简介和公开内容，不展示任何实名信息。</p>
    </section>
  );
}
