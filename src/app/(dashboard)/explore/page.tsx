'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Map as MapIcon, MapPin, Loader2 } from 'lucide-react';
import TikTokLayout from '~/components/layout/tiktok-layout';
import CampaignCreationModal from '~/components/campaign/campaign-creation-modal';
import { useReadContract, useReadContracts } from 'wagmi';
import { FACTORY_ADDRESS, FACTORY_ABI, CAMPAIGN_ABI } from '~/constants/contracts';
import { fetchJSONFromIPFS } from '~/utils/pinata';
import { formatEther } from 'viem';

// Dynamically import MapView with SSR disabled
const MapView = dynamic(() => import('~/components/explore/map-view'), { 
    ssr: false,
    loading: () => (
        <div className="flex flex-col items-center justify-center h-full w-full bg-slate-100">
            <Loader2 className="animate-spin text-aid-green mb-4" size={48} />
            <p className="font-heading font-bold text-aid-dark">Initializing Map Engine...</p>
        </div>
    )
});

const NAME_MAPPING: Record<string, string> = {
    "IRIAN JAYA TENGAH": "Papua Tengah",
    "IRIAN JAYA BARAT": "Papua Barat",
    "IRIAN JAYA": "Papua",
    "IRIAN JAYA TIMUR": "Papua", 
    "DI ACEH": "Aceh",
    "DI. ACEH": "Aceh",
    "NANGGROE ACEH DARUSSALAM": "Aceh",
    "ACEH": "Aceh",
    "DKI JAKARTA": "DKI Jakarta",
    "JAKARTA RAYA": "DKI Jakarta",
    "DAERAH ISTIMEWA YOGYAKARTA": "DI Yogyakarta",
    "YOGYAKARTA": "DI Yogyakarta",
    "PROBANTEN": "Banten",
    "NUSATENGGARA BARAT": "Nusa Tenggara Barat",
    "NUSATENGGARA TIMUR": "Nusa Tenggara Timur",
    "BANGKA BELITUNG": "Kepulauan Bangka Belitung",
    "GORONTALO": "Gorontalo",
    "MALUKU UTARA": "Maluku Utara",
    "SULAWESI TENGAH": "Sulawesi Tengah",
    "SULAWESI UTARA": "Sulawesi Utara",
    "SULAWESI SELATAN": "Sulawesi Selatan",
    "SULAWESI TENGGARA": "Sulawesi Tenggara",
    "SULAWESI BARAT": "Sulawesi Selatan", 
    "KALIMANTAN TENGAH": "Kalimantan Tengah",
    "KALIMANTAN TIMUR": "Kalimantan Timur",
    "KALIMANTAN BARAT": "Kalimantan Barat",
    "KALIMANTAN SELATAN": "Kalimantan Selatan",
    "KALIMANTAN UTARA": "Kalimantan Timur",
    "KEPULAUAN RIAU": "Riau",
    "PAPUA SELATAN": "Papua",
    "PAPUA PEGUNUNGAN": "Papua",
    "PAPUA BARAT DAYA": "Papua Barat"
};

const toTitleCase = (str: string) => {
    return str.toLowerCase().replace(/(?:^|\s)\w/g, (match) => match.toUpperCase());
};

const getStandardProvinceName = (rawName: string) => {
    if (!rawName) return "Unknown";
    const upperName = rawName.toUpperCase().trim();
    if (NAME_MAPPING[upperName]) return NAME_MAPPING[upperName];
    return toTitleCase(rawName);
};

interface GeoJsonData {
  type: string;
  features: {
    type: string;
    properties: Record<string, unknown>;
    geometry: Record<string, unknown>;
  }[];
  [key: string]: unknown;
}

const ExplorePage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [geoJsonData, setGeoJsonData] = useState<GeoJsonData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [provinceCampaignCounts, setProvinceCampaignCounts] = useState<Record<string, number>>({});
  const [stats, setStats] = useState({
      activeCampaigns: 0,
      totalRaised: 0,
      activeProvincesCount: 0
  });

  const { data: campaignAddresses } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: 'getCampaigns',
    query: { refetchInterval: 10000 }
  });

  const { data: campaignsData } = useReadContracts({
    contracts: campaignAddresses?.flatMap((addr) => [
      { address: addr, abi: CAMPAIGN_ABI, functionName: 'metadata' },
      { address: addr, abi: CAMPAIGN_ABI, functionName: 'totalRaised' },
      { address: addr, abi: CAMPAIGN_ABI, functionName: 'isActive' }
    ]) ?? [],
    query: {
        enabled: !!campaignAddresses && campaignAddresses.length > 0,
        refetchInterval: 10000
    }
  });

  useEffect(() => {
    const fetchLocations = async () => {
        if (!campaignsData || !campaignAddresses) return;

        const counts: Record<string, number> = {};
        let totalActive = 0;
        let totalIdrxRaised = 0;
        const stride = 3;

        const promises = [];
        for (let i = 0; i < campaignAddresses.length; i++) {
            const metaResult = campaignsData[i * stride];
            const raisedResult = campaignsData[i * stride + 1];
            const activeResult = campaignsData[i * stride + 2];

            if (metaResult?.status === 'success' && raisedResult?.status === 'success') {
                const isActive = activeResult?.status === 'success' ? (activeResult.result as boolean) : true;
                if (!isActive) continue;

                const meta = metaResult.result as [string, string, bigint, string];
                const description = meta[1];
                const targetAmount = meta[2];
                const totalRaised = raisedResult.result as bigint;

                if (totalRaised >= targetAmount) continue;

                totalActive++;
                totalIdrxRaised += Number(formatEther(totalRaised));

                if (description?.startsWith('ipfs://')) {
                    promises.push((async () => {
                        try {
                            const data = await fetchJSONFromIPFS(description) as { properties?: { province?: string } } | null;
                            if (data?.properties?.province) {
                                const stdName = getStandardProvinceName(data.properties.province);
                                counts[stdName] = (counts[stdName] ?? 0) + 1;
                            }
                        } catch (err) {
                            console.error("Error fetching IPFS for map:", err);
                        }
                    })());
                }
            }
        }

        await Promise.all(promises);
        setProvinceCampaignCounts(counts);
        setStats({
            activeCampaigns: totalActive,
            totalRaised: totalIdrxRaised,
            activeProvincesCount: Object.keys(counts).length
        });
    };

    void fetchLocations();
  }, [campaignsData, campaignAddresses]);

  useEffect(() => {
    fetch('/data/indonesia-provinces.geojson')
      .then(res => res.json())
      .then(data => {
        setGeoJsonData(data as GeoJsonData);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to load map data", err);
        setIsLoading(false);
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
                        <h3 className="font-heading font-black text-3xl text-aid-dark">IDRX {stats.totalRaised.toLocaleString('id-ID')}</h3>
                    </div>
                 </div>
            </div>
        </div>
        <CampaignCreationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </TikTokLayout>
  );
};

export default ExplorePage;
