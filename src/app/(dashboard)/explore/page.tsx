'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Map as MapIcon, MapPin, Loader2 } from 'lucide-react';
import TikTokLayout from '~/components/layout/tiktok-layout';
import CampaignCreationModal from '~/components/campaign/campaign-creation-modal';
import { getStandardProvinceName } from '~/utils/provinceNames';
import type { IndonesiaGeoJson } from '~/types/map';
import { api } from '~/trpc/react';

const MapView = dynamic(() => import('~/components/explore/map-view'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full w-full bg-slate-100">
      <Loader2 className="animate-spin text-aid-green mb-4" size={48} />
      <p className="font-heading font-bold text-aid-dark">Initializing Map Engine...</p>
    </div>
  ),
});

export default function ExplorePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [geoJsonData, setGeoJsonData] = useState<IndonesiaGeoJson | null>(null);
  const [provinceCampaignCounts, setProvinceCampaignCounts] = useState<Record<string, number>>({});
  const [stats, setStats] = useState({
    activeCampaigns: 0,
    totalRaised: 0,
    activeProvincesCount: 0,
  });

  const { data: campaigns, isLoading: isCampaignsLoading } = api.campaign.getAllCampaigns.useQuery(
    undefined,
    { refetchInterval: 10000 }
  );

  useEffect(() => {
    if (!campaigns) return;

    const counts: Record<string, number> = {};
    let totalActive = 0;

    for (const campaign of campaigns) {
      // For now, consider all DB campaigns as active (on-chain state sync will refine)
      totalActive++;
      if (campaign.province) {
        const stdName = getStandardProvinceName(campaign.province);
        counts[stdName] = (counts[stdName] ?? 0) + 1;
      }
    }

    setProvinceCampaignCounts(counts);
    setStats({
      activeCampaigns: totalActive,
      totalRaised: 0, // Will be populated from on-chain reads in a real implementation
      activeProvincesCount: Object.keys(counts).length,
    });
  }, [campaigns]);

  useEffect(() => {
    fetch('/data/indonesia-provinces.geojson')
      .then((res) => res.json())
      .then((data) => {
        setGeoJsonData(data as IndonesiaGeoJson);
      })
      .catch((err) => {
        console.error('Failed to load map data', err);
      });
  }, []);

  return (
    <TikTokLayout onOpenCreate={() => setIsModalOpen(true)}>
      <div className="p-4 md:p-8 max-w-6xl mx-auto pt-24 pb-24 min-h-screen relative z-10 flex flex-col gap-4">
        <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl shadow-xl overflow-hidden flex flex-col h-[70vh]">
          <div className="px-8 py-6 border-b border-white/50 flex justify-between items-center bg-white/40">
            <div>
              <h1 className="text-2xl font-heading font-black text-aid-dark">Explore Impact</h1>
              <p className="text-aid-dark/60 text-sm">Discover relief campaigns across 38 provinces</p>
            </div>
            <div className="bg-aid-green/20 px-4 py-2 rounded-full text-aid-dark font-bold text-xs flex items-center gap-2">
              <MapIcon size={16} />
              <span>Real-time Data</span>
            </div>
          </div>

          <div className="flex-1 relative w-full h-full bg-slate-100">
            <MapView
              geoJsonData={geoJsonData}
              provinceCampaignCounts={provinceCampaignCounts}
              getStandardProvinceName={getStandardProvinceName}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/50 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <span className="font-heading font-black text-xl animate-pulse">!</span>
            </div>
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Active Campaigns</p>
              <h3 className="font-heading font-black text-3xl text-aid-dark">{stats.activeCampaigns}</h3>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/50 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <MapPin size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Affected Provinces</p>
              <h3 className="font-heading font-black text-3xl text-aid-dark">{stats.activeProvincesCount}</h3>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/50 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <span className="font-heading font-black text-xs">IDRX</span>
            </div>
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Raised (Active)</p>
              <h3 className="font-heading font-black text-3xl text-aid-dark">
                IDRX {stats.totalRaised.toLocaleString('id-ID')}
              </h3>
            </div>
          </div>
        </div>
      </div>
      <CampaignCreationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </TikTokLayout>
  );
}
