'use client';

import React from 'react';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';
import Aurora from '~/components/ui/aurora';

export default function SignUpPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-aid-dark">
      <Aurora colorStops={["#658C58", "#F0E491", "#BBC863"]} />
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl text-center">
          <div className="w-20 h-20 bg-aid-green/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-aid-green">
            <UserPlus size={40} />
          </div>
          <h1 className="text-3xl font-heading font-black text-white mb-2">Join AidBeacon</h1>
          <p className="text-white/60 mb-8 font-body text-lg">Create an account to start your journey in transparent humanitarian aid.</p>
          
          <div className="space-y-4">
             <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white/40 text-sm italic">
                Social registration coming soon. Please use Wallet Sign-in for now.
             </div>
             <Link href="/sign-in" className="block w-full bg-white text-aid-dark hover:bg-aid-green hover:text-white transition-all py-4 rounded-2xl font-black text-lg shadow-xl uppercase tracking-wider">
                Go to Sign In
             </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
