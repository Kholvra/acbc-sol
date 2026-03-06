'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Megaphone, ShieldAlert, Loader2 } from 'lucide-react';
import Button from '~/components/ui/button';
import { toast } from 'sonner';
import { api } from '~/trpc/react';
import { useSession } from 'next-auth/react';

interface RoleSelectionModalProps {
  isOpen: boolean;
  onSuccess: () => void;
}

export const RoleSelectionModal = ({ isOpen, onSuccess }: RoleSelectionModalProps) => {
  const [showKycConfirm, setShowKycConfirm] = useState(false);
  const { update: updateSession } = useSession();
  const router = useRouter();
  const utils = api.useUtils();

  const updateProfileMutation = api.user.updateProfile.useMutation({
    onSuccess: async (data) => {
      toast.success(`Role selected as ${data.role}`);
      
      await updateSession({
        user: {
          role: data.role,
        },
      });

      await utils.user.getProfile.invalidate();

      onSuccess();

      if (data.role === 'CAMPAIGNER') {
        router.push('/kyc');
      } else {
        router.push('/dashboard');
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile.");
    }
  });

  if (!isOpen) return null;

  const handleRoleSelect = (role: 'DONATUR' | 'CAMPAIGNER') => {
    if (role === 'CAMPAIGNER') {
      setShowKycConfirm(true);
    } else {
      handleConfirmRole(role);
    }
  };

  const handleConfirmRole = (role: 'DONATUR' | 'CAMPAIGNER') => {
    updateProfileMutation.mutate({ 
      role,
      name: "New User" // Default placeholder name for first-time onboarding
    });
  };

  const isLoading = updateProfileMutation.isPending;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-aid-green/20 to-aid-primary/20 p-6 relative">
          <h2 className="text-2xl font-heading font-black text-aid-dark text-center">
            {showKycConfirm ? "Identity Verification" : "Choose Your Path"}
          </h2>
          <p className="text-center text-gray-600 text-sm mt-1 font-medium">
            {showKycConfirm 
              ? "Required for Campaigners" 
              : "Select how you want to participate in AidBeacon"}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          {!showKycConfirm ? (
            <div className="space-y-4">
              {/* Donatur Option */}
              <button
                onClick={() => handleRoleSelect('DONATUR')}
                className="w-full text-left p-5 rounded-2xl border-2 border-gray-100 hover:border-aid-green/50 hover:bg-aid-green/5 transition-all group relative overflow-hidden"
              >
                <div className="flex items-start gap-4 relative z-10">
                  <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Users size={24} />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg text-aid-dark mb-1">Donor (Donatur)</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Support existing campaigns by donating. Browse and contribute to causes you care about across Indonesia.
                    </p>
                  </div>
                </div>
              </button>

              {/* Campaigner Option */}
              <button
                onClick={() => handleRoleSelect('CAMPAIGNER')}
                className="w-full text-left p-5 rounded-2xl border-2 border-gray-100 hover:border-aid-green/50 hover:bg-aid-green/5 transition-all group relative overflow-hidden"
              >
                <div className="flex items-start gap-4 relative z-10">
                  <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Megaphone size={24} />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg text-aid-dark mb-1">Campaigner</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Create and manage fundraising campaigns. You can raise funds for relief efforts. <span className="text-orange-500 font-bold text-xs uppercase tracking-wider ml-1">Requires KYC</span>
                    </p>
                  </div>
                </div>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-aid-yellow/10 rounded-full flex items-center justify-center text-aid-yellow mb-2">
                  <ShieldAlert size={40} />
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-gray-600 mb-6 leading-relaxed">
                  As a <strong>Campaigner</strong>, you are required to verify your identity using your KTP (Indonesian National ID).
                </p>
                
                <div className="bg-gray-50 p-4 rounded-xl text-left mb-8">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-3">Why we need this:</p>
                  <ul className="space-y-2 text-sm text-gray-600 font-medium">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-aid-green"></div>
                      Ensures all campaigns are legitimate
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-aid-green"></div>
                      Protects donors from potential fraud
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-aid-green"></div>
                      Complies with regional regulations
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => setShowKycConfirm(false)}
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button 
                  variant="primary" 
                  className="flex-1" 
                  onClick={() => handleConfirmRole('CAMPAIGNER')}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={18} className="animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    "Continue to KYC"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
