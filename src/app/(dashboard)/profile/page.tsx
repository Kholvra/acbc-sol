'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, useDisconnect, useBalance, useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { LogOut, Copy, ExternalLink, User, Wallet, Coins, ArrowUpRight, ArrowDownLeft, Check } from 'lucide-react';
import { toast } from 'sonner';
import WalletWrapper from '~/components/providers/wallet-wrapper';
import TikTokLayout from '~/components/layout/tiktok-layout';
import CampaignCreationModal from '~/components/campaign/campaign-creation-modal';
import { IDRX_ADDRESS, IDRX_ABI, FACTORY_ADDRESS, FACTORY_ABI, CAMPAIGN_ABI } from '~/constants/contracts';
import { formatEther } from 'viem';

interface DonationHistory {
  type: 'sent' | 'received';
  campaignAddress: string;
  campaignTitle: string;
  otherParty: string;
  otherPartyLabel: string;
  amount: bigint;
  timestamp: bigint;
  donor?: string;
}

const ProfilePage: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ethBalance } = useBalance({ address });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('sent');
  const [sentHistory, setSentHistory] = useState<DonationHistory[]>([]);
  const [receivedHistory, setReceivedHistory] = useState<DonationHistory[]>([]);
  const [totalDonated, setTotalDonated] = useState<bigint>(0n);
  const [totalReceived, setTotalReceived] = useState<bigint>(0n);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const { data: allCampaigns } = useReadContract({
        address: FACTORY_ADDRESS,
        abi: FACTORY_ABI,
        functionName: 'getCampaigns',
  });

  const { data: campaignsData } = useReadContracts({
        contracts: allCampaigns?.flatMap((addr) => [
            { address: addr, abi: CAMPAIGN_ABI, functionName: 'metadata' },
            { address: addr, abi: CAMPAIGN_ABI, functionName: 'owner' },
            { address: addr, abi: CAMPAIGN_ABI, functionName: 'getRecentDonations', args: [BigInt(100)] }
        ]) ?? [],
        query: { enabled: !!allCampaigns }
  });

  useEffect(() => {
    const fetchHistory = () => {
        if (!allCampaigns || !address || !campaignsData) return;
        setIsLoadingHistory(true);

        const sent: DonationHistory[] = [];
        const received: DonationHistory[] = [];
        let tDonated = 0n;
        let tReceived = 0n;

        try {
            for (let i = 0; i < allCampaigns.length; i++) {
                const campaignAddr = allCampaigns[i];
                const metaResult = campaignsData[i * 3];
                const ownerResult = campaignsData[i * 3 + 1];
                const donationsResult = campaignsData[i * 3 + 2];

                const title = metaResult?.status === 'success' ? (metaResult.result as [string, string, bigint, string])[0] : 'Unknown Campaign';
                const owner = ownerResult?.status === 'success' ? (ownerResult.result as string) : null;
                const isMyCampaign = owner?.toLowerCase() === address.toLowerCase();

                if (donationsResult?.status === 'success') {
                    const donations = donationsResult.result as unknown as DonationHistory[];
                    for (const donation of donations) {
                        const { donor, amount, timestamp } = donation;
                        const amountBg = amount;

                        if (donor?.toLowerCase() === address.toLowerCase()) {
                            tDonated += amountBg;
                            sent.push({
                                type: 'sent',
                                campaignAddress: campaignAddr,
                                campaignTitle: title,
                                otherParty: campaignAddr,
                                otherPartyLabel: 'To Campaign',
                                amount: amountBg,
                                timestamp
                            });
                        }

                        if (isMyCampaign) {
                            tReceived += amountBg;
                            received.push({
                                type: 'received',
                                campaignAddress: campaignAddr,
                                campaignTitle: title,
                                otherParty: donor,
                                otherPartyLabel: 'From Donor',
                                amount: amountBg,
                                timestamp
                            });
                        }
                    }
                }
            }

            setSentHistory(sent.sort((a, b) => Number(b.timestamp) - Number(a.timestamp)));
            setReceivedHistory(received.sort((a, b) => Number(b.timestamp) - Number(a.timestamp)));
            setTotalDonated(tDonated);
            setTotalReceived(tReceived);

        } catch (e) {
            console.error("Error processing history:", e);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    if (isConnected) fetchHistory();
  }, [allCampaigns, address, campaignsData, isConnected]);

  const { data: idrxBalance, refetch: refetchIdrx } = useReadContract({
      address: IDRX_ADDRESS,
      abi: IDRX_ABI,
      functionName: 'balanceOf',
      args: address ? [address] : undefined,
  });

  const { writeContract, data: hash } = useWriteContract();
  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
      if (isConfirmed) {
          void toast.success("Faucet Claimed! You received 1,000,000 IDRX.");
          void refetchIdrx();
      }
  }, [isConfirmed, refetchIdrx]);

  const handleFaucet = () => {
      if (!address) return;
      writeContract({ address: IDRX_ADDRESS, abi: IDRX_ABI, functionName: 'mint', args: [address] });
  };

  const handleCopy = async (text: string) => {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(text);
      toast.success("Address copied");
      setTimeout(() => setCopiedAddress(null), 2000);
  };

  const currentHistory = activeTab === 'sent' ? sentHistory : receivedHistory;

  return (
    <TikTokLayout onOpenCreate={() => setIsModalOpen(true)}>
        <div className="overflow-y-auto h-screen pb-24">
            {!isConnected ? (
                <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
                    <div className="bg-white/50 backdrop-blur-xl border border-white/60 p-8 rounded-3xl shadow-xl text-center max-w-md w-full">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400"><User size={40} /></div>
                        <h2 className="text-2xl font-bold text-aid-dark mb-2">Guest User</h2>
                        <p className="text-gray-600 mb-8">Connect your wallet to view your profile and manage your campaigns.</p>
                        <WalletWrapper className="w-full bg-aid-dark text-white hover:bg-aid-green transition-all py-3 rounded-xl font-bold shadow-lg" />
                    </div>
                </div>
            ) : (
                <div className="p-4 md:p-8 max-w-4xl mx-auto pt-20 md:pt-8 min-h-screen">
                    <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.05)] overflow-hidden">
                        <div className="h-32 bg-gradient-to-r from-aid-green/20 to-aid-primary/20 relative">
                            <div className="absolute -bottom-12 left-8">
                                <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg">
                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-aid-green to-aid-secondary flex items-center justify-center text-white font-bold text-3xl">{address?.slice(2, 4).toUpperCase()}</div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-16 pb-8 px-8">
                            <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                                <div>
                                    <h1 className="text-3xl font-heading font-black text-aid-dark mb-1">My Profile</h1>
                                    <div className="flex items-center gap-2 text-gray-500 font-mono text-sm bg-gray-100 px-3 py-1 rounded-full w-fit">
                                        <span>{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                                        <button onClick={() => address && handleCopy(address)}>{copiedAddress === address ? <Check size={14} className="text-green-500"/> : <Copy size={14}/>}</button>
                                        <a href={`https://sepolia.basescan.org/address/${address}`} target="_blank" rel="noreferrer"><ExternalLink size={14}/></a>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 text-right md:w-auto w-full">
                                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100"><div className="text-xs text-gray-400 font-bold uppercase mb-1">Native Balance</div><div className="text-xl font-heading font-black text-aid-dark flex items-center gap-1 justify-end"><Wallet size={16}/>{ethBalance ? `${parseFloat(ethBalance.formatted).toFixed(4)} ETH` : '...'}</div></div>
                                    <div className="bg-aid-green/10 p-4 rounded-2xl border border-aid-green/20"><div className="text-xs text-aid-green font-bold uppercase mb-1">IDRX Balance</div><div className="text-2xl font-heading font-black text-aid-dark flex items-center gap-1 justify-end"><Coins size={20}/>{idrxBalance !== undefined ? `IDRX ${Number(formatEther(idrxBalance)).toLocaleString('id-ID')}` : 'Loading...'}</div></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 shadow-sm relative overflow-hidden group">
                                    <h3 className="font-bold text-blue-600 text-xs uppercase mb-2">Testnet Faucet</h3>
                                    <h4 className="text-xl font-black text-aid-dark mb-2">Need Test Money?</h4>
                                    <button onClick={handleFaucet} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-2"><Coins size={18} />Get 1,000,000 IDRX</button>
                                </div>
                                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col justify-center space-y-4">
                                    <div className="flex justify-between items-center"><span className="font-bold text-gray-700">Total Donated</span><span className="font-black text-xl text-aid-dark">IDRX {Number(formatEther(totalDonated)).toLocaleString('id-ID')}</span></div>
                                    <div className="flex justify-between items-center"><span className="font-bold text-gray-700">Total Received</span><span className="font-black text-xl text-green-600">IDRX {Number(formatEther(totalReceived)).toLocaleString('id-ID')}</span></div>
                                </div>
                            </div>

                            <div className="mt-12">
                                <div className="flex items-center gap-6 mb-6">
                                    <h3 className="text-xl font-heading font-black text-aid-dark">Transaction History</h3>
                                    <div className="flex bg-gray-100 p-1 rounded-xl">
                                        <button onClick={() => setActiveTab('sent')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'sent' ? 'bg-white text-aid-dark shadow-sm' : 'text-gray-500'}`}>My Donations</button>
                                        <button onClick={() => setActiveTab('received')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'received' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'}`}>Incoming Support</button>
                                    </div>
                                </div>
                                {isLoadingHistory ? <div className="text-gray-500 italic py-8 text-center">Loading blockchain history...</div> : currentHistory.length > 0 ? (
                                    <div className="space-y-3">
                                        {currentHistory.map((item: DonationHistory, index: number) => (
                                            <div key={index} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-aid-green/30 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${activeTab === 'sent' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>{activeTab === 'sent' ? <ArrowUpRight size={24} /> : <ArrowDownLeft size={24} />}</div>
                                                    <div><p className="font-bold text-aid-dark line-clamp-1">{item.campaignTitle}</p><div className="text-xs text-gray-500 font-mono mt-1">{item.otherPartyLabel}: {item.otherParty.slice(0,6)}...{item.otherParty.slice(-4)}</div></div>
                                                </div>
                                                <div className="text-right pl-16 md:pl-0"><div className={`font-black text-lg ${activeTab === 'sent' ? 'text-aid-dark' : 'text-green-600'}`}>{activeTab === 'sent' ? '-' : '+'} IDRX {Number(formatEther(item.amount)).toLocaleString('id-ID')}</div><div className="text-[10px] text-gray-400 uppercase">{new Date(Number(item.timestamp) * 1000).toLocaleString()}</div></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-500 font-medium">No transactions found.</div>}
                            </div>

                            <div className="mt-12 pt-8 border-t border-gray-100"><button onClick={() => disconnect()} className="flex items-center gap-2 text-red-500 font-bold hover:bg-red-50 px-6 py-3 rounded-xl transition-colors"><LogOut size={20} />Disconnect Wallet</button></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
        <CampaignCreationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </TikTokLayout>
  );
};

export default ProfilePage;
