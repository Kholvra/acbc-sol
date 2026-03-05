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
import { uploadJSONToIPFS, uploadFileToIPFS } from '~/utils/pinata';
import { createMeeting, generateVideoSDKToken } from '~/utils/videosdk';
import { PROVINCES } from '~/constants/provinces';

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
    if (campaignType === 'video' && !videoFile) {
        toast.error("Please upload a video pitch");
        return;
    }

    try {
        let contentHash = '';

        if (campaignType === 'video' && videoFile) {
             setUploadStep('uploading_video');
             const hash = await uploadFileToIPFS(videoFile);
             setUploadProgress(1);
             if (!hash) throw new Error("Video upload failed");
             contentHash = `ipfs://${hash}`;
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

        setUploadStep('blockchain');

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

  const resetForm = () => {
      setFormData({
        title: '',
        description: '',
        targetAmount: '',
        category: 'Disaster Relief',
        endDate: '',
        province: ''
      });
      onClose();
  }

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
        setUploadProgress(0);
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 0.9) return prev;
                const increment = Math.random() * 0.1;
                return Math.min(prev + increment, 0.9);
            });
        }, 500);
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl z-10 p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-heading font-bold text-aid-dark">Start a Campaign</h2>
              <button onClick={onClose} className="p-2 hover:bg-aid-offwhite rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {isTransactionSuccess ? (
                 <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-aid-dark mb-2">Campaign Created!</h3>
                    <p className="text-gray-600">Your campaign has been successfully deployed to the blockchain.</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-aid-dark mb-1">Campaign Title</label>
                    <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-aid-green focus:ring-1 focus:ring-aid-green transition-all"
                    placeholder="e.g., Flood Relief for Village X"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-aid-dark mb-2">Campaign Type</label>
                    <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
                        <button
                            type="button"
                            onClick={() => setCampaignType('video')}
                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                                campaignType === 'video' ? 'bg-white text-aid-dark shadow-sm' : 'text-gray-500 hover:text-aid-dark'
                            }`}
                        >
                            <VideoIcon size={16} /> Pre-recorded Video
                        </button>
                        <button
                            type="button"
                            onClick={() => setCampaignType('live')}
                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                                campaignType === 'live' ? 'bg-white text-red-500 shadow-sm' : 'text-gray-500 hover:text-aid-dark'
                            }`}
                        >
                            <div className={`w-2 h-2 rounded-full ${campaignType === 'live' ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
                            Go Live
                        </button>
                    </div>

                    {campaignType === 'video' ? (
                        <>
                            <label className="block text-sm font-bold text-aid-dark mb-1">Video Pitch (Max 60s)</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-aid-green transition-colors cursor-pointer relative bg-gray-50 group">
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
                                    <div className="flex items-center justify-center gap-2 text-aid-green font-bold">
                                        <VideoIcon size={24} />
                                        <span className="truncate max-w-[200px]">{videoFile.name}</span>
                                        <button onClick={(e) => { e.preventDefault(); setVideoFile(null); }} className="p-1 hover:bg-red-100 rounded-full text-red-500 z-10"><X size={16}/></button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-aid-green">
                                        <UploadCloud size={32} className="mb-2" />
                                        <p className="text-sm font-semibold">Click to upload video</p>
                                        <p className="text-xs">MP4, WebM (Max 60s)</p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2 text-red-500">
                                <Radio size={24} />
                            </div>
                            <h4 className="text-red-800 font-bold mb-1">Live Fundraising Event</h4>
                            <p className="text-xs text-red-600/80">
                                A live streaming room will be created for you. You can start streaming immediately after the campaign is deployed on-chain.
                            </p>
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-bold text-aid-dark mb-1">Category</label>
                    <select
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-aid-green focus:ring-1 focus:ring-aid-green"
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
                    <label className="block text-sm font-bold text-aid-dark mb-1">Location (Province)</label>
                    <div className="relative">
                        <input 
                            list="provinces" 
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-aid-green focus:ring-1 focus:ring-aid-green"
                            placeholder="Search province..."
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

                <div>
                    <label className="block text-sm font-bold text-aid-dark mb-1">Target Amount (IDRX)</label>
                    <input
                    type="number"
                    step="1000"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-aid-green focus:ring-1 focus:ring-aid-green transition-all"
                    placeholder="e.g., 5000000"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-aid-dark mb-1">End Date</label>
                    <input
                    type="date"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-aid-green focus:ring-1 focus:ring-aid-green transition-all"
                    value={formData.endDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-sm font-bold text-aid-dark">Description</label>
                        <span className={`text-xs font-bold ${formData.description.length >= 350 ? 'text-red-500' : 'text-gray-400'}`}>
                            {350 - formData.description.length} chars left
                        </span>
                    </div>
                    <textarea
                    required
                    rows={4}
                    maxLength={350}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-aid-green focus:ring-1 focus:ring-aid-green transition-all resize-none"
                    placeholder="Tell your story and why funds are needed..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div className="pt-4">
                    <Button
                    type="submit"
                    variant="primary"
                    className="w-full justify-center"
                    disabled={uploadStep !== 'idle' || isWalletConfirming || isTransactionConfirming}
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
                </form>
            )}
            
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CampaignCreationModal;
