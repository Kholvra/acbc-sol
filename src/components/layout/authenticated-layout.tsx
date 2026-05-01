'use client';

import React from 'react';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ children }) => {
  return <>{children}</>;
};

export default AuthenticatedLayout;
