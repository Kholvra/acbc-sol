'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { RoleSelectionModal } from './role-selection-modal';

export const RoleOnboardingWrapper = () => {
  const { data: session, status } = useSession();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      if (!session.user.role) {
        setShowModal(true);
      }
    }
  }, [session, status]);

  return (
    <RoleSelectionModal 
      isOpen={showModal} 
      onClose={() => setShowModal(false)}
      onSuccess={() => setShowModal(false)}
    />
  );
};
