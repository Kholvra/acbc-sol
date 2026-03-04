'use client';

import React from 'react';
import Sidebar from './sidebar';
import BottomNav from './bottom-nav';
import Aurora from '../ui/aurora';

interface TikTokLayoutProps {
  children: React.ReactNode;
  onOpenCreate?: () => void;
}

const TikTokLayout: React.FC<TikTokLayoutProps> = ({ children, onOpenCreate }) => {
  return (
    <div className="flex min-h-screen bg-aid-offwhite text-aid-dark font-body relative overflow-hidden">
      {/* Global Aurora Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <Aurora
            colorStops={["#F0E491", "#BBC863", "#F0E491"]}
            blend={0.5}
            amplitude={1.0}
            speed={0.5}
         />
      </div>

      {/* Sidebar - Desktop Only */}
      <Sidebar onOpenCreate={onOpenCreate} />

      {/* Main Content Area */}
      <main className="flex-1 md:ml-72 w-full relative z-10">
         {children}
      </main>

      {/* Bottom Nav - Mobile Only */}
      <BottomNav onOpenCreate={onOpenCreate} />
    </div>
  );
};

export default TikTokLayout;
