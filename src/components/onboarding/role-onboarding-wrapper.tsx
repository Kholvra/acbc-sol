'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { RoleSelectionModal } from './role-selection-modal';

import { api } from '~/trpc/react';

export const RoleOnboardingWrapper = () => {
  const { data: session, status } = useSession();
  const { data: profile, isLoading } = api.user.getProfile.useQuery(undefined, {
    enabled: status === 'authenticated',
  });

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && !isLoading && profile) {
      if (!profile.hasRole) {
        setShowModal(true);
      } else {
        setShowModal(false);
      }
    }
  }, [status, isLoading, profile]);

  return (
    <RoleSelectionModal 
      isOpen={showModal} 
      onClose={() => setShowModal(false)}
      onSuccess={() => setShowModal(false)}
    />
  );
};
