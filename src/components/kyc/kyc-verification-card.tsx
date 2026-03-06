'use client';

import React, { useState, useRef } from 'react';
import { api } from '~/trpc/react';
import { TRPCClientError } from '@trpc/client';
import type { TRPC_ERROR_CODE_KEY } from '@trpc/server/rpc';
import {
  ShieldCheck,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Camera
} from 'lucide-react';
import { toast } from 'sonner';
import Button from '~/components/ui/button';

interface TRPCErrorShape {
  code?: TRPC_ERROR_CODE_KEY;
  message?: string;
}

function isTRPCError(error: unknown): error is { data?: TRPCErrorShape } {
  return (
    error instanceof TRPCClientError ||
    (typeof error === 'object' && error !== null && 'data' in error)
  );
}

export const KycVerificationCard = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = api.useUtils();
  const { data: kycStatus, isLoading: isLoadingStatus } = api.kyc.getStatus.useQuery();

  const uploadMutation = api.kyc.uploadKtp.useMutation({
    onSuccess: async (data) => {
      toast.success(`Verification Successful! Welcome, ${data.name}`);
      await utils.kyc.getStatus.invalidate();
      await utils.user.getProfile.invalidate();
      setIsUploading(false);
      setPreview(null);
    },
    onError: (error) => {
      setIsUploading(false);

      if (isTRPCError(error)) {
        const errorCode = error.data?.code;

        if (errorCode === 'CONFLICT') {
          toast.error("This ID is already registered to another account.");
        } else if (errorCode === 'BAD_REQUEST') {
          toast.error("Could not read KTP. Please use a clearer photo.");
        } else {
          toast.error(error.data?.message ?? "An unexpected error occurred.");
        }
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Basic validation
    if (!selectedFile.type.startsWith('image/')) {
      toast.error("Please upload an image file (JPG/PNG)");
      return;
    }

    if (selectedFile.size > 4 * 1024 * 1024) {
      toast.error("Image too large. Max size is 4MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = () => {
    if (!preview) return;
    
    setIsUploading(true);
    try {
      // Remove data:image/xxx;base64, prefix
      const base64 = preview.split(',')[1];
      if (!base64) throw new Error("Invalid image format");
      
      uploadMutation.mutate({ imageBase64: base64 });
    } catch {
      setIsUploading(false);
      toast.error("Failed to process image.");
    }
  };

  if (isLoadingStatus) {
    return (
      <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-sm animate-pulse">
        <div className="h-6 w-32 bg-gray-200 rounded-full mb-4"></div>
        <div className="h-24 w-full bg-gray-100 rounded-2xl"></div>
      </div>
    );
  }

  // --- VERIFIED STATE ---
  if (kycStatus?.hasDocument) {
    return (
      <div className="bg-white/80 backdrop-blur-xl border border-aid-green/30 rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(101,140,88,0.05)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <ShieldCheck size={120} className="text-aid-green" />
        </div>
        
        <div className="flex items-start gap-5 relative z-10">
          <div className="w-14 h-14 bg-aid-green/10 rounded-2xl flex items-center justify-center text-aid-green shrink-0">
            <CheckCircle2 size={32} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-heading font-black text-aid-dark">Verified Identity</h3>
              <span className="bg-aid-green text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">Gold Status</span>
            </div>
            <p className="text-sm text-gray-500 mb-4 font-medium">Your identity has been verified. You can now create and manage campaigns.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-aid-green/5 border border-aid-green/10 p-4 rounded-2xl">
                <span className="text-[10px] text-aid-green font-bold uppercase block mb-1">Verified Name</span>
                <span className="font-heading font-bold text-aid-dark truncate block">{kycStatus.document?.extractedName}</span>
              </div>
              <div className="bg-aid-green/5 border border-aid-green/10 p-4 rounded-2xl">
                <span className="text-[10px] text-aid-green font-bold uppercase block mb-1">National ID (NIK)</span>
                <span className="font-heading font-bold text-aid-dark truncate block">
                  {kycStatus.document?.extractedNik.slice(0, 6)}******{kycStatus.document?.extractedNik.slice(-4)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- UNVERIFIED / UPLOAD STATE ---
  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.05)]">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-aid-yellow/10 rounded-2xl flex items-center justify-center text-aid-yellow">
              <ShieldAlert size={28} />
            </div>
            <div>
              <h3 className="text-xl font-heading font-black text-aid-dark">Identity Verification</h3>
              <p className="text-xs text-aid-yellow font-bold uppercase tracking-wider">Required to Create Campaigns</p>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            AidBeacon uses AI-powered identity verification to ensure all campaigns are legitimate. 
            Please upload a clear photo of your Indonesian National ID (KTP).
          </p>

          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
              <div className="w-6 h-6 rounded-full bg-aid-green/10 text-aid-green flex items-center justify-center text-xs font-black">1</div>
              <span>Upload clear photo of your original KTP</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
              <div className="w-6 h-6 rounded-full bg-aid-green/10 text-aid-green flex items-center justify-center text-xs font-black">2</div>
              <span>AI will extract your Name and NIK</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
              <div className="w-6 h-6 rounded-full bg-aid-green/10 text-aid-green flex items-center justify-center text-xs font-black">3</div>
              <span>Instant verification after processing</span>
            </div>
          </div>
        </div>

        <div className="w-full md:w-72 shrink-0">
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          
          {!preview ? (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-48 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-gray-50 hover:border-aid-green transition-all group"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 group-hover:text-aid-green transition-colors">
                <Camera size={24} />
              </div>
              <div className="text-center px-4">
                <span className="text-sm font-bold text-aid-dark block">Click to Upload</span>
                <span className="text-[10px] text-gray-400 font-medium">JPEG, PNG up to 4MB</span>
              </div>
            </button>
          ) : (
            <div className="space-y-4">
              <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-gray-100 shadow-inner group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="KTP Preview" className="w-full h-full object-cover" />
                <button 
                  onClick={() => setPreview(null)}
                  className="absolute top-2 right-2 bg-white/80 backdrop-blur-md p-2 rounded-full text-red-500 hover:bg-white transition-all shadow-sm"
                >
                  <AlertCircle size={16} />
                </button>
              </div>
              
              <Button 
                variant="primary" 
                className="w-full py-4 relative overflow-hidden group"
                onClick={handleUpload}
                disabled={isUploading}
              >
                {isUploading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 size={20} className="animate-spin" />
                    <span className="animate-pulse">AI PROCESSING...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={20} />
                    <span>VERIFY IDENTITY</span>
                  </div>
                )}
                
                {isUploading && (
                  <div className="absolute bottom-0 left-0 h-1 bg-white/30 animate-progress-indefinite"></div>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
        <AlertCircle size={18} className="text-gray-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-gray-500 font-medium leading-relaxed uppercase tracking-wider">
          Privacy Note: Your KTP image is processed in-memory and not stored on our servers. 
          We only store the extracted data (Name and NIK) to comply with regional regulations.
        </p>
      </div>
    </div>
  );
};
