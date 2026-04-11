'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle2, UploadCloud, Video as VideoIcon, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { FACTORY_ADDRESS, FACTORY_ABI } from '~/constants/contracts';
import Button from '../ui/button';
import { uploadJSONToIPFS } from '~/utils/pinata';
import { uploadVideoFile } from '~/lib/video';
import { createMeeting, generateVideoSDKToken } from '~/utils/videosdk';
import { PROVINCES } from '~/constants/provinces';
import { api } from '~/trpc/react';

interface CampaignCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CampaignCreationModal: React.FC<CampaignCreationModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAmount: '',
    category: 'Disaster Relief',
    endDate: '',
    province: ''
  });
  const [campaignType, setCampaignType] = useState<'video' | 'live'>('video');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadStep, setUploadStep] = useState<'idle' | 'uploading_video' | 'uploading_metadata' | 'blockchain' | 'success'>('idle');
  const [generatedMeetingId, setGeneratedMeetingId] = useState<string | null>(null);

  const [uploadProgress, setUploadProgress] = useState(0);

  // save campaign to database via tRPC
  const createCampaignMutation = api.campaign.createCampaign.useMutation({
    onSuccess: async (data) => {
      console.log('Campaign saved to database:', data);
    },
    onError: (error) => {
      console.error('Failed to save campaign to database:', error);
      toast.error('Failed to save campaign to database');
    },
  });

  const { data: hash, writeContract, isPending: isWalletConfirming, error: writeError } = useWriteContract();
  
  const { isLoading: isTransactionConfirming, isSuccess: isTransactionSuccess, error: receiptError } = useWaitForTransactionReceipt({
    hash,
    query: {
        enabled: !!hash,
        refetchInterval: 1000, 
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.targetAmount) {
        toast.error("Please fill all fields");
        return;
    }
    if (formData.description.length < 20) {
        toast.error("Description must contain at least 20 characters");
        return;
    }
    if (!formData.endDate) {
        toast.error("Please select an end date");
        return;
    }
    if (campaignType === 'video' && !videoFile) {
        toast.error("Please upload a video pitch");
        return;
    }

    try {
        let contentHash = '';

        if (campaignType === 'video' && videoFile) {
             setUploadStep('uploading_video');
             const result = await uploadVideoFile(videoFile, {
               onProgress: (progress) => setUploadProgress(progress),
             });
             if (!result.ipfsHash) throw new Error("Video upload failed");
             contentHash = `ipfs://${result.ipfsHash}`;
        } else {
             setUploadStep('uploading_video');
             const token = await generateVideoSDKToken();
             if (!token) throw new Error("Token generation failed");
             const meetingId = await createMeeting(token);
             if (!meetingId) throw new Error("Failed to create live meeting");
             contentHash = `live://${meetingId}`;
             setGeneratedMeetingId(meetingId);
        }

        setUploadStep('uploading_metadata');

        const metadata = {
            name: formData.title,
            description: formData.description,
            category: formData.category,
            animation_url: contentHash,
            external_url: "https://aidbeacon.app",
            properties: {
                targetAmount: formData.targetAmount,
                endDate: formData.endDate,
                campaignType: campaignType,
                province: formData.province
            }
        };

        const ipfsHash = await uploadJSONToIPFS(metadata);

        if (!ipfsHash) throw new Error("Metadata upload failed");

        // step 1: save to database via tRPC first
        setUploadStep('blockchain');
        toast.info('Saving campaign to database...');

        // generate dummy items from description (minimal 1 item required by schema)
        const campaignItems = formData.description.split('. ')
          .filter(s => s.trim().length > 0)
          .slice(0, 5)
          .map((desc) => ({
            itemName: desc.slice(0, 50) || 'Campaign item',
            quantity: 1,
            estimatedPrice: Math.max(1, Math.floor(Number(formData.targetAmount) / 5)),
          }));

        if (campaignItems.length === 0) {
          campaignItems.push({
            itemName: formData.title.slice(0, 50),
            quantity: 1,
            estimatedPrice: Number(formData.targetAmount),
          });
        }

        try {
          await createCampaignMutation.mutateAsync({
            title: formData.title,
            pitchVideoUrl: campaignType === 'video' ? contentHash : undefined,
            category: formData.category,
            province: formData.province,
            targetAmount: Number(formData.targetAmount),
            endDate: new Date(formData.endDate).toISOString(),
            description: formData.description,
            items: campaignItems,
          });
          toast.success('Campaign saved to database!');
        } catch (trpcError) {
          console.error('tRPC error:', trpcError);
          toast.error('Failed to save to database', {
            description: trpcError instanceof Error ? trpcError.message : 'Unknown error',
          });
          setUploadStep('idle');
          return;
        }

        // step 2: call blockchain
        writeContract({
            address: FACTORY_ADDRESS,
            abi: FACTORY_ABI,
            functionName: 'createCampaign',
            args: [
                formData.title,
                `ipfs://${ipfsHash}`,
                parseEther(formData.targetAmount),
                formData.category
            ],
        });

    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        toast.error('Creation Failed', { description: errorMessage });
        setUploadStep('idle');
    }
  };

  const resetForm = React.useCallback(() => {
      setFormData({
        title: '',
        description: '',
        targetAmount: '',
        category: 'Disaster Relief',
        endDate: '',
        province: ''
      });
      onClose();
  }, [onClose]);

  useEffect(() => {
    if (writeError) {
        toast.error('Transaction Failed', {
            description: writeError.message.slice(0, 100) + (writeError.message.length > 100 ? '...' : ''),
        });
    }
    if (receiptError) {
        toast.error('Transaction Receipt Failed', {
            description: receiptError.message
        });
    }
  }, [writeError, receiptError]);

  useEffect(() => {
    if (isTransactionSuccess) {
        toast.success('Campaign Created Successfully!', {
            description: 'Your campaign is now live on the blockchain.'
        });

        let timer: NodeJS.Timeout;

        if (campaignType === 'live' && generatedMeetingId) {
             timer = setTimeout(() => {
                router.push(`/live/studio/${generatedMeetingId}`);
                onClose();
             }, 1500);
        } else {
             timer = setTimeout(() => {
                resetForm();
             }, 3000);
        }

        return () => clearTimeout(timer);
    }
  }, [isTransactionSuccess, campaignType, generatedMeetingId, router, onClose, resetForm]);

  useEffect(() => {
    if (uploadStep === 'uploading_video') {
        // progress now handled by uploadVideoFile's onProgress callback
        // this interval only runs as fallback if progress stalls
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 0.95) return prev; // don't auto-increment past 95%
                const increment = Math.random() * 0.05;
                return Math.min(prev + increment, 0.95);
            });
        }, 1000);
        return () => clearInterval(interval);
    }
  }, [uploadStep]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl z-10 max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-heading font-bold text-aid-dark">Start a Campaign</h2>
                  <p className="text-sm text-gray-500 mt-1">Create a fundraising campaign for your cause</p>
                </div>
                <button 
                  onClick={onClose} 
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {isTransactionSuccess ? (
                 <div className="text-center py-12">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 15, stiffness: 200 }}
                      className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm"
                    >
                        <CheckCircle2 size={40} />
                    </motion.div>
                    <h3 className="text-2xl font-heading font-bold text-aid-dark mb-3">Campaign Created!</h3>
                    <p className="text-gray-600 max-w-sm mx-auto">Your campaign is now live on the blockchain and visible to supporters.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Campaign Type Selector */}
                  <div>
                    <label className="block text-sm font-semibold text-aid-dark mb-2">Campaign Type</label>
                    <div className="flex bg-gray-100 p-1.5 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setCampaignType('video')}
                            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                                campaignType === 'video' 
                                  ? 'bg-white text-aid-dark shadow-sm ring-1 ring-gray-200' 
                                  : 'text-gray-500 hover:text-aid-dark'
                            }`}
                        >
                            <VideoIcon size={16} /> Pre-recorded Video
                        </button>
                        <button
                            type="button"
                            onClick={() => setCampaignType('live')}
                            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                                campaignType === 'live' 
                                  ? 'bg-white text-red-600 shadow-sm ring-1 ring-gray-200' 
                                  : 'text-gray-500 hover:text-aid-dark'
                            }`}
                        >
                            <div className={`w-2 h-2 rounded-full ${campaignType === 'live' ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
                            Go Live
                        </button>
                    </div>
                  </div>

                  {/* Video Upload / Live Info */}
                  {campaignType === 'video' ? (
                    <div>
                        <label className="block text-sm font-semibold text-aid-dark mb-2">Video Pitch (Max 60s)</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-aid-green/60 transition-colors cursor-pointer relative bg-gray-50/50 group hover:bg-gray-50">
                            <input
                                type="file"
                                accept="video/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        if (file.size > 50 * 1024 * 1024) return toast.error("File too large (Max 50MB)");
                                        setVideoFile(file);
                                    }
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            {videoFile ? (
                                <div className="flex items-center justify-center gap-3 text-aid-green">
                                    <div className="w-10 h-10 bg-aid-green/10 rounded-lg flex items-center justify-center">
                                      <VideoIcon size={20} />
                                    </div>
                                    <div className="text-left flex-1 min-w-0">
                                      <p className="font-semibold truncate">{videoFile.name}</p>
                                      <p className="text-xs text-gray-500">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                                    </div>
                                    <button 
                                      onClick={(e) => { e.preventDefault(); setVideoFile(null); }} 
                                      className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 z-10 transition-colors"
                                    >
                                      <X size={18}/>
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-aid-green/70">
                                    <UploadCloud size={36} className="mb-3" />
                                    <p className="text-sm font-semibold text-gray-600">Click to upload video</p>
                                    <p className="text-xs mt-1">MP4, WebM (Max 50MB, 60s)</p>
                                </div>
                            )}
                        </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-100 rounded-xl p-5 text-center">
                        <div className="w-14 h-14 bg-white/80 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-3 text-red-500 shadow-sm">
                            <Radio size={24} />
                        </div>
                        <h4 className="text-red-800 font-bold mb-1.5">Live Fundraising Event</h4>
                        <p className="text-xs text-red-600/80 leading-relaxed">
                            A live streaming room will be created for you. Start streaming immediately after the campaign is deployed on-chain.
                        </p>
                    </div>
                  )}

                  {/* Form Fields */}
                  <div>
                    <label className="block text-sm font-semibold text-aid-dark mb-1.5">Campaign Title</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-aid-green focus:ring-2 focus:ring-aid-green/20 transition-all bg-gray-50/50 focus:bg-white"
                      placeholder="e.g., Flood Relief for Village X"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-aid-dark mb-1.5">Category</label>
                      <select
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-aid-green focus:ring-2 focus:ring-aid-green/20 transition-all bg-gray-50/50 focus:bg-white appearance-none"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        <option value="Disaster Relief">Disaster Relief</option>
                        <option value="Infrastructure Repair">Infrastructure Repair</option>
                        <option value="Medical Aid">Medical Aid</option>
                        <option value="Emergency Shelter">Emergency Shelter</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-aid-dark mb-1.5">Province</label>
                      <input
                        list="provinces"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-aid-green focus:ring-2 focus:ring-aid-green/20 transition-all bg-gray-50/50 focus:bg-white"
                        placeholder="Select province..."
                        value={formData.province}
                        onChange={(e) => setFormData({...formData, province: e.target.value})}
                      />
                      <datalist id="provinces">
                        {PROVINCES.map((p) => (
                            <option key={p} value={p} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-aid-dark mb-1.5">Target Amount (IDRX)</label>
                      <input
                        type="number"
                        step="1000"
                        required
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-aid-green focus:ring-2 focus:ring-aid-green/20 transition-all bg-gray-50/50 focus:bg-white"
                        placeholder="5000000"
                        value={formData.targetAmount}
                        onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-aid-dark mb-1.5">End Date</label>
                      <input
                        type="date"
                        required
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-aid-green focus:ring-2 focus:ring-aid-green/20 transition-all bg-gray-50/50 focus:bg-white"
                        value={formData.endDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                        <label className="text-sm font-semibold text-aid-dark">Description</label>
                        <span className={`text-xs font-medium ${formData.description.length >= 320 ? 'text-red-500' : 'text-gray-400'}`}>
                            {350 - formData.description.length} chars left
                        </span>
                    </div>
                    <textarea
                      required
                      rows={3}
                      maxLength={350}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-aid-green focus:ring-2 focus:ring-aid-green/20 transition-all bg-gray-50/50 focus:bg-white resize-none"
                      placeholder="Tell your story and why funds are needed..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </form>
              )}
            </div>

            {/* Footer / Submit Button */}
            {!isTransactionSuccess && (
              <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-3xl">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full justify-center py-3 text-base font-semibold shadow-lg shadow-aid-green/20"
                  disabled={uploadStep !== 'idle' || isWalletConfirming || isTransactionConfirming}
                  onClick={handleSubmit}
                >
                  {uploadStep === 'uploading_video' ? (
                      <>
                      <Loader2 className="animate-spin mr-2" size={18} />
                      {campaignType === 'live' ? 'Creating Live Room...' : `Uploading Video (${Math.round(uploadProgress * 100)}%)`}
                      </>
                  ) : uploadStep === 'uploading_metadata' ? (
                      <>
                      <Loader2 className="animate-spin mr-2" size={18} />
                      Pinning to IPFS...
                      </>
                  ) : isWalletConfirming || uploadStep === 'blockchain' ? (
                      <>
                      <Loader2 className="animate-spin mr-2" size={18} />
                      Confirm in Wallet...
                      </>
                  ) : isTransactionConfirming ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={18} />
                      Deploying Contract...
                    </>
                  ) : (
                      "Create Campaign"
                  )}
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CampaignCreationModal;
