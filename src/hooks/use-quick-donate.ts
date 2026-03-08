'use client';

import { useState, useCallback, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useReadContract } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { parseEther } from 'viem';
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
  const [step, setStep] = useState<'idle' | 'approving' | 'donating'>('idle');

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

  const { 
    isLoading: isApproving, 
    isSuccess: approveSuccess 
  } = useWaitForTransactionReceipt({ hash: approveHash });

  const { 
    isLoading: isDonating, 
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

    // If allowance is already enough (>= 1k), just donate
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

    // Otherwise, request approval for 10k
    setStep('approving');
    approveContract({
      address: IDRX_ADDRESS,
      abi: IDRX_ABI,
      functionName: 'approve',
      args: [campaignAddress, approvalAmount],
    });
  }, [approveContract, campaignAddress, userAddress, allowance, donateContract]);

  // Handle Approval Success
  useEffect(() => {
    if (approveSuccess && step === 'approving') {
      toast.success('Izin 10k Berhasil! 🎉', {
        description: 'Sekarang swipe sekali lagi buat donasi 1k.'
      });
      void refetchAllowance();
      setStep('idle');
    }
  }, [approveSuccess, step, refetchAllowance]);

  // Handle Donation Success
  useEffect(() => {
    if (donateSuccess) {
      toast.success(`Berhasil Donasi ${QUICK_DONATE_AMOUNT} IDRX! 💝`);

      // Invalidate queries to update progress bars immediately
      void queryClient.invalidateQueries({
        queryKey: ['contracts']
      });

      // Delay callback by 2 seconds to allow node synchronization
      const timer = setTimeout(() => {
        void refetchAllowance();
        onSuccess?.();
        setStep('idle');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [donateSuccess, onSuccess, refetchAllowance, queryClient]);

  // Handle errors
  useEffect(() => {
    if (approveError) {
      toast.error('Gagal memberikan izin. Coba lagi ya.');
      setStep('idle');
    }
    if (donateError) {
      toast.error('Donasi gagal. Pastikan saldo IDRX cukup.');
      setStep('idle');
    }
  }, [approveError, donateError]);

  return {
    executeQuickDonate,
    isProcessing: step !== 'idle',
    isApproving: step === 'approving',
    isDonating: step === 'donating',
    isSuccess: donateSuccess,
  };
}
