'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { QUICK_DONATE_AMOUNT } from '~/constants/donation';
import { Heart, Share2, Pause, Play, Volume2, VolumeX, Users, Music2, ChevronUp, ChevronDown, MapPin, Loader2 } from 'lucide-react';
import { fetchJSONFromIPFS } from '~/utils/pinata';
import { SwipeGestureWrapper } from './swipe-gesture-wrapper';
import { useQuickDonate } from '~/hooks/use-quick-donate';
import { useCampaignState } from '~/hooks/use-campaign-state';
import { PROGRAM_ID, IDRX_MINT, AID_BEACON_IDL, type AidBeaconIdl, findCampaignVaultPda, findDonationPda, findConfigPda } from '~/constants/contracts';

interface CampaignCardProps {
  campaign: {
    id: string;
    title: string;
    description: string;
    category: string;
    targetAmount: number;
    endDate: Date;
    onChainAddress: string | null;
    pitchVideoUrl: string | null;
    province: string;
    creator: { name: string | null; address: string };
  };
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

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign }) => {
  const router = useRouter();
  const { publicKey } = useWallet();
  const isMobile = isMobileDevice();

  const { connection } = useConnection();
  const { signTransaction } = useWallet();
  const onChainState = useCampaignState(campaign.onChainAddress);

  const hasOnChainAddress = !!campaign.onChainAddress && campaign.onChainAddress.length >= 32;

  const { executeQuickDonate, isProcessing: isQuickDonatingProcess } = useQuickDonate({
    campaignAddress: campaign.onChainAddress ?? '',
    onSuccess: () => {
      onChainState.refresh();
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
  const [isCustomDonating, setIsCustomDonating] = React.useState(false);

  if (onChainState.isLoading) {
    return (
      <div className="h-full w-full bg-white animate-pulse flex items-center justify-center rounded-xl shadow-sm border border-aid-green/10">
        <div className="text-aid-dark/40 font-heading font-bold">Loading Campaign...</div>
      </div>
    );
  }

  const raised = Number(onChainState.raisedAmount) / 1e9;
  const target = campaign.targetAmount;
  const progress = target > 0 ? Math.min((raised / target) * 100, 100) : 0;

  const displayDescription = campaign.description;
  const displayTitle = campaign.title;
  const category = campaign.category;

  const handleCustomDonate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!donationAmount || !campaign.onChainAddress || !publicKey || !signTransaction) return;
    setIsCustomDonating(true);
    try {
      const campaignPubkey = new PublicKey(campaign.onChainAddress);
      const amount = new BN(Number(donationAmount) * 1e9);
      const donationId = new BN(Date.now());

      const [configPda] = findConfigPda();
      const [vaultPda] = findCampaignVaultPda(campaignPubkey);
      const [donationPda] = findDonationPda(publicKey, campaignPubkey, BigInt(donationId.toString()));

      const donorTokenAccount = await getAssociatedTokenAddress(IDRX_MINT, publicKey);

      const provider = new AnchorProvider(
        connection,
        { publicKey, signTransaction } as never,
        { commitment: 'confirmed' }
      );
      const program = new Program(AID_BEACON_IDL as any, provider);

      const tx = new Transaction();

      const donorAccountInfo = await connection.getAccountInfo(donorTokenAccount);
      if (!donorAccountInfo) {
        tx.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            donorTokenAccount,
            publicKey,
            IDRX_MINT
          )
        );
      }

      tx.add(
        await (program.methods as any)
          .donate(donationId, amount)
          .accounts({
            donor: publicKey,
            campaign: campaignPubkey,
            donor_token_account: donorTokenAccount,
            campaign_vault: vaultPda,
            idrx_mint: IDRX_MINT,
            donation: donationPda,
            token_program: TOKEN_PROGRAM_ID,
            system_program: PublicKey.default,
          })
          .instruction()
      );

      tx.feePayer = publicKey;
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      const signed = await signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(sig, 'confirmed');

      toast.success(`Donated ${donationAmount} IDRX!`);
      setDonationAmount('');
      setIsDonating(false);
      onChainState.refresh();
    } catch (err) {
      toast.error('Donation failed');
      console.error(err);
    } finally {
      setIsCustomDonating(false);
    }
  };

  const getButtonText = () => {
      if (isCustomDonating) return <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />;
      if (!donationAmount) return 'Enter Amount';
      return 'Donate';
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
        <div className={`hidden md:flex absolute right-4 md:bottom-24 z-50 flex-col gap-2 transition-opacity duration-300 ${isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        executeQuickDonate();
                    }}
                    disabled={isQuickDonatingProcess || !hasOnChainAddress}
                    aria-label={`Quick donate ${QUICK_DONATE_AMOUNT} IDRX`}
                    className="flex bg-aid-green hover:bg-aid-dark text-white font-black w-14 h-14 rounded-full shadow-xl transition-all duration-300 disabled:cursor-not-allowed items-center justify-center group border-2 border-white/20 focus:outline-none focus:ring-2 focus:ring-aid-green focus:ring-offset-2"
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
            enabled={!isExpanded && isMobile && hasOnChainAddress}
        >
            <div className="absolute inset-0 bg-black flex items-center justify-center overflow-hidden" onClick={async (e) => {
                const videoUrl = campaign.pitchVideoUrl;
                if (videoUrl?.startsWith('live://')) {
                    e.stopPropagation();
                    const meetingId = videoUrl.replace('live://', '');
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
                {campaign.pitchVideoUrl ? (
                    campaign.pitchVideoUrl.startsWith('live://') ? (
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
                            src={campaign.pitchVideoUrl.replace('ipfs://', process.env.NEXT_PUBLIC_GATEWAY_URL ? `${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/` : 'https://gateway.pinata.cloud/ipfs/')}
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
                                        disabled={isCustomDonating}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-heading font-bold focus:outline-none focus:border-aid-green transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="50000"
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleCustomDonate}
                                        disabled={isCustomDonating || !donationAmount}
                                        className="bg-aid-green text-white font-bold px-6 rounded-xl hover:bg-aid-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all min-w-[100px] flex items-center justify-center text-sm"
                                    >
                                        {getButtonText()}
                                    </button>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setIsQuickDonating(false); }}
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
                                {campaign.province && (
                                    <span className="bg-blue-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20 uppercase tracking-wider shadow-sm flex items-center gap-1 whitespace-nowrap">
                                        <MapPin size={10} /> {campaign.province}
                                    </span>
                                )}
                            </div>

                            <h3 className={`text-white font-heading font-black leading-tight drop-shadow-md transition-all w-full ${isExpanded ? 'text-2xl' : 'text-xl'}`}>
                                {displayTitle || `@${campaign.creator.address.slice(0, 4)}...`}
                            </h3>

                            {campaign.endDate && (
                                <div className="flex items-center gap-1 mt-1">
                                    <span className="bg-white/20 backdrop-blur-md text-white/90 text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/10 uppercase tracking-wider flex items-center gap-1">
                                        ⏳ {Math.ceil((new Date(campaign.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) > 0
                                            ? `${Math.ceil((new Date(campaign.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} Days Left`
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
                        </div>

                        {isExpanded && (
                            <div className="mt-6 w-full" onClick={(e) => e.stopPropagation()}>
                                {!isDonating ? (
                                    <button
                                        onClick={() => setIsDonating(true)}
                                        disabled={!hasOnChainAddress}
                                        className="w-full bg-aid-green text-white font-black py-4 rounded-full shadow-lg hover:scale-[1.02] active:scale-95 transition-all text-lg uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {hasOnChainAddress ? 'Donate IDRX' : 'Not Yet On-Chain'}
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
                                                disabled={isCustomDonating}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-heading font-bold focus:outline-none focus:border-aid-green transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                placeholder="50000"
                                                autoFocus
                                            />
                                            <button
                                                onClick={handleCustomDonate}
                                                disabled={isCustomDonating || !donationAmount}
                                                className="bg-aid-green text-white font-bold px-6 rounded-xl hover:bg-aid-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all min-w-[100px] flex items-center justify-center text-sm"
                                            >
                                                {getButtonText()}
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => { setIsDonating(false); }}
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
