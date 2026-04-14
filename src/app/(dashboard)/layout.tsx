import React from 'react';
import { redirect } from 'next/navigation';
import { RoleOnboardingWrapper } from '~/components/onboarding/role-onboarding-wrapper';
import { auth } from '~/server/auth';
import { db } from '~/server/db';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });

    if (!user) {
      redirect('/sign-in');
    }
  } catch {
    redirect('/sign-in');
  }

  return (
    <div className="dashboard-root">
      {children}
      <RoleOnboardingWrapper />
    </div>
  );
}
