'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import ProgressPage from '@/components/ProgressPage';

export default function Progress() {
  return (
    <AuthGuard>
      <ProgressPage />
    </AuthGuard>
  );
}
