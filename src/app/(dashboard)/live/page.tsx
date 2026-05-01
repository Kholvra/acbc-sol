'use client';

import React, { useState, useMemo } from 'react';
import { Loader2, Radio, MapPin, Play, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import TikTokLayout from '~/components/layout/tiktok-layout';
import LiveCreationModal from '~/components/live/live-creation-modal';
import { api } from '~/trpc/react';
import { isCampaignExpired } from '~/utils/date';

interface LiveCampaign {
  id: string;
  title: string;
  isActive: boolean;
  location: string;
  meetingId: string;
  viewers: number;
  totalRaised: string;
  target: string;
}

const LiveFeedPage: React.FC = () => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: allCampaigns, isLoading } = api.campaign.getAllCampaigns.useQuery(undefined, {
    refetchInterval: 30000,
  });

  const { liveCampaigns, endedCampaigns } = useMemo(() => {
    const live: LiveCampaign[] = [];
    const ended: LiveCampaign[] = [];
    if (!allCampaigns) return { liveCampaigns: live, endedCampaigns: ended };

    for (const c of allCampaigns) {
      if (!c.pitchVideoUrl?.startsWith('live://')) continue;
      const meetingId = c.pitchVideoUrl.replace('live://', '');
      const isExpired = isCampaignExpired(c.endDate?.toISOString());
      const isCompleted = c.raisedAmount >= c.targetAmount;
      const isActive = !isExpired && !isCompleted;

      const campaignObj: LiveCampaign = {
        id: c.id,
        title: c.title,
        isActive,
        location: c.province ?? 'Unknown Location',
        meetingId,
        viewers: Math.floor(Math.random() * 500) + 10,
        totalRaised: c.raisedAmount.toLocaleString('id-ID'),
        target: c.targetAmount.toLocaleString('id-ID'),
      };

      if (isActive) {
        live.push(campaignObj);
      } else {
        ended.push(campaignObj);
      }
    }
    return { liveCampaigns: live, endedCampaigns: ended };
  }, [allCampaigns]);

  return (
    <TikTokLayout onOpenCreate={() => setIsModalOpen(true)}>
         <div className="min-h-screen pb-24 px-4 pt-24 relative z-10">
             <div className="max-w-2xl mx-auto bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl shadow-xl overflow-hidden p-6 md:p-8">
                 
                 <div className="flex items-center gap-2 mb-6">
                     <div className="w-8 h-8 bg-[#BBC863] rounded-lg flex items-center justify-center text-[#F0E491]">
                        <Radio size={18} />
                     </div>
                     <h1 className="text-2xl font-heading font-black text-[#658C58]">Live Relief</h1>
                 </div>

                 {isLoading ? (
                     <div className="flex justify-center py-12">
                         <Loader2 className="animate-spin text-[#BBC863]" size={32} />
                     </div>
                 ) : (
                     <div className="space-y-8">
                         <section>
                             <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold flex items-center gap-2 text-[#658C58]">
                                    <span className="w-2 h-2 rounded-full bg-[#BBC863] animate-pulse"/>
                                    Live Now
                                </h2>
                                <span className="text-sm text-[#658C58]/60 font-bold">{liveCampaigns?.length ?? 0} Active</span>
                             </div>

                             {liveCampaigns?.length === 0 ? (
                                 <div className="bg-[#F0E491]/20 rounded-2xl p-8 text-center border border-[#BBC863]/20 shadow-sm">
                                     <div className="w-12 h-12 bg-[#F0E491]/40 rounded-full flex items-center justify-center mx-auto mb-3 text-[#658C58]">
                                         <Radio size={24}/>
                                     </div>
                                     <p className="font-bold text-[#658C58]">No one is live right now.</p>
                                     <p className="text-sm text-[#658C58]/70">Be the first to broadcast!</p>
                                 </div>
                             ) : (
                                 <div className="grid grid-cols-1 gap-4">
                                     {liveCampaigns.map((camp) => (
                                         <div
                                            key={camp.id}
                                            onClick={ () => {
                                                router.push(`/live/view/${camp.meetingId}?id=${camp.id}`);
                                            }}
                                            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#BBC863]/20 cursor-pointer hover:shadow-md transition-shadow group relative"
                                        >
                                             <div className="h-48 bg-gray-900 relative flex items-center justify-center overflow-hidden">
                                                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"/>
                                                 <div className="w-16 h-16 bg-[#F0E491]/20 rounded-full flex items-center justify-center backdrop-blur-md z-20 group-hover:scale-110 transition-transform">
                                                     <Play className="fill-[#F0E491] text-[#F0E491] ml-1" size={32}/>
                                                 </div>
                                                 <div className="absolute top-3 left-3 z-20 flex gap-2">
                                                     <span className="bg-[#BBC863] text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider animate-pulse">LIVE</span>
                                                     <span className="bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-sm flex items-center gap-1">
                                                         <Users size={10} /> {camp.viewers}
                                                     </span>
                                                 </div>
                                             </div>

                                             <div className="p-4">
                                                 <div className="flex items-start gap-3">
                                                      <div className="w-10 h-10 rounded-full bg-[#F0E491]/30 flex items-center justify-center shrink-0">
                                                          <MapPin size={18} className="text-[#658C58]"/>
                                                      </div>
                                                      <div>
                                                          <p className="text-xs text-[#BBC863] font-bold uppercase tracking-wider mb-1">{camp.location}</p>
                                                          <h3 className="font-heading font-bold text-[#658C58] leading-tight line-clamp-2">{camp.title}</h3>
                                                          <p className="text-xs text-[#658C58]/50 mt-1 font-mono">#{camp.id.slice(0,6)}</p>
                                                      </div>
                                                 </div>
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                             )}
                         </section>

                         {(endedCampaigns?.length ?? 0) > 0 && (
                             <section>
                                 <h2 className="text-lg font-bold text-[#658C58]/60 mb-4">Recently Ended</h2>
                                 <div className="grid grid-cols-2 gap-3">
                                      {endedCampaigns?.map((camp) => (
                                          <div key={camp.id} className="bg-white rounded-xl p-3 border border-[#BBC863]/20">
                                              <p className="text-[10px] text-[#BBC863] font-bold uppercase mb-1">{camp.location}</p>
                                              <p className="font-bold text-sm text-[#658C58] line-clamp-2">{camp.title}</p>
                                              <div className="mt-2 flex items-center justify-between">
                                                  <span className="text-xs font-bold text-[#658C58]/60">Ended</span>
                                                  <span className="text-xs font-bold text-[#BBC863]">IDRX {camp.totalRaised}</span>
                                              </div>
                                          </div>
                                      ))}
                                 </div>
                             </section>
                         )}
                     </div>
                 )}
             </div>

             <div className="fixed bottom-24 left-0 md:left-72 right-0 flex justify-center z-50 pointer-events-none">
                 <button 
                    onClick={() => setIsModalOpen(true)}
                    className="pointer-events-auto bg-[#BBC863] hover:bg-[#AAB752] text-white font-bold py-3 px-8 rounded-full shadow-xl flex items-center gap-2 transform transition-transform hover:scale-105 active:scale-95 border-4 border-white"
                    style={{ color: '#658C58' }} 
                 >
                     <div className="w-2 h-2 rounded-full bg-[#658C58] animate-pulse" />
                     START LIVE
                 </button>
             </div>

             <LiveCreationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
         </div>
    </TikTokLayout>
  );
};

export default LiveFeedPage;
