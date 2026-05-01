import React from 'react';
import { RoleOnboardingWrapper } from '~/components/onboarding/role-onboarding-wrapper';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-root">
      {children}
      <RoleOnboardingWrapper />
    </div>
  );
}
