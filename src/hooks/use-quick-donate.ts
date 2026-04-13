'use client';

import { useState, useCallback, useEffect } from 'react';
import { 
  useWriteContract, 
  useWaitForTransactionReceipt, 
  useAccount, 
  useReadContract,
  useSendCalls
} from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { parseEther, encodeFunctionData } from 'viem';
import { toast } from 'sonner';
import { CAMPAIGN_ABI, IDRX_ABI, IDRX_ADDRESS } from '~/constants/contracts';
import { QUICK_DONATE_AMOUNT } from '~/constants/donation';

interface UseQuickDonateProps {
  campaignAddress: `0x${string}`;
  onSuccess?: () => void;
}

export function useQuickDonate({
  campaignAddress,
  onSuccess
}: UseQuickDonateProps) {
  const { address: userAddress } = useAccount();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<'idle' | 'approving' | 'donating' | 'batching'>('idle');

  // Standard separate contract writes (for EOA/legacy)
  const { 
    writeContract: approveContract,
    data: approveHash,
    error: approveError
  } = useWriteContract();

  const { 
    writeContract: donateContract,
    data: donateHash,
    error: donateError
  } = useWriteContract();

  // EIP-5792 Batch Write using useSendCalls (Non-deprecated replacement)
  const {
    sendCalls: batchSend,
    data: batchId,
    error: batchError,
    isPending: isBatchPending
  } = useSendCalls();

  const {
    isSuccess: approveSuccess
  } = useWaitForTransactionReceipt({ hash: approveHash });

  // Tracking standard donation success
  const {
    isSuccess: donateSuccess
  } = useWaitForTransactionReceipt({ hash: donateHash });

  // Check current allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: IDRX_ADDRESS,
    abi: IDRX_ABI,
    functionName: 'allowance',
    args: userAddress ? [userAddress, campaignAddress] : undefined,
  });

  const executeQuickDonate = useCallback(() => {
    if (!userAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    const donateAmount = parseEther(QUICK_DONATE_AMOUNT);
    const approvalAmount = parseEther('10000'); // Set limit to 10k for smoother UX

    // 1. If allowance is already enough, just donate (1 step)
    if (allowance !== undefined && allowance >= donateAmount) {
      setStep('donating');
      donateContract({
        address: campaignAddress,
        abi: CAMPAIGN_ABI,
        functionName: 'donate',
        args: [donateAmount],
      });
      return;
    }

    // 2. If allowance is NOT enough, try ATOMIC BATCHING (EIP-5792)
    // We use useSendCalls with encoded data for Smart Wallets
    try {
      setStep('batching');
      
      const approveData = encodeFunctionData({
        abi: IDRX_ABI,
        functionName: 'approve',
        args: [campaignAddress, approvalAmount],
      });

      const donateData = encodeFunctionData({
        abi: CAMPAIGN_ABI,
        functionName: 'donate',
        args: [donateAmount],
      });

      batchSend({
        calls: [
          {
            to: IDRX_ADDRESS,
            data: approveData,
          },
          {
            to: campaignAddress,
            data: donateData,
          }
        ]
      });
      return;
    } catch (e) {
      // Fallback for wallets that don't support batching
      console.log('Batching not supported, falling back to separate transactions', e);
      setStep('approving');
      approveContract({
        address: IDRX_ADDRESS,
        abi: IDRX_ABI,
        functionName: 'approve',
        args: [campaignAddress, approvalAmount],
      });
    }
  }, [approveContract, campaignAddress, userAddress, allowance, donateContract, batchSend]);

  // Handle Batch Success (since batchId != tx hash)
  useEffect(() => {
    if (batchId && step === 'batching') {
      toast.success('Donasi Berhasil (Batch)! 🚀');
      
      void queryClient.invalidateQueries({
        queryKey: ['contracts']
      });

      const timer = setTimeout(() => {
        void refetchAllowance();
        onSuccess?.();
        setStep('idle');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [batchId, step, queryClient, refetchAllowance, onSuccess]);

  // Handle Approval Success (Legacy Flow)
  useEffect(() => {
    if (approveSuccess && step === 'approving') {
      toast.success('Izin 10k Berhasil! 🎉', {
        description: 'Sekarang swipe sekali lagi buat donasi 1k.'
      });
      void refetchAllowance();
      setStep('idle');
    }
  }, [approveSuccess, step, refetchAllowance]);

  // Handle Donation Success (Standard Flow)
  useEffect(() => {
    if (donateSuccess && step === 'donating') {
      toast.success(`Berhasil Donasi ${QUICK_DONATE_AMOUNT} IDRX! 💝`);

      void queryClient.invalidateQueries({
        queryKey: ['contracts']
      });

      const timer = setTimeout(() => {
        void refetchAllowance();
        onSuccess?.();
        setStep('idle');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [donateSuccess, step, onSuccess, refetchAllowance, queryClient]);

  // Handle errors
  useEffect(() => {
    if (approveError || batchError || donateError) {
      const error = approveError || batchError || donateError;
      console.error('Quick Donate Error:', error);
      toast.error('Gagal donasi. Coba lagi ya.');
      setStep('idle');
    }
  }, [approveError, batchError, donateError]);

  return {
    executeQuickDonate,
    isProcessing: step !== 'idle' || isBatchPending,
    isApproving: step === 'approving',
    isDonating: step === 'donating' || step === 'batching',
    isSuccess: donateSuccess || !!batchId,
  };
}
