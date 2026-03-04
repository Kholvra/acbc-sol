'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import TikTokLayout from '~/components/layout/tiktok-layout';
import { FACTORY_ADDRESS, FACTORY_ABI, CAMPAIGN_ABI } from '~/constants/contracts';
import { fetchJSONFromIPFS, unpinJSONFromIPFS } from '~/utils/pinata';
import { Loader2, Trash2, Film, Clock } from 'lucide-react';
import { toast } from 'sonner';
import CampaignCreationModal from '~/components/campaign/campaign-creation-modal';
import { isCampaignExpired, getDaysLeft } from '~/utils/date';
import { formatEther } from 'viem';

type Campaign = {
    address: string;
    title: string;
    description: string; 
    mediaUrl?: string; 
    targetAmount: bigint;
    totalRaised: bigint;
    owner: string;
    isActive: boolean;
    endDate?: string;
};

const MyActivityPage: React.FC = () => {
    const { address: userAddress } = useAccount();
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
    const [myCampaigns, setMyCampaigns] = useState<Campaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<string | null>(null); 
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: campaignAddresses } = useReadContract({
        address: FACTORY_ADDRESS,
        abi: FACTORY_ABI,
        functionName: 'getCampaigns',
    });

    const { data: campaignsData } = useReadContracts({
        // @ts-ignore
        contracts: campaignAddresses?.flatMap((addr) => [
            { address: addr, abi: CAMPAIGN_ABI, functionName: 'metadata' },
            { address: addr, abi: CAMPAIGN_ABI, functionName: 'totalRaised' },
            { address: addr, abi: CAMPAIGN_ABI, functionName: 'owner' },
            { address: addr, abi: CAMPAIGN_ABI, functionName: 'isActive' },
        ]) || [],
        query: {
            enabled: !!campaignAddresses && campaignAddresses.length > 0
        }
    });

    const { writeContract, data: deleteTxHash } = useWriteContract();
    const { isSuccess: isDeleteConfirmed } = useWaitForTransactionReceipt({
        hash: deleteTxHash,
    });

    useEffect(() => {
        const loadCampaigns = async () => {
            if (!campaignsData || !campaignAddresses || !userAddress) {
                if (campaignAddresses?.length === 0) setIsLoading(false);
                return;
            }
            
            const loaded: Campaign[] = [];
            const stride = 4;

            const promises = campaignAddresses.map(async (addr, i) => {
                const metaResult = campaignsData[i * stride];
                const raisedResult = campaignsData[i * stride + 1];
                const ownerResult = campaignsData[i * stride + 2];
                const activeResult = campaignsData[i * stride + 3];

                if (metaResult?.status === 'success' && ownerResult?.status === 'success') {
                    const owner = ownerResult.result as string;
                    if (owner.toLowerCase() !== userAddress.toLowerCase()) return;

                    const meta = metaResult.result as any;
                    const descriptionIPFS = meta[1];
                    const active = activeResult?.status === 'success' ? (activeResult.result as boolean) : true;

                    let mediaUrl = '';
                    let title = meta[0];
                    let endDate = undefined;
                    
                    if (descriptionIPFS && descriptionIPFS.startsWith('ipfs://')) {
                         try {
                             const data = await fetchJSONFromIPFS(descriptionIPFS);
                             if (data) {
                                 mediaUrl = data.animation_url || data.video || data.image;
                                 if (data.properties && data.properties.endDate) {
                                     endDate = data.properties.endDate;
                                 }
                             }
                         } catch (e) { console.error(e); }
                    }

                    loaded.push({
                        address: addr,
                        title: title,
                        description: descriptionIPFS,
                        mediaUrl: mediaUrl,
                        targetAmount: meta[2],
                        totalRaised: raisedResult?.status === 'success' ? (raisedResult.result as bigint) : 0n,
                        owner: owner,
                        isActive: active,
                        endDate: endDate
                    });
                }
            });

            await Promise.all(promises);
            setMyCampaigns(loaded);
            setIsLoading(false);
        };

        loadCampaigns();
    }, [campaignsData, campaignAddresses, userAddress]);

    const handleDelete = (campaign: Campaign) => {
        if (!confirm("Are you sure? This requires a blockchain transaction verification.")) return;
        setIsDeleting(campaign.address);
        writeContract({ address: campaign.address as `0x${string}`, abi: CAMPAIGN_ABI, functionName: 'cancel' });
    };

    useEffect(() => {
        if (isDeleteConfirmed && isDeleting) {
             const campaign = myCampaigns.find(c => c.address === isDeleting);
             if (campaign) {
                 unpinJSONFromIPFS(campaign.description).then(() => {
                     toast.success("Campaign deleted & assets removed!");
                     setIsDeleting(null);
                     setMyCampaigns(prev => prev.map(c => c.address === isDeleting ? { ...c, isActive: false } : c));
                 });
             }
        }
    }, [isDeleteConfirmed, isDeleting, myCampaigns]);

    const displayedCampaigns = myCampaigns.filter(c => {
        const isExpired = isCampaignExpired(c.endDate);
        const isCompleted = c.totalRaised >= c.targetAmount;
        if (filter === 'active') return c.isActive && !isCompleted && !isExpired;
        if (filter === 'completed') return !c.isActive || isCompleted || isExpired;
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
                                <button key={tab.id} onClick={() => setFilter(tab.id as any)} className={`pb-2 px-1 font-bold text-sm whitespace-nowrap ${filter === tab.id ? 'text-aid-green border-b-2 border-aid-green' : 'text-gray-400'}`}>
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
                                    <div key={campaign.address} className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 flex flex-col gap-3 relative group transition-transform hover:-translate-y-1">
                                        <div className="absolute top-4 right-4 z-10 flex flex-col gap-1 items-end">
                                            {!campaign.isActive ? (
                                                <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full font-bold">Deleted/Ended</span>
                                            ) : (
                                                <>
                                                     {campaign.totalRaised >= campaign.targetAmount && !isCampaignExpired(campaign.endDate) && (
                                                        <>
                                                            <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full font-bold">Completed</span>
                                                            <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                                                                <Clock size={10}/> {getDaysLeft(campaign.endDate)} Days Left
                                                            </span>
                                                        </>
                                                     )}
                                                     {campaign.totalRaised >= campaign.targetAmount && isCampaignExpired(campaign.endDate) && (
                                                        <><span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full font-bold">Completed</span><span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-bold">Expired</span></>
                                                     )}
                                                     {campaign.totalRaised < campaign.targetAmount && isCampaignExpired(campaign.endDate) && (
                                                         <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-bold">Expired</span>
                                                     )}
                                                     {campaign.totalRaised < campaign.targetAmount && !isCampaignExpired(campaign.endDate) && (
                                                         <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full font-bold animate-pulse">Live</span>
                                                     )}
                                                </>
                                            )}
                                        </div>

                                        <div className="h-40 bg-gray-900 rounded-xl overflow-hidden flex items-center justify-center relative">
                                            {campaign.mediaUrl ? (
                                                <video src={campaign.mediaUrl.replace('ipfs://', process.env.NEXT_PUBLIC_GATEWAY_URL ? `${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/` : 'https://gateway.pinata.cloud/ipfs/')} className="w-full h-full object-cover" />
                                            ) : <Film className="text-gray-700" size={32} />}
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="font-bold text-aid-dark truncate">{campaign.title}</h3>
                                            <div className="text-xs text-gray-500 flex gap-2 mt-1">
                                                <span className="flex items-center gap-1">Rp {Number(formatEther(campaign.totalRaised)).toLocaleString('id-ID')} Raised</span>
                                            </div>
                                        </div>

                                        {filter === 'active' && campaign.isActive && (
                                             <button onClick={() => handleDelete(campaign)} disabled={isDeleting === campaign.address} className="mt-auto w-full bg-red-50 text-red-500 hover:bg-red-100 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                                                 {isDeleting === campaign.address ? <Loader2 className="animate-spin" size={16}/> : <Trash2 size={16} />}
                                                 Delete Campaign
                                             </button>
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
