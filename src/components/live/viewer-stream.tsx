'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MeetingProvider, MeetingConsumer, useMeeting, useParticipant } from '@videosdk.live/react-sdk';
import { generateVideoSDKToken } from '~/utils/videosdk';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { X, Heart, Share2, Users, MapPin, Gift, ChevronDown } from 'lucide-react';
import { useReadContract, useWatchContractEvent, useWriteContract, useWaitForTransactionReceipt, useAccount, useSwitchChain } from 'wagmi';
import { CAMPAIGN_ABI, IDRX_ADDRESS, IDRX_ABI } from '~/constants/contracts';
import { formatEther, parseEther } from 'viem';
import { fetchJSONFromIPFS } from '~/utils/pinata';
import { toast } from 'sonner';

const StreamPlayer = ({ participantId }: { participantId: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { webcamStream, webcamOn } = useParticipant(participantId);

  useEffect(() => {
    if (videoRef.current) {
      if (webcamOn && webcamStream && webcamStream.track) {
        try {
          const mediaStream = new MediaStream();
          mediaStream.addTrack(webcamStream.track);
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play()
            .then(() => setIsLoading(false))
            .catch((error) => {
              if (error.name !== 'AbortError') console.warn("Video play error:", error.name);
            });
        } catch (err) {
          console.warn("Error setting video stream:", err);
        }
      } else {
        videoRef.current.srcObject = null;
        setIsLoading(true);
      }
    }
  }, [webcamStream, webcamOn]);

  return (
    <>
      <video 
        ref={videoRef} 
        className="object-cover w-full h-full absolute inset-0" 
        autoPlay 
        playsInline
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center text-white/50 bg-gray-900">
          <div className="text-center">
            <div className="animate-pulse mb-4 text-4xl">📡</div>
            <p>Connecting to stream...</p>
          </div>
        </div>
      )}
    </>
  );
};

const ViewerOverlay = ({ campaignAddress }: { campaignAddress?: string }) => {
    const { participants, leave, join, meetingId } = useMeeting();
    const router = useRouter();
    
    useEffect(() => {
        if (!meetingId) join();
    }, [meetingId, join]);
    
    const speakers = [...participants.values()].filter(p => p.mode === "SEND_AND_RECV");
    const { address: userAddress, chain } = useAccount();
    const { switchChain } = useSwitchChain();
    
    const [metadata, setMetadata] = useState<any>(null);
    const [location, setLocation] = useState<string>('Unknown Location');
    const [donationNotification, setDonationNotification] = useState<string | null>(null);
    const [isDonationSheetOpen, setIsDonationSheetOpen] = useState(false);
    const [donationAmount, setDonationAmount] = useState('');
    const [donationStep, setDonationStep] = useState<'idle' | 'approving' | 'ready' | 'donating'>('idle');

    const { data: contractMetadata } = useReadContract({
        address: campaignAddress as `0x${string}`,
        abi: CAMPAIGN_ABI,
        functionName: 'metadata',
        query: { enabled: !!campaignAddress }
    });

    const { data: totalRaised, refetch: refetchRaised } = useReadContract({
        address: campaignAddress as `0x${string}`,
        abi: CAMPAIGN_ABI,
        functionName: 'totalRaised',
        query: { enabled: !!campaignAddress, refetchInterval: 5000 }
    });

    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: IDRX_ADDRESS,
        abi: IDRX_ABI,
        functionName: 'allowance',
        args: userAddress && campaignAddress ? [userAddress, campaignAddress as `0x${string}`] : undefined,
    });

    const { writeContract, data: txHash, isPending } = useWriteContract();
    const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

    useEffect(() => {
        if (contractMetadata) {
            const meta = contractMetadata as any;
            setMetadata({ title: meta[0], target: meta[2] });
            if (meta[1].startsWith('ipfs://')) {
                fetchJSONFromIPFS(meta[1]).then(data => {
                    if (data?.properties) setLocation(data.properties.location?.formatted || data.properties.province || 'Live Location');
                });
            }
        }
    }, [contractMetadata]);

    useEffect(() => {
        if (isConfirmed) {
            if (donationStep === 'approving') {
                toast.success("Approved! Now click Donate.");
                refetchAllowance();
                setDonationStep('ready');
            } else if (donationStep === 'donating') {
                toast.success("Donation Sent!");
                refetchRaised();
                setDonationStep('idle');
                setIsDonationSheetOpen(false);
                setDonationAmount('');
            }
        }
    }, [isConfirmed, donationStep, refetchAllowance, refetchRaised]);

    useWatchContractEvent({
        address: campaignAddress as `0x${string}`,
        abi: CAMPAIGN_ABI,
        eventName: 'DonationReceived',
        onLogs(logs) {
            const log = logs[0] as any;
            if (log.args) {
                const { donor, amount } = log.args;
                const formattedAmount = Number(formatEther(amount)).toLocaleString('id-ID');
                const donorName = `${donor.substring(0, 6)}...${donor.substring(donor.length - 4)}`;
                setDonationNotification(`💸 ${donorName} donated IDRX ${formattedAmount}!`);
                refetchRaised();
                setTimeout(() => setDonationNotification(null), 5000);
            }
        },
    });

    const handleDonationAction = () => {
        if (!donationAmount || !campaignAddress) return;
        if (chain?.id !== 84532) {
            switchChain({ chainId: 84532 });
            return;
        }
        const amount = parseEther(donationAmount);
        const currentAllowance = allowance as bigint || BigInt(0);
        if (donationStep === 'ready' || currentAllowance >= amount) {
             setDonationStep('donating');
             writeContract({ address: campaignAddress as `0x${string}`, abi: CAMPAIGN_ABI, functionName: 'donate', args: [amount] });
        } else {
             setDonationStep('approving');
             writeContract({ address: IDRX_ADDRESS, abi: IDRX_ABI, functionName: 'approve', args: [campaignAddress as `0x${string}`, amount] });
        }
    };

    const raised = totalRaised ? formatEther(totalRaised as bigint) : '0';
    const target = metadata?.target ? formatEther(metadata.target) : '1';
    const progress = Math.min((Number(raised) / Number(target)) * 100, 100);

    return (
        <div className="fixed inset-0 bg-black z-50">
             {speakers.length > 0 && speakers[0] ? (
                 <StreamPlayer participantId={speakers[0].id} />
             ) : (
                 <div className="absolute inset-0 flex items-center justify-center text-white/50 bg-gray-900">
                    <div className="text-center">
                        <div className="animate-pulse mb-4 text-4xl">📡</div>
                        <p>Waiting for broadcast...</p>
                    </div>
                 </div>
             )}

             <div className="absolute inset-0 pointer-events-none flex flex-col justify-between z-10">
                 <div className="pt-4 px-4 flex justify-between items-start pointer-events-auto bg-gradient-to-b from-black/60 to-transparent pb-12">
                     <div className="flex items-center gap-2">
                        <div className="bg-[#BBC863] text-white px-2 py-1 rounded-sm flex items-center gap-1 animate-pulse">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#658C58]">LIVE</span>
                        </div>
                        <div className="bg-black/40 backdrop-blur-md text-white px-2 py-1 rounded-sm flex items-center gap-1 border border-white/10">
                            <Users size={12} /> <span className="text-xs font-bold">1.2k</span>
                        </div>
                     </div>
                     <button onClick={() => router.back()} className="p-2 bg-black/20 hover:bg-white/20 rounded-full text-white backdrop-blur-sm">
                         <X size={24} />
                     </button>
                 </div>

                 {donationNotification && (
                     <div className="absolute top-1/3 left-0 right-0 flex justify-center pointer-events-none">
                         <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black px-6 py-3 rounded-full shadow-xl animate-bounce flex items-center gap-2">
                             <Gift size={20} /> {donationNotification}
                         </div>
                     </div>
                 )}

                 <div className="pointer-events-auto bg-gradient-to-t from-black via-black/60 to-transparent px-4 pb-8 pt-12">
                     <div className="mb-4">
                         <div className="flex items-center gap-2 mb-2">
                             <span className="bg-blue-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider flex items-center gap-1">
                                 <MapPin size={10} /> {location}
                             </span>
                         </div>
                         <h2 className="text-white font-heading font-black text-xl leading-tight drop-shadow-md">
                             {metadata?.title || 'Loading Campaign...'}
                         </h2>
                     </div>

                     <div className="mb-4">
                         <div className="flex justify-between text-xs font-bold text-white/80 mb-1">
                             <span>Raised: IDRX {Number(raised).toLocaleString('id-ID')}</span>
                             <span>{Math.round(progress)}%</span>
                         </div>
                         <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                             <div className="h-full bg-aid-green transition-all duration-1000 ease-out" style={{ width: `${progress}%` }} />
                         </div>
                     </div>

                     <div className="flex gap-3 items-center">
                         <div className="flex-1">
                             <input type="text" placeholder="Say something..." className="w-full bg-white/20 backdrop-blur-md border border-white/10 rounded-full px-4 py-3 text-white placeholder-white/60 focus:outline-none text-sm font-bold" />
                         </div>
                         <button className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md border border-white/10"><Heart size={24} /></button>
                         <button className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md border border-white/10"><Share2 size={24} /></button>
                         <button onClick={() => setIsDonationSheetOpen(true)} className="bg-aid-green hover:bg-green-500 text-white font-black px-6 py-3 rounded-full shadow-lg transform active:scale-95 transition-all flex items-center gap-2">
                             <Gift size={20} /> DONATE
                         </button>
                     </div>
                 </div>
             </div>

             {isDonationSheetOpen && (
                 <div className="absolute inset-0 z-50 flex flex-col justify-end">
                     <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setIsDonationSheetOpen(false); setDonationStep('idle'); }} />
                     <div className="bg-white rounded-t-3xl p-6 relative z-10 animate-in slide-in-from-bottom flex flex-col gap-4">
                         <div className="flex justify-between items-center">
                             <h3 className="font-heading font-black text-xl text-aid-dark">Donate IDRX</h3>
                             <button onClick={() => { setIsDonationSheetOpen(false); setDonationStep('idle'); }}><ChevronDown /></button>
                         </div>
                         <div className="grid grid-cols-3 gap-2">
                             {['10000', '50000', '100000'].map(amt => (
                                 <button key={amt} onClick={() => setDonationAmount(amt)} disabled={donationStep === 'ready'} className={`py-2 rounded-xl border-2 font-bold ${donationAmount === amt ? 'border-aid-green bg-green-50 text-aid-green' : 'border-gray-100 text-gray-500'} disabled:opacity-50`}>
                                     {Number(amt).toLocaleString('id-ID')}
                                 </button>
                             ))}
                         </div>
                         <input type="number" value={donationAmount} onChange={(e) => setDonationAmount(e.target.value)} placeholder="Custom Amount" disabled={donationStep === 'ready'} className="w-full px-4 py-3 border border-gray-200 rounded-xl font-bold bg-gray-50 focus:outline-none focus:border-aid-green disabled:opacity-50 disabled:bg-gray-200" />
                         <button onClick={handleDonationAction} disabled={!donationAmount || isPending} className="w-full bg-aid-green text-white font-black py-4 rounded-xl text-lg hover:bg-aid-dark disabled:opacity-50">
                             {isPending ? 'Processing...' : donationStep === 'approving' ? 'Step 1/2: Approve IDRX' : 'Step 2/2: Donate Now'}
                         </button>
                     </div>
                 </div>
             )}
        </div>
    );
}

const ViewerStream = () => {
    const params = useParams();
    const id = params.id as string;
    const searchParams = useSearchParams();
    const address = searchParams.get('address') || undefined;
    const [token, setToken] = useState<string>("");
  
    useEffect(() => {
        generateVideoSDKToken().then(t => setToken(t || ""));
    }, []);
  
    if (!token || !id) return <div className="h-screen flex items-center justify-center bg-black text-white">Loading Viewer...</div>;
  
    return (
      <MeetingProvider
        config={{
          meetingId: id,
          micEnabled: false,
          webcamEnabled: false,
          name: "Guest",
          mode: "RECV_ONLY",
          debugMode: false,
        }}
        token={token}
      >
        <MeetingConsumer>
          {() => <ViewerOverlay campaignAddress={address} />}
        </MeetingConsumer>
      </MeetingProvider>
    );
};
  
export default ViewerStream;
