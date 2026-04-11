'use client';

import React from 'react';
import { useAccount } from 'wagmi';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ children }) => {
  useAccount();

  // In the real app, we would use NextAuth session or wagmi connection.
  // For now, mirroring the source logic which just renders children to unblock dev.
  return <>{children}</>;
};

export default AuthenticatedLayout;
