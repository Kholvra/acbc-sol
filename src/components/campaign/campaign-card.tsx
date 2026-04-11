'use client';

import React, { useEffect, useState } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { CAMPAIGN_ABI, IDRX_ADDRESS, IDRX_ABI } from '~/constants/contracts';
import { formatEther, parseEther } from 'viem';
import { Heart, Share2, Pause, Play, Volume2, VolumeX, Users, Music2, ChevronUp, ChevronDown, MapPin, Loader2 } from 'lucide-react';
import { fetchJSONFromIPFS } from '~/utils/pinata';
import { SwipeGestureWrapper } from './swipe-gesture-wrapper';
import { useQuickDonate } from '~/hooks/use-quick-donate';
import { QUICK_DONATE_AMOUNT } from '~/constants/donation';

interface CampaignCardProps {
  address: string;
}

interface OffchainMetadata {
  name?: string;
  description?: string;
  image?: string;
  animation_url?: string;
  properties?: {
    province?: string;
    endDate?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

function isMobileDevice() {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

const CampaignCard: React.FC<CampaignCardProps> = ({ address }) => {
  const router = useRouter();
  const { address: userAddress } = useAccount();
  const isMobile = isMobileDevice();

  const { data: metadata, isLoading: isMetadataLoading } = useReadContract({
    address: address as `0x${string}`,
    abi: CAMPAIGN_ABI,
    functionName: 'metadata',
  });

  const { data: totalRaised, refetch: refetchTotalRaised } = useReadContract({
    address: address as `0x${string}`,
    abi: CAMPAIGN_ABI,
    functionName: 'totalRaised',
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
      address: IDRX_ADDRESS,
      abi: IDRX_ABI,
      functionName: 'allowance',
      args: userAddress ? [userAddress, address as `0x${string}`] : undefined,
  });

  const { executeQuickDonate, isProcessing: isQuickDonatingProcess } = useQuickDonate({
    campaignAddress: address as `0x${string}`,
    onSuccess: () => {
      void refetchTotalRaised();
      setIsExpanded(false);
    },
  });

  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [isMuted, setIsMuted] = React.useState(true);
  const [isLiked, setIsLiked] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  const [donationAmount, setDonationAmount] = React.useState('');
  const [isDonating, setIsDonating] = React.useState(false);
  const [isQuickDonating, setIsQuickDonating] = React.useState(false);

  const { writeContract, data: hash, isPending, error: txError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const [step, setStep] = useState<'idle' | 'approving' | 'ready' | 'donating'>('idle');

  useEffect(() => {
    if (isConfirmed) {
        if (step === 'approving') {
            void toast.success("Approval Successful!", { description: "Now click Donate to complete." });
            void refetchAllowance();
            setStep('ready');
        } else if (step === 'donating') {
            void toast.success("Donation Successful!", { description: "Thank you for your contribution." });
            void refetchTotalRaised();
            setStep('idle');
            setDonationAmount('');
            setIsDonating(false);
            setIsQuickDonating(false);
        }
    }
    if (txError) {
        void toast.error("Transaction Failed");
        setStep('idle');
    }
  }, [isConfirmed, step, refetchAllowance, refetchTotalRaised, txError]);

  const handleAction = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!donationAmount) return;
      
      const amountBigInt = parseEther(donationAmount);
      const currentAllowance = allowance ?? BigInt(0);

      if (step === 'ready' || currentAllowance >= amountBigInt) {
            setStep('donating');
            writeContract({
                address: address as `0x${string}`,
                abi: CAMPAIGN_ABI,
                functionName: 'donate',
                args: [amountBigInt],
            });
      } else {
            setStep('approving');
            writeContract({
                address: IDRX_ADDRESS,
                abi: IDRX_ABI,
                functionName: 'approve',
                args: [address as `0x${string}`, amountBigInt],
            });
      }
  };

  // State for off-chain metadata
  const [offchainData, setOffchainData] = React.useState<OffchainMetadata | null>(null);
  
  // Type-safe metadata parsing
  const [title, description, targetAmount, category] = metadata
    ? (metadata as [string, string, bigint, string])
    : ['', '', BigInt(0), ''];
  const isIPFS = description?.startsWith('ipfs://');

  useEffect(() => {
    if (isIPFS && description) {
        void fetchJSONFromIPFS(description).then((data: unknown) => {
            if (data && typeof data === 'object') {
                setOffchainData(data as OffchainMetadata);
            }
        }).catch((err: unknown) => {
            console.error('Failed to fetch IPFS metadata:', err);
        });
    }
  }, [description, isIPFS]);

  if (isMetadataLoading) {
    return (
      <div className="h-full w-full bg-white animate-pulse flex items-center justify-center rounded-xl shadow-sm border border-aid-green/10">
        <div className="text-aid-dark/40 font-heading font-bold">Loading Campaign...</div>
      </div>
    );
  }

  if (!metadata) return null;

  const raised = totalRaised ? formatEther(totalRaised) : '0';
  const target = targetAmount ? formatEther(targetAmount) : '0';
  const progress = Math.min((Number(raised) / Number(target)) * 100, 100);

  const displayDescription = offchainData?.description ?? (isIPFS ? "Loading details..." : description);
  const displayTitle = offchainData?.name ?? title;

  const getButtonText = () => {
      if (isPending || isConfirming) return <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />;
      if (!donationAmount) return 'Enter Amount';
      if (step === 'ready') return 'Step 2/2: Donate';
      const val = parseEther(donationAmount);
      const allow = allowance ?? BigInt(0);
      if (allow < val) return 'Step 1/2: Approve';
      return 'Step 2/2: Donate';
  };

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                void videoRef.current.play().catch((err: unknown) => {
                    console.error('Video play error:', err);
                });
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            toast.success("Link copied to clipboard!");
        } catch (err) {
            console.error('Failed to copy', err);
            toast.error('Failed to copy link');
        }
    };

  return (
    <div className="relative h-screen md:h-full w-full bg-black md:bg-white md:rounded-3xl overflow-hidden snap-start flex-shrink-0 shadow-lg md:border border-aid-green/10">
        
        {/* Desktop Donate Button - Right Side */}
        <div className={`hidden md:flex absolute right-4 md:bottom-8 z-50 flex-col gap-2 transition-opacity duration-300 ${isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        executeQuickDonate();
                    }}
                    disabled={isQuickDonatingProcess}
                    aria-label={`Quick donate ${QUICK_DONATE_AMOUNT} IDRX`}
                    className="bg-aid-green hover:bg-aid-dark text-white font-black w-14 h-14 rounded-full shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed items-center justify-center group border-2 border-white/20 focus:outline-none focus:ring-2 focus:ring-aid-green focus:ring-offset-2"
                >
                    {isQuickDonatingProcess ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                        <Heart className="w-6 h-6 fill-current group-hover:scale-110 transition-transform" />
                    )}
                </button>
            </div>

        <SwipeGestureWrapper 
            onSwipeRight={executeQuickDonate}
            enabled={!isExpanded && isMobile}
        >
            <div className="absolute inset-0 bg-black flex items-center justify-center overflow-hidden" onClick={async (e) => {
                const animationUrl = offchainData?.animation_url;
                if (animationUrl?.startsWith('live://')) {
                    e.stopPropagation();
                    const meetingId = animationUrl.replace('live://', '');
                    try {
                        router.push(`/live/view/${meetingId}`);
                    } catch (err) {
                        console.error('Navigation failed:', err);
                        toast.error('Failed to open live stream');
                    }
                    return;
                }
                togglePlay();
            }}>
                {offchainData?.animation_url ? (
                    offchainData.animation_url.startsWith('live://') ? (
                        <div className="w-full h-full relative group cursor-pointer">
                            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-20 h-20 rounded-full border-4 border-red-500 flex items-center justify-center animate-pulse mx-auto mb-4">
                                        <div className="w-16 h-16 bg-red-500 rounded-full" />
                                    </div>
                                    <h3 className="text-white font-bold text-xl uppercase tracking-widest">Live Now</h3>
                                    <p className="text-white/60 text-sm mt-2">Click to Watch</p>
                                </div>
                            </div>
                            <div className="absolute top-4 left-4 flex gap-2">
                                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-sm animate-pulse">LIVE</span>
                                <span className="bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-sm flex items-center gap-1"><Users size={12}/> 1.2k</span>
                            </div>
                        </div>
                    ) : (
                        <video 
                            ref={videoRef}
                            className="w-full h-full object-cover"
                            autoPlay
                            muted={isMuted}
                            loop
                            playsInline
                            src={offchainData.animation_url.replace('ipfs://', process.env.NEXT_PUBLIC_GATEWAY_URL ? `${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/` : 'https://gateway.pinata.cloud/ipfs/')}
                            onError={(e) => console.error("Video Error:", e)}
                        />
                    )
                ) : (
                    <div className="w-full h-full bg-gradient-to-b from-aid-light to-white flex items-center justify-center">
                        <div className="text-aid-green/20">
                            <Music2 size={120} strokeWidth={1} />
                        </div>
                    </div>
                )}
            </div>

            <div className={`absolute right-4 top-24 flex flex-col items-center gap-4 z-40 transition-opacity duration-300 ${isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="flex flex-col items-center gap-1 group">
                    <div className="w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center transition-all shadow-sm border border-white/30">
                        {isPlaying ? <Pause size={22} className="text-white fill-current" /> : <Play size={22} className="text-white fill-current ml-1" />}
                    </div>
                    <span className="text-xs font-bold text-white drop-shadow-md">{isPlaying ? 'Pause' : 'Play'}</span>
                </button>
                <button onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked); }} className="flex flex-col items-center gap-1 group">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm border border-white/30 backdrop-blur-md ${isLiked ? 'bg-red-500/80 border-red-500' : 'bg-white/20 hover:bg-white/40'}`}>
                        <Heart size={22} className={`transition-colors ${isLiked ? 'text-white fill-current' : 'text-white'}`} />
                    </div>
                    <span className="text-xs font-bold text-white drop-shadow-md">{isLiked ? '80.3K' : '80.2K'}</span>
                </button>
                <button onClick={(e) => { e.stopPropagation(); toggleMute(); }} className="flex flex-col items-center gap-1 group">
                    <div className="w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center transition-all shadow-sm border border-white/30">
                        {isMuted ? <VolumeX size={22} className="text-white" /> : <Volume2 size={22} className="text-white" />}
                    </div>
                    <span className="text-xs font-bold text-white drop-shadow-md">{isMuted ? 'Muted' : 'Sound'}</span>
                </button>
                <button onClick={async (e) => { e.stopPropagation(); await handleShare(); }} className="flex flex-col items-center gap-1 group">
                    <div className="w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center transition-all shadow-sm border border-white/30">
                        <Share2 size={22} className="text-white" />
                    </div>
                    <span className="text-xs font-bold text-white drop-shadow-md">Share</span>
                </button>
            </div>

            <div 
                className={`absolute bottom-0 left-0 right-0 bg-white/10 backdrop-blur-md border-t border-white/20 shadow-[0_-8px_32px_rgba(0,0,0,0.1)] transition-all duration-500 ease-in-out z-30 flex flex-col ${
                    isExpanded ? 'h-[85%] rounded-t-3xl bg-black/60 pb-28 md:pb-6' : 'h-auto p-6 pt-10 pb-28 md:pb-6'
                }`}
            >
                {!isQuickDonating && (
                    <div 
                        className="absolute top-0 left-0 right-0 h-10 flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors z-50"
                        onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                    >
                        {isExpanded ? <ChevronDown size={24} className="text-white/80 animate-bounce" /> : <ChevronUp size={24} className="text-white/80 animate-bounce" />}
                    </div>
                )}

                <div className={`flex flex-col h-full relative ${isExpanded ? 'p-6 pt-10 overflow-hidden' : ''}`}> 
                    
                    {isQuickDonating ? (
                        <div className="flex flex-col h-full justify-center animate-in fade-in slide-in-from-bottom-4 p-6">
                            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 w-full cursor-auto" onClick={(e) => e.stopPropagation()}>
                                <label className="text-white text-xs font-bold uppercase tracking-wider mb-2 block">Quick Donate (IDRX)</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="number" 
                                        value={donationAmount}
                                        onChange={(e) => setDonationAmount(e.target.value)}
                                        step="1000"
                                        disabled={isPending || isConfirming || step === 'ready'}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-heading font-bold focus:outline-none focus:border-aid-green transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="50000"
                                        autoFocus
                                    />
                                    <button 
                                        onClick={handleAction}
                                        disabled={isPending || isConfirming || !donationAmount}
                                        className="bg-aid-green text-white font-bold px-6 rounded-xl hover:bg-aid-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all min-w-[100px] flex items-center justify-center text-sm"
                                    >
                                        {getButtonText()}
                                    </button>
                                </div>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setIsQuickDonating(false); setStep('idle'); }} 
                                    className="text-white/50 text-xs font-bold mt-3 hover:text-white transition-colors w-full text-center flex items-center justify-center gap-1"
                                >
                                    <ChevronDown size={14}/> Go Back
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                    <div className="mb-2 shrink-0 transition-transform duration-300 flex flex-col flex-1 min-h-0">
                        <div className="mb-2 shrink-0"> 
                            <div className="flex flex-wrap gap-2 mb-2">
                                <span className="bg-aid-yellow/90 text-aid-dark text-[10px] font-bold px-2 py-0.5 rounded-full border border-aid-green/20 uppercase tracking-wider shadow-sm whitespace-nowrap">
                                    {category}
                                </span>
                                {offchainData?.properties?.province && (
                                    <span className="bg-blue-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20 uppercase tracking-wider shadow-sm flex items-center gap-1 whitespace-nowrap">
                                        <MapPin size={10} /> {offchainData.properties.province}
                                    </span>
                                )}
                            </div>
                                
                            <h3 className={`text-white font-heading font-black leading-tight drop-shadow-md transition-all w-full ${isExpanded ? 'text-2xl' : 'text-xl'}`}>
                                {displayTitle || `@${address.slice(0, 6)}...`}
                            </h3>
                            
                            {offchainData?.properties?.endDate && (
                                <div className="flex items-center gap-1 mt-1">
                                    <span className="bg-white/20 backdrop-blur-md text-white/90 text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/10 uppercase tracking-wider flex items-center gap-1">
                                        ⏳ {Math.ceil((new Date(offchainData.properties.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) > 0 
                                            ? `${Math.ceil((new Date(offchainData.properties.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} Days Left` 
                                            : 'Ended'}
                                    </span>
                                </div>
                            )}
                        </div>
                        
                        <div className={`transition-all duration-300 ease-in-out flex-1 flex flex-col min-h-0 ${isExpanded ? 'opacity-100' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                            <div className="bg-[#BBC863] text-white rounded-xl p-4 mt-1 mb-2 shadow-sm flex-1 overflow-y-auto custom-scrollbar">
                                <p className="font-bold mb-1 block sticky top-0 bg-[#BBC863] pb-1">Description Campaign:</p>
                                <div className="font-body leading-relaxed text-sm whitespace-pre-wrap">
                                    {displayDescription}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto shrink-0 pb-2 z-20 relative">
                        <div className="flex items-end gap-3">
                            <div className="flex-1">
                                <div className="w-full bg-white/30 h-3 rounded-full overflow-hidden mb-1 backdrop-blur-sm relative state-layer">
                                    <div 
                                        className="bg-aid-green h-full rounded-full transition-all duration-1000 ease-out" 
                                        style={{width: `${progress}%`}}
                                    />
                                </div>
                                <div className="flex justify-between text-xs font-bold text-white/80 font-heading drop-shadow-md">
                                    <span>IDRX {Number(raised).toLocaleString('id-ID')}</span>
                                    <span>Goal: IDRX {Number(target).toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                            
                            {!isExpanded && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setIsQuickDonating(true); }}
                                    className="w-8 h-8 rounded-full bg-aid-green flex items-center justify-center text-white hover:bg-aid-dark hover:scale-110 active:scale-95 transition-all shadow-md z-40 shrink-0 mb-4" 
                                >
                                    <span className="font-heading font-black text-lg pb-0.5">+</span>
                                </button>
                            )}
                        </div>

                        {isExpanded && (
                            <div className="mt-6 w-full" onClick={(e) => e.stopPropagation()}>
                                {!isDonating ? (
                                    <button 
                                        onClick={() => setIsDonating(true)}
                                        className="w-full bg-aid-green text-white font-black py-4 rounded-full shadow-lg hover:scale-[1.02] active:scale-95 transition-all text-lg uppercase tracking-wide"
                                    >
                                        Donate IDRX
                                    </button>
                                ) : (
                                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 animate-in fade-in slide-in-from-bottom-4">
                                        <label className="text-white text-xs font-bold uppercase tracking-wider mb-2 block">Amount (IDRX)</label>
                                        <div className="flex gap-2">
                                            <input 
                                                type="number" 
                                                value={donationAmount}
                                                onChange={(e) => setDonationAmount(e.target.value)}
                                                step="1000"
                                                disabled={isPending || isConfirming || step === 'ready'}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-heading font-bold focus:outline-none focus:border-aid-green transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                placeholder="50000"
                                                autoFocus
                                            />
                                            <button 
                                                onClick={handleAction}
                                                disabled={isPending || isConfirming || !donationAmount}
                                                className="bg-aid-green text-white font-bold px-6 rounded-xl hover:bg-aid-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all min-w-[100px] flex items-center justify-center text-sm"
                                            >
                                                {getButtonText()}
                                            </button>
                                        </div>
                                        <button 
                                            onClick={() => { setIsDonating(false); setStep('idle'); }} 
                                            className="text-white/50 text-xs font-bold mt-3 hover:text-white transition-colors w-full text-center"
                                        >
                                            Cancel Donation
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    </>
                    )}
                </div>
            </div>
        </SwipeGestureWrapper>
    </div>
  );
};

export default CampaignCard;
