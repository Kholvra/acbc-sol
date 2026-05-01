'use client';

import React, { useState, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import TikTokLayout from '~/components/layout/tiktok-layout';
import { Loader2, Trash2, Film, Clock, FolderOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import CampaignCreationModal from '~/components/campaign/campaign-creation-modal';
import { isCampaignExpired, getDaysLeft } from '~/utils/date';
import { api } from '~/trpc/react';

const MyActivityPage: React.FC = () => {
    const { publicKey } = useWallet();
    const router = useRouter();
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: allCampaigns, isLoading } = api.campaign.getAllCampaigns.useQuery(undefined, {
        refetchInterval: 30000,
    });

    const myCampaigns = useMemo(() => {
        if (!allCampaigns || !publicKey) return [];
        const myAddress = publicKey.toBase58();
        return allCampaigns.filter((c) => c.creator.address === myAddress);
    }, [allCampaigns, publicKey]);

    const handleDelete = (campaignId: string) => {
        if (!confirm('Campaign deletion is not yet implemented for Solana. Continue anyway?')) return;
        setIsDeleting(campaignId);
        toast.info('Campaign deletion on Solana is not yet available in this demo.');
        setIsDeleting(null);
    };

    const displayedCampaigns = myCampaigns.filter((c) => {
        const isExpired = isCampaignExpired(c.endDate?.toISOString());
        const isCompleted = c.raisedAmount >= c.targetAmount;
        if (filter === 'active') return !isCompleted && !isExpired;
        if (filter === 'completed') return isCompleted || isExpired;
        return true;
    });

    return (
        <TikTokLayout onOpenCreate={() => setIsModalOpen(true)}>
             <div className="overflow-y-auto h-screen pb-24">
                <div className="p-4 md:p-8 max-w-6xl mx-auto pt-20 md:pt-8">
                    <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.05)] overflow-hidden p-6 md:p-8 min-h-[80vh]">
                        <header className="mb-8">
                            <h1 className="text-3xl font-heading font-black text-aid-dark mb-2">My Activity</h1>
                            <p className="text-gray-500">Manage your campaigns and reels history.</p>
                        </header>

                        <div className="flex gap-4 mb-8 border-b border-gray-200 pb-2 overflow-x-auto">
                            {[
                                { id: 'active', label: 'Active Campaigns' },
                                { id: 'completed', label: 'History / Completed' },
                                { id: 'all', label: 'All Reels' }
                            ].map(tab => (
                                <button key={tab.id} onClick={() => setFilter(tab.id as 'all' | 'active' | 'completed')} className={`pb-2 px-1 font-bold text-sm whitespace-nowrap ${filter === tab.id ? 'text-aid-green border-b-2 border-aid-green' : 'text-gray-400'}`}>
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-aid-green" /></div>
                        ) : displayedCampaigns.length === 0 ? (
                            <div className="text-center py-20 text-gray-400 font-bold">No campaigns found in this category.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {displayedCampaigns.map((campaign) => (
                                    <div key={campaign.id} className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 flex flex-col gap-3 relative group transition-transform hover:-translate-y-1">
                                        <div className="absolute top-4 right-4 z-10 flex flex-col gap-1 items-end">
                                            {(campaign.raisedAmount >= campaign.targetAmount || isCampaignExpired(campaign.endDate?.toISOString())) && (
                                                <>
                                                    {campaign.raisedAmount >= campaign.targetAmount && (
                                                        <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full font-bold">Completed</span>
                                                    )}
                                                    {isCampaignExpired(campaign.endDate?.toISOString()) && (
                                                        <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-bold">Expired</span>
                                                    )}
                                                </>
                                            )}
                                            {campaign.raisedAmount < campaign.targetAmount && !isCampaignExpired(campaign.endDate?.toISOString()) && (
                                                <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full font-bold animate-pulse">Live</span>
                                            )}
                                        </div>

                                        <div className="h-40 bg-gray-900 rounded-xl overflow-hidden flex items-center justify-center relative">
                                            {campaign.pitchVideoUrl ? (
                                                <video src={campaign.pitchVideoUrl.replace('ipfs://', process.env.NEXT_PUBLIC_GATEWAY_URL ? `${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/` : 'https://gateway.pinata.cloud/ipfs/')} className="w-full h-full object-cover" />
                                            ) : <Film className="text-gray-700" size={32} />}
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="font-bold text-aid-dark truncate">{campaign.title}</h3>
                                            <div className="text-xs text-gray-500 flex gap-2 mt-1">
                                                <span className="flex items-center gap-1">IDRX {campaign.raisedAmount.toLocaleString('id-ID')} Raised</span>
                                            </div>
                                        </div>

                                        {filter === 'active' && !isCampaignExpired(campaign.endDate?.toISOString()) && campaign.raisedAmount < campaign.targetAmount && (
                                             <div className="mt-auto flex flex-col gap-2">
                                                 <button
                                                     onClick={() => router.push(`/campaigns/${campaign.id}/agreements`)}
                                                     className="w-full bg-aid-green/10 text-aid-green hover:bg-aid-green/20 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                                                 >
                                                     <FolderOpen size={16} />
                                                     Manage Agreements
                                                 </button>
                                                 <button onClick={() => handleDelete(campaign.id)} disabled={isDeleting === campaign.id} className="w-full bg-red-50 text-red-500 hover:bg-red-100 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                                                     {isDeleting === campaign.id ? <Loader2 className="animate-spin" size={16}/> : <Trash2 size={16} />}
                                                     Delete Campaign
                                                 </button>
                                             </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
             </div>
             <CampaignCreationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </TikTokLayout>
    );
};

export default MyActivityPage;
