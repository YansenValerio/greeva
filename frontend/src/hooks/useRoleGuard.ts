'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { useHydrated } from './useHydrated';
import type { User } from '@/types/auth';

export function useRoleGuard(requiredRole: User['role']) {
  const hydrated = useHydrated();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user?.role !== requiredRole) {
      router.push('/');
    }
  }, [hydrated, isAuthenticated, user, requiredRole, router]);

  const ready = hydrated && isAuthenticated && user?.role === requiredRole;
  return { ready, user };
}
