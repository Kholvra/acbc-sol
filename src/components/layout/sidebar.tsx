'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Compass, User, ScrollText, Video, PlusSquare, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { api } from '~/trpc/react';

import { toast } from 'sonner';

interface SidebarProps {
  onOpenCreate?: () => void;
}

const Sidebar = ({ onOpenCreate }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { connected } = useWallet();
  const { data: profile } = api.user.getProfile.useQuery(undefined, {
    enabled: connected
  });

  const navItems = [
    { label: "For You", icon: Home, path: "/dashboard", active: pathname === "/dashboard" || pathname === "/" },
    { label: "Live", icon: Video, path: "/live", active: pathname === "/live" },
    { label: "Explore", icon: Compass, path: "/explore", active: pathname === "/explore" },
    { label: "My Activity", icon: ScrollText, path: "/activity", active: pathname === "/activity" },
  ];

  const handleCreateClick = () => {
    if (!profile) return;
    
    if (profile.role === 'CAMPAIGNER') {
      if (profile.hasKyc) {
        onOpenCreate?.();
      } else {
        toast.error("Identity Verification (KYC) required to create campaigns");
        router.push('/kyc');
      }
    }
  };

  return (
    <div className="hidden md:flex flex-col w-64 h-[calc(100vh-2rem)] fixed left-4 top-4 bg-white/20 backdrop-blur-xl border border-white/30 text-aid-dark p-6 z-50 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] font-body transition-all duration-300 rounded-3xl">
      
      {/* Logo Area */}
      <div className="flex items-center gap-3 mb-10 px-2 group cursor-pointer" onClick={() => router.push('/')}>
        <div className="relative w-10 h-10 flex items-center justify-center">
             {/* eslint-disable-next-line @next/next/no-img-element */}
             <img 
               src="/images/logo-aidbeacon.png" 
               alt="AidBeacon" 
               className="w-full h-full object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-110"
             />
        </div>
        <div className="flex flex-col">
            <span className="font-heading font-bold text-xl tracking-tight text-aid-dark leading-none">AidBeacon</span>
            <span className="text-[10px] uppercase tracking-widest text-aid-dark/60 font-bold">Relief DAO</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-3">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => router.push(item.path)}
            className={`group w-full flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 relative overflow-hidden ${
              item.active 
                ? 'text-white shadow-lg scale-105' 
                : 'text-aid-dark/70 hover:bg-white/30 hover:text-aid-dark hover:pl-5 hover:shadow-sm'
            }`}
          >
            {item.active && (
                <div className="absolute inset-0 bg-gradient-to-r from-aid-green to-aid-secondary z-0"></div>
            )}
            
            <div className="relative z-10 flex items-center gap-4">
                <item.icon size={24} strokeWidth={item.active ? 2.5 : 2} className={`transition-transform duration-300 ${item.active ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="text-lg font-heading font-bold tracking-wide">{item.label}</span>
            </div>
          </button>
        ))}
      </nav>

      {/* CTA Button - Only for Campaigners */}
      {profile?.role === 'CAMPAIGNER' && (
        <div className="px-1 mb-8">
          <button 
              onClick={handleCreateClick}
              className="group relative w-full overflow-hidden rounded-2xl p-0.5 transition-transform active:scale-95 shadow-lg hover:shadow-aid-green/20"
          >
              <div className="absolute inset-0 bg-gradient-to-r from-aid-primary via-aid-green to-aid-primary animate-spin-slow opacity-70"></div>
              <div className="relative bg-white/90 backdrop-blur-md rounded-[14px] py-3.5 px-4 flex items-center justify-center gap-2 transition-colors group-hover:bg-white/95">
                  <PlusSquare size={20} className="text-aid-dark group-hover:text-aid-green transition-colors" />
                  <span className="font-heading font-black text-aid-dark tracking-wide uppercase text-sm">CREATE CAMPAIGN</span>
              </div>
          </button>
        </div>
      )}

      {/* Footer Area: Profile Link Only */}
      <div className="border-t border-white/20 pt-6 mt-auto">
         <button 
            onClick={() => router.push('/profile')}
            className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all duration-300 hover:bg-white/40 ${pathname === '/profile' ? 'bg-white/60 shadow-inner' : ''}`}
         >
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-aid-tertiary/20 rounded-full flex items-center justify-center text-aid-tertiary">
                    <User size={20} className="fill-current" />
                </div>
                <span className="text-sm font-heading font-bold text-aid-dark">Profile</span>
             </div>
             
             {/* KYC Status Badge */}
             {connected && (
                <KycStatusBadge />
             )}
         </button>
       
        <div className="mt-6 flex justify-between text-[10px] text-aid-dark/40 font-accent uppercase tracking-wider px-2">
            <span>© 2026 AidBeacon</span>
            <span className="hover:text-aid-dark cursor-pointer transition-colors">Legal</span>
        </div>
      </div>
    </div>
  );
};

const KycStatusBadge = () => {
    const { data: kycStatus } = api.kyc.getStatus.useQuery();

    if (!kycStatus) return null;

    return (
        <div className="flex items-center">
            {kycStatus.hasDocument ? (
                <div className="bg-aid-green/20 p-1.5 rounded-full text-aid-green group-hover:bg-aid-green group-hover:text-white transition-all shadow-sm">
                    <ShieldCheck size={14} />
                </div>
            ) : (
                <div className="bg-aid-yellow/20 p-1.5 rounded-full text-aid-yellow animate-pulse">
                    <ShieldAlert size={14} />
                </div>
            )}
        </div>
    );
};

export default Sidebar;
