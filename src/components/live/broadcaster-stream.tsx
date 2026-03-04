'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MeetingProvider, MeetingConsumer, useMeeting, useParticipant } from '@videosdk.live/react-sdk';
import { generateVideoSDKToken } from '~/utils/videosdk';
import { useParams, useRouter } from 'next/navigation';
import { Mic, MicOff, Video, VideoOff, Gift, Users, MapPin } from 'lucide-react';
import { useReadContract, useReadContracts, useWatchContractEvent, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { FACTORY_ADDRESS, FACTORY_ABI, CAMPAIGN_ABI } from '~/constants/contracts';
import { fetchJSONFromIPFS } from '~/utils/pinata';
import { formatEther } from 'viem';

const ParticipantView = ({ participantId }: { participantId: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { webcamStream, micStream, webcamOn, micOn, isLocal } = useParticipant(participantId);

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

  useEffect(() => {
    if (micOn && micStream && micStream.track && !isLocal) {
      try {
        const audio = new Audio();
        audio.srcObject = new MediaStream([micStream.track]);
        audio.play().catch(() => {});
      } catch (err) {
        console.warn("Error setting audio stream:", err);
      }
    }
  }, [micStream, micOn, isLocal]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
        <video ref={videoRef} className="object-cover w-full h-full" autoPlay playsInline muted={isLocal} />
        {(!webcamOn || isLoading) && (
             <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white font-bold">
                {isLoading ? 'Initializing Camera...' : 'Camera Off'}
             </div>
        )}
    </div>
  );
};

const Controls = ({ onLeave, micOn, webcamOn, toggleMic, toggleWebcam }: any) => {
    return (
        <div className="flex gap-6 items-center justify-center p-6 w-full absolute bottom-8 z-30">
            <button onClick={() => toggleMic()} className={`p-4 rounded-full transition-all border-2 backdrop-blur-md shadow-lg ${micOn ? 'bg-black/40 border-white/20 hover:bg-black/60' : 'bg-[#BBC863] hover:bg-[#AAB752] border-[#BBC863]'}`}>
                {micOn ? <Mic className="text-white" size={28} /> : <MicOff className="text-white" size={28} />}
            </button>
            <button onClick={onLeave} className="bg-[#658C58] hover:bg-[#F0E491] hover:text-[#658C58] text-white px-8 py-4 rounded-full font-black uppercase tracking-wider shadow-xl transition-transform hover:scale-105 border-4 border-white/10">END LIVE</button>
            <button onClick={() => toggleWebcam()} className={`p-4 rounded-full transition-all border-2 backdrop-blur-md shadow-lg ${webcamOn ? 'bg-black/40 border-white/20 hover:bg-black/60' : 'bg-[#BBC863] hover:bg-[#AAB752] border-[#BBC863]'}`}>
                {webcamOn ? <Video className="text-white" size={28} /> : <VideoOff className="text-white" size={28} />}
            </button>
        </div>
    );
}

const MeetingView = ({ meetingId }: { meetingId: string }) => {
    const { participants, toggleMic, toggleWebcam, leave, localMicOn, localWebcamOn, join, meetingId: currentMeetingId } = useMeeting();
    const router = useRouter();
    
    useEffect(() => {
        if (!currentMeetingId) join();
    }, [currentMeetingId, join]);

    const speakers = [...participants.values()].filter(p => p.mode === "SEND_AND_RECV");
    const localSpeaker = speakers.find(p => p.local);

    const [campaignAddress, setCampaignAddress] = useState<string | null>(null);
    const [campaignMetadata, setCampaignMetadata] = useState<any>(null);
    const [donationNotification, setDonationNotification] = useState<string | null>(null);

    const { data: allCampaigns } = useReadContract({ address: FACTORY_ADDRESS, abi: FACTORY_ABI, functionName: 'getCampaigns' });
    const { data: allMetadata } = useReadContracts({
        contracts: allCampaigns?.map((addr) => ({ address: addr, abi: CAMPAIGN_ABI, functionName: 'metadata' })) || [],
        query: { enabled: !!allCampaigns }
    });

    useEffect(() => {
        const findCampaign = async () => {
            if (!allCampaigns || !allMetadata) return;
            for (let i = 0; i < allCampaigns.length; i++) {
                const result = allMetadata[i];
                if (result?.status === 'success') {
                    const metaArray = result.result as any;
                    if (metaArray[1].startsWith('ipfs://')) {
                         try {
                             const data = await fetchJSONFromIPFS(metaArray[1]);
                             if (data.animation_url === `live://${meetingId}`) {
                                 setCampaignAddress(allCampaigns[i] as string);
                                 setCampaignMetadata({ title: metaArray[0], location: data.properties.location?.formatted || 'Live Location', target: metaArray[2] });
                                 break;
                             }
                         } catch (e) {}
                    }
                }
            }
        };
        findCampaign();
    }, [allCampaigns, allMetadata, meetingId]);

    useWatchContractEvent({
        address: campaignAddress as `0x${string}`,
        abi: CAMPAIGN_ABI,
        eventName: 'DonationReceived',
        onLogs(logs) {
            const log = logs[0] as any;
            if (log.args) {
                const { donor, amount } = log.args;
                setDonationNotification(`💸 ${donor.substring(0, 6)}... sent IDRX ${Number(formatEther(amount)).toLocaleString('id-ID')}!`);
                setTimeout(() => setDonationNotification(null), 5000);
            }
        },
        enabled: !!campaignAddress
    });
    
    const { data: totalRaised } = useReadContract({ address: campaignAddress as `0x${string}`, abi: CAMPAIGN_ABI, functionName: 'totalRaised', query: { enabled: !!campaignAddress, refetchInterval: 5000 } });
    const raised = totalRaised ? formatEther(totalRaised as bigint) : '0';
    const target = campaignMetadata ? formatEther(campaignMetadata.target) : '1';
    const progress = Math.min((Number(raised) / Number(target)) * 100, 100);

    const { writeContract, data: endTxHash, isPending: isEndingLive } = useWriteContract();
    const { isSuccess: isEndConfirmed } = useWaitForTransactionReceipt({ hash: endTxHash });

    useEffect(() => {
        if (isEndConfirmed) {
            leave();
            router.push('/live');
        }
    }, [isEndConfirmed, leave, router]);

    const handleLeave = () => {
        if (campaignAddress && !isEndingLive) {
            writeContract({ address: campaignAddress as `0x${string}`, abi: CAMPAIGN_ABI, functionName: 'cancel' });
        } else {
            leave();
            router.push('/live');
        }
    }

    return (
        <div className="fixed inset-0 bg-gray-950 flex flex-col">
            <div className="flex-1 relative">
                {localSpeaker ? <ParticipantView participantId={localSpeaker.id} /> : <div className="absolute inset-0 flex items-center justify-center text-white">Initializing Camera...</div>}
                <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between z-20">
                    <div className="flex justify-between items-start pt-8">
                         <div className="flex flex-col gap-2">
                            <div className="bg-[#BBC863]/90 backdrop-blur-md text-[#658C58] px-3 py-1.5 rounded-lg flex items-center gap-2 w-fit shadow-lg animate-pulse">
                                <div className="w-2 h-2 rounded-full bg-[#658C58]" />
                                <span className="text-xs font-black uppercase tracking-widest">ON AIR</span>
                            </div>
                            {campaignMetadata && <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 w-fit flex items-center gap-1 text-white/80"><MapPin size={12}/> <span className="text-xs font-bold">{campaignMetadata.location}</span></div>}
                         </div>
                         <div className="bg-black/40 backdrop-blur-md text-white px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10"><Users size={14} /> <span className="text-xs font-bold">128</span></div>
                    </div>
                     {donationNotification && <div className="absolute top-1/3 left-0 right-0 flex justify-center pointer-events-none"><div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black px-6 py-4 rounded-2xl shadow-2xl animate-bounce flex items-center gap-3 border-2 border-white"><Gift size={24} /> <span className="text-lg">{donationNotification}</span></div></div>}
                    <div className="mb-24 px-2">
                        {campaignAddress ? (
                            <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-4 border border-white/5">
                                <p className="text-white/60 text-xs font-bold uppercase mb-1">Total Raised</p>
                                <div className="flex items-end justify-between mb-2"><span className="text-2xl font-black text-white">IDRX {Number(raised).toLocaleString('id-ID')}</span><span className="text-white/60 text-xs font-bold mb-1">of {Number(target).toLocaleString('id-ID')}</span></div>
                                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden"><div className="h-full bg-aid-green transition-all duration-1000" style={{ width: `${progress}%` }} /></div>
                            </div>
                        ) : <div className="bg-yellow-500/20 text-yellow-200 p-2 rounded-lg text-xs font-bold text-center">Syncing Campaign Data...</div>}
                    </div>
                </div>
            </div>
            <Controls onLeave={handleLeave} micOn={localMicOn} webcamOn={localWebcamOn} toggleMic={toggleMic} toggleWebcam={toggleWebcam} />
        </div>
    );
}

const BroadcasterStream = () => {
  const params = useParams();
  const id = params.id as string;
  const [token, setToken] = useState<string>("");

  useEffect(() => {
      generateVideoSDKToken().then(t => setToken(t || ""));
  }, []);

  if (!token || !id) return <div className="h-screen flex items-center justify-center bg-black text-white">Initializing Studio...</div>;

  return (
    <MeetingProvider
      config={{ meetingId: id, micEnabled: true, webcamEnabled: true, name: "Host", mode: "SEND_AND_RECV", debugMode: false }}
      token={token}
    >
      <MeetingConsumer>{() => <MeetingView meetingId={id} />}</MeetingConsumer>
    </MeetingProvider>
  );
};

export default BroadcasterStream;
