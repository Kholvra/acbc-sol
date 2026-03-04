import React from 'react';
import Navbar from '~/components/layout/navbar';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen w-full bg-white text-aid-dark selection:bg-aid-yellow selection:text-aid-dark">
      <Navbar />
      <main className="flex-grow pt-20">
        {children}
      </main>
    </div>
  );
}
