'use client';

import React from 'react';
import { Home, Compass, User, Video, PlusSquare } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

interface BottomNavProps {
    onOpenCreate?: () => void;
    userRole?: 'DONATUR' | 'CAMPAIGNER' | 'ADMIN' | null;
}

const BottomNav: React.FC<BottomNavProps> = ({ onOpenCreate, userRole }) => {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { label: "Home", icon: Home, path: "/dashboard", active: pathname === "/dashboard" || pathname === "/" },
    { label: "Live", icon: Video, path: (pathname === "/live" || pathname.startsWith('/live/')) ? pathname : "/live", active: pathname === "/live" || pathname.startsWith('/live/') },
    ...(userRole === 'CAMPAIGNER' || userRole === 'ADMIN' ? [{ label: "Create", icon: PlusSquare, path: null, active: false, isAction: true }] : []),
    { label: "Explore", icon: Compass, path: "/explore", active: pathname === "/explore" },
    { label: "Profile", icon: User, path: "/profile", active: pathname === "/profile" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-[#BBC863]/20 h-20 z-50 flex items-center justify-around px-2 pb-2 text-[#658C58]/60 shadow-[0_-4px_32px_0_rgba(187,200,99,0.1)]">
      {navItems.map((item, idx) => {
        if (item.isAction) {
            return (
                <button key={idx} onClick={onOpenCreate} className="relative -top-5 group">
                    <div className="bg-gradient-to-tr from-[#BBC863] to-[#F0E491] p-[3px] rounded-2xl w-14 h-14 flex items-center justify-center shadow-lg transform transition-transform group-active:scale-95">
                        <div className="bg-white w-full h-full rounded-[14px] flex items-center justify-center">
                            <PlusSquare size={24} className="text-[#658C58] fill-[#F0E491]/20" />
                        </div>
                    </div>
                </button>
            )
        }

        return (
            <button
                key={item.label}
                onClick={() => router.push(item.path!)}
                className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 ${
                    item.active ? 'text-[#658C58] -translate-y-1' : 'text-[#658C58]/50 hover:text-[#658C58]'
                }`}
            >
                <div className={`relative p-1.5 rounded-xl transition-all ${item.active ? 'bg-[#F0E491]/40' : ''}`}>
                    <item.icon 
                        size={24} 
                        strokeWidth={item.active ? 2.5 : 2} 
                        className={item.active ? 'text-[#658C58] fill-[#F0E491]' : ''}
                    />
                    {item.active && (
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#658C58] rounded-full" />
                    )}
                </div>
                <span className={`text-[10px] font-bold font-heading ${item.active ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                    {item.label}
                </span>
            </button>
        )
      })}
    </div>
  );
};

export default BottomNav;
