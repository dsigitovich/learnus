'use client';

import ChatLayout from '@/components/ChatLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function Home() {
  return (
    <AuthGuard>
      <ChatLayout />
    </AuthGuard>
  );
}
