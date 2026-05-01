'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { RoleSelectionModal } from './role-selection-modal';
import { api } from '~/trpc/react';

const RESTRICTED_ROUTES = ['/kyc', '/profile', '/activity', '/live', '/explore'];

export const RoleOnboardingWrapper = () => {
  const { connected } = useWallet();
  const router = useRouter();
  const pathname = usePathname();
  const { data: profile, isLoading } = api.user.getProfile.useQuery(undefined, {
    enabled: connected,
  });

  const [isCompleting, setIsCompleting] = useState(false);

  if (!connected) return null;
  if (isLoading) return null;
  if (!profile) return null;

  const isRestricted = RESTRICTED_ROUTES.some(route => pathname.startsWith(route));
  if (isRestricted && !profile.hasRole) {
    router.push('/dashboard');
    return null;
  }

  if (isCompleting) return null;

  return (
    <RoleSelectionModal
      isOpen={true}
      onSuccess={() => setIsCompleting(true)}
      currentRole={profile.role ?? null}
      hasKyc={profile.hasKyc ?? false}
    />
  );
};
