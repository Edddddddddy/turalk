import type { Metadata } from 'next';

import { ProfilePanel } from '../../features/auth';

export const metadata: Metadata = { title: '个人主页' };

export default function CurrentProfilePage() {
  return <ProfilePanel />;
}
