'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MeetingProvider, MeetingConsumer, useMeeting, useParticipant } from '@videosdk.live/react-sdk';
import { generateVideoSDKToken } from '~/utils/videosdk';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { X, Heart, Share2, Users, MapPin, Gift, ChevronDown } from 'lucide-react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import {
  IDRX_MINT,
  AID_BEACON_IDL,
  type AidBeaconIdl,
  findCampaignVaultPda,
  findDonationPda,
} from '~/constants/contracts';
import { useCampaignState } from '~/hooks/use-campaign-state';
import { api } from '~/trpc/react';
import { toast } from 'sonner';

const StreamPlayer = ({ participantId }: { participantId: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { webcamStream, webcamOn } = useParticipant(participantId);

  useEffect(() => {
    if (videoRef.current) {
      if (webcamOn && webcamStream?.track) {
        try {
          const mediaStream = new MediaStream();
          mediaStream.addTrack(webcamStream.track);
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play()
            .then(() => setIsLoading(false))
            .catch((error: Error) => {
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

const ViewerOverlay = ({ campaignId }: { campaignId?: string }) => {
    const { participants, join, meetingId } = useMeeting();
    const router = useRouter();
    const { publicKey, signTransaction } = useWallet();
    const { connection } = useConnection();

    useEffect(() => {
        if (!meetingId) join();
    }, [meetingId, join]);

    const speakers = [...participants.values()].filter(p => p.mode === "SEND_AND_RECV");

    const { data: campaign } = api.campaign.getCampaignById.useQuery(
      { campaignId: campaignId ?? '' },
      { enabled: !!campaignId }
    );

    const onChainState = useCampaignState(campaign?.onChainAddress);

    const [isDonationSheetOpen, setIsDonationSheetOpen] = useState(false);
    const [donationAmount, setDonationAmount] = useState('');
    const [isDonating, setIsDonating] = useState(false);

    const handleDonationAction = async () => {
        if (!donationAmount || !campaign?.onChainAddress || !publicKey || !signTransaction) {
            toast.error('Connect wallet and enter amount');
            return;
        }
        setIsDonating(true);
        try {
            const campaignPubkey = new PublicKey(campaign.onChainAddress);
            const [vaultPda] = findCampaignVaultPda(campaignPubkey);
            const donationId = BigInt(Date.now());
            const [donationPda] = findDonationPda(publicKey, campaignPubkey, donationId);
            const donorAta = await getAssociatedTokenAddress(IDRX_MINT, publicKey);

            const provider = new AnchorProvider(
              connection,
              { publicKey, signTransaction } as never,
              { commitment: 'confirmed' }
            );
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const program = new Program(AID_BEACON_IDL, provider) as any;

            const amountUnits = new BN(Math.floor(Number(donationAmount)));

            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            const ix = await program.methods
                .donate(new BN(donationId.toString()), amountUnits)
                .accounts({
                  donor: publicKey,
                  campaign: campaignPubkey,
                  donor_token_account: donorAta,
                  campaignVault: vaultPda,
                  idrxMint: IDRX_MINT,
                  donation: donationPda,
                  tokenProgram: TOKEN_PROGRAM_ID,
                  systemProgram: SystemProgram.programId,
                })
                .instruction();

            const tx = new Transaction().add(ix);
            tx.feePayer = publicKey;
            tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

            const signed = await signTransaction(tx);
            const sig = await connection.sendRawTransaction(signed.serialize());
            await connection.confirmTransaction(sig, 'confirmed');

            toast.success('Donation Sent!');
            setIsDonationSheetOpen(false);
            setDonationAmount('');
        } catch (err) {
            console.error(err);
            toast.error('Donation failed', { description: err instanceof Error ? err.message : 'Unknown error' });
        } finally {
            setIsDonating(false);
        }
    };

    const raised = onChainState.raisedAmount ? Number(onChainState.raisedAmount) / 1e9 : 0;
    const target = campaign?.targetAmount ? Number(campaign.targetAmount) : 1;
    const progress = target > 0 ? Math.min((raised / target) * 100, 100) : 0;

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

                 <div className="pointer-events-auto bg-gradient-to-t from-black via-black/60 to-transparent px-4 pb-8 pt-12">
                     <div className="mb-4">
                         <div className="flex items-center gap-2 mb-2">
                             <span className="bg-blue-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider flex items-center gap-1">
                                 <MapPin size={10} /> {campaign?.province ?? 'Live Location'}
                             </span>
                         </div>
                         <h2 className="text-white font-heading font-black text-xl leading-tight drop-shadow-md">
                             {campaign?.title ?? 'Loading Campaign...'}
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
                     <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setIsDonationSheetOpen(false); }} />
                     <div className="bg-white rounded-t-3xl p-6 relative z-10 animate-in slide-in-from-bottom flex flex-col gap-4">
                         <div className="flex justify-between items-center">
                             <h3 className="font-heading font-black text-xl text-aid-dark">Donate IDRX</h3>
                             <button onClick={() => { setIsDonationSheetOpen(false); }}><ChevronDown /></button>
                         </div>
                         <div className="grid grid-cols-3 gap-2">
                             {['10000', '50000', '100000'].map(amt => (
                                 <button key={amt} onClick={() => setDonationAmount(amt)} className={`py-2 rounded-xl border-2 font-bold ${donationAmount === amt ? 'border-aid-green bg-green-50 text-aid-green' : 'border-gray-100 text-gray-500'}`}>
                                     {Number(amt).toLocaleString('id-ID')}
                                 </button>
                             ))}
                         </div>
                         <input type="number" value={donationAmount} onChange={(e) => setDonationAmount(e.target.value)} placeholder="Custom Amount" className="w-full px-4 py-3 border border-gray-200 rounded-xl font-bold bg-gray-50 focus:outline-none focus:border-aid-green" />
                         <button onClick={() => void handleDonationAction()} disabled={!donationAmount || isDonating} className="w-full bg-aid-green text-white font-black py-4 rounded-xl text-lg hover:bg-aid-dark disabled:opacity-50">
                             {isDonating ? 'Processing...' : 'Donate Now'}
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
    const campaignId = searchParams.get('id') ?? undefined;
    const [token, setToken] = useState<string>("");

    useEffect(() => {
        void generateVideoSDKToken().then(t => setToken(t ?? ""));
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
          {() => <ViewerOverlay campaignId={campaignId} />}
        </MeetingConsumer>
      </MeetingProvider>
    );
};
  
export default ViewerStream;
