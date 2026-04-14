'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { RoleSelectionModal } from './role-selection-modal';
import { api } from '~/trpc/react';

const RESTRICTED_ROUTES = ['/kyc', '/profile', '/activity', '/live', '/explore'];

export const RoleOnboardingWrapper = () => {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { data: profile, isLoading, isError: hasProfileError } = api.user.getProfile.useQuery(undefined, {
    enabled: status === 'authenticated',
  });

  const [showModal, setShowModal] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // auth guard & role enforcement
  useEffect(() => {
    // unauthenticated - redirect to sign-in
    if (status === 'unauthenticated' || hasProfileError) {
      router.push('/sign-in');
      return;
    }

    // wait for session and query to load
    if (status !== 'authenticated' || isLoading) return;

    // authenticated but no profile in DB - redirect to sign-in
    if (profile === null) {
      router.push('/sign-in');
      return;
    }

    // no profile data yet - wait
    if (!profile) return;

    // always show modal as role switcher
    const isRestricted = RESTRICTED_ROUTES.some(route => pathname.startsWith(route));
    if (isRestricted && !profile.hasRole) {
      router.push('/dashboard');
    } else {
      setShowModal(true);
    }
  }, [status, isLoading, hasProfileError, profile, pathname, router, isCompleting]);

  const handleSuccess = () => {
    setIsCompleting(true);
    setShowModal(false);
  };

  // don't render until session is loaded and authenticated
  // also wait for profile query to complete
  if (status !== 'authenticated' || isLoading || hasProfileError) {
    return null;
  }

  return (
    <RoleSelectionModal
      isOpen={showModal}
      onSuccess={handleSuccess}
      currentRole={profile?.role ?? null}
    />
  );
};
