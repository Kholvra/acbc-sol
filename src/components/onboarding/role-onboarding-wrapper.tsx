'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { RoleSelectionModal } from './role-selection-modal';

import { api } from '~/trpc/react';

export const RoleOnboardingWrapper = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { data: profile, isLoading } = api.user.getProfile.useQuery(undefined, {
    enabled: status === 'authenticated',
  });

  const [showModal, setShowModal] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Global Auth Guard & Role Enforcement
  useEffect(() => {
    // 1. Only kick if explicitly unauthenticated by NextAuth.
    if (status === 'unauthenticated') {
      router.push('/sign-in');
      return;
    }

    // 2. If authenticated, check if the profile exists in DB.
    if (status === 'authenticated' && !isLoading && profile === null) {
      router.push('/sign-in');
      return;
    }

    // 3. Quarantine users without roles to /dashboard
    // If we are currently completing (transitioning), ignore these checks to avoid flicker
    if (status === 'authenticated' && !isLoading && profile && !isCompleting) {
      if (!profile.hasRole) {
        // Prevent accessing other routes if no role is selected
        const restrictedRoutes = ['/kyc', '/profile', '/activity', '/live', '/explore'];
        if (restrictedRoutes.some(route => pathname.startsWith(route))) {
          router.push('/dashboard');
        } else {
          setShowModal(true);
        }
      } else {
        setShowModal(false);
      }
    }
  }, [status, isLoading, profile, pathname, router, isCompleting]);

  const handleSuccess = () => {
    setIsCompleting(true);
    setShowModal(false);
  };

  // DO NOT render anything that depends on session until it's loaded and authenticated
  if (status !== 'authenticated' || !profile) {
    return null;
  }

  return (
    <RoleSelectionModal 
      isOpen={showModal} 
      onSuccess={handleSuccess}
    />
  );
};
