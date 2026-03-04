'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, MapPin, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { FACTORY_ADDRESS, FACTORY_ABI } from '~/constants/contracts';
import { uploadJSONToIPFS } from '~/utils/pinata';
import { createMeeting, generateToken } from '~/utils/videosdk';
import { getCurrentPosition, fetchLocationDetails, type LocationDetails } from '~/utils/location';
import { PROVINCES } from '~/constants/provinces';

interface LiveCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LiveCreationModal: React.FC<LiveCreationModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    targetAmount: '',
    province: ''
  });

  const [location, setLocation] = useState<LocationDetails | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');

  const [step, setStep] = useState<'form' | 'uploading' | 'blockchain' | 'success'>('form');
  const [generatedMeetingId, setGeneratedMeetingId] = useState<string | null>(null);

  const { data: hash, writeContract, isPending: isWalletConfirming, error: writeError } = useWriteContract();

  const { isLoading: isTransactionConfirming, isSuccess: isTransactionSuccess, error: receiptError } = useWaitForTransactionReceipt({
    hash,
    query: { enabled: !!hash, refetchInterval: 1000 }
  });

  // Auto-fetch location when modal opens
  useEffect(() => {
      if (isOpen && !location) {
          void handleGetLocation();
      }
  }, [isOpen, location]);

  const handleGetLocation = async () => {
      setIsLocating(true);
      setLocationError('');
      try {
          const pos = await getCurrentPosition();
          const details = await fetchLocationDetails(pos.coords.latitude, pos.coords.longitude);
          setLocation(details);
      } catch (err: unknown) {
          console.error('Location error:', err);
          setLocationError("Access denied or unavailable.");
      } finally {
          setIsLocating(false);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.targetAmount || !formData.province) {
        toast.error("Please fill all fields");
        return;
    }
    if (!location) {
        toast.error("Location permission is required for Live Verification");
        return;
    }

    try {
        setStep('uploading');

        // 1. Generate VideoSDK Meeting
        const token = await generateToken();
        if (!token) throw new Error("Failed to generate VideoSDK token");
        const meetingId = await createMeeting(token);
        if (!meetingId) throw new Error("Failed to create live meeting");
        setGeneratedMeetingId(meetingId);

        // 2. Upload Metadata
        const metadata = {
            name: formData.title,
            description: `Live Broadcast from ${location.formatted}`,
            category: "Emergency Relief",
            animation_url: `live://${meetingId}`,
            external_url: "https://aidbeacon.app",
            properties: {
                targetAmount: formData.targetAmount,
                endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                campaignType: 'live',
                province: formData.province,
                location: location
            }
        };

        const ipfsHash = await uploadJSONToIPFS(metadata) as string;
        if (!ipfsHash) throw new Error("Metadata upload failed");

        setStep('blockchain');

        // 3. Create Campaign
        writeContract({
            address: FACTORY_ADDRESS,
            abi: FACTORY_ABI,
            functionName: 'createCampaign',
            args: [
                formData.title,
                `ipfs://${ipfsHash}`,
                parseEther(formData.targetAmount),
                "Emergency Relief"
            ],
        });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Creation error:', error);
        toast.error('Creation Failed', { description: errorMessage });
        setStep('form');
    }
  };

  // Handle errors
  useEffect(() => {
    if (writeError) {
        const errorMsg = writeError.message.slice(0, 100);
        toast.error('Transaction Failed', { description: errorMsg });
    }
    if (receiptError) {
        toast.error('Transaction Receipt Failed');
    }
  }, [writeError, receiptError]);

  // Handle success
  useEffect(() => {
    if (isTransactionSuccess && generatedMeetingId) {
        setStep('success');
        toast.success('Campaign Live!', { description: 'Redirecting to Studio...' });

        setTimeout(() => {
            router.push(`/live/studio/${generatedMeetingId}`);
            onClose();
        }, 1500);
    }
  }, [isTransactionSuccess, generatedMeetingId, router, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl z-10 p-6 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-orange-500" />

            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  <h2 className="text-xl font-heading font-black text-aid-dark">GO LIVE</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-aid-offwhite rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {step === 'success' ? (
                 <div className="text-center py-12">
                    <div className="w-16 h-16 bg-[#F0E491]/20 text-[#658C58] rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                        <Radio size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-[#658C58] mb-2">You are LIVE!</h3>
                    <p className="text-[#658C58]/70">Redirecting to studio...</p>
                </div>
            ) : step === 'uploading' || step === 'blockchain' || isTransactionConfirming ? (
                <div className="text-center py-12 space-y-4">
                    <Loader2 className="w-12 h-12 text-[#BBC863] animate-spin mx-auto" />
                    <div>
                        <h3 className="font-bold text-lg text-[#658C58]">
                            {step === 'uploading' ? 'Setting up Studio...' : 'Deploying to Blockchain...'}
                        </h3>
                        <p className="text-sm text-[#658C58]/60 px-8">
                            Creating your decentralized live stream room. Please verify the transaction in your wallet.
                        </p>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">

                {/* Location Badge */}
                <div className="bg-[#F0E491]/20 border border-[#BBC863]/30 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#F0E491]/40 rounded-full flex items-center justify-center shrink-0">
                        {isLocating ? <Loader2 size={18} className="animate-spin text-[#658C58]"/> : <MapPin size={18} className="text-[#658C58]"/>}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-[#658C58] font-bold uppercase tracking-wider">Your Location</p>
                        <p className="text-sm font-bold text-[#658C58]/80 truncate">
                            {location ? location.formatted : isLocating ? "Getting location..." : locationError || "Please allow location"}
                        </p>
                    </div>
                    {!location && !isLocating && (
                        <button type="button" onClick={handleGetLocation} className="text-xs font-bold text-[#BBC863] hover:underline">Retry</button>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-bold text-[#658C58] mb-1">Title (Incident)</label>
                    <input
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#BBC863] focus:ring-1 focus:ring-[#BBC863] transition-all font-bold text-[#658C58]"
                    placeholder="e.g. Flash Flood at Village..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-[#658C58] mb-1">Province</label>
                    <div className="relative">
                        <input
                            list="provinces_live"
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#BBC863] focus:ring-1 focus:ring-[#BBC863] text-[#658C58]"
                            placeholder="Select Province..."
                            value={formData.province}
                            onChange={(e) => setFormData({...formData, province: e.target.value })}
                        />
                        <datalist id="provinces_live">
                            {PROVINCES.map((p) => (
                                <option key={p} value={p} />
                            ))}
                        </datalist>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-[#658C58] mb-1">Target Amount (IDRX)</label>
                    <input
                    type="number"
                    step="1000"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#BBC863] focus:ring-1 focus:ring-[#BBC863] font-mono text-[#658C58]"
                    placeholder="e.g. 5000000"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    />
                </div>

                <div className="pt-4">
                    <button
                    type="submit"
                    className="w-full bg-[#BBC863] hover:bg-[#AAB752] text-white font-black py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    disabled={!location || isWalletConfirming}
                    >
                    {isWalletConfirming ? <Loader2 className="animate-spin" size={20} /> : null}
                    START LIVE NOW
                    </button>
                    <p className="text-xs text-center text-[#658C58]/50 mt-2">
                        Requires permission to access camera and microphone.
                    </p>
                </div>
                </form>
            )}

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LiveCreationModal;
