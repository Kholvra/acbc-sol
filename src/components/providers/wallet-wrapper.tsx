'use client';

import React from 'react';
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
  WalletDropdownLink,
} from '@coinbase/onchainkit/wallet';
import {
  Address,
  Avatar,
  Name,
  Identity,
  EthBalance,
} from '@coinbase/onchainkit/identity';

type WalletWrapperProps = {
  className?: string;
  text?: string;
  withWalletAggregator?: boolean; 
};

export default function WalletWrapper({ className, text }: WalletWrapperProps) {
  return (
    <div className={`flex ${className}`}>
      <Wallet>
        <ConnectWallet className="bg-aid-green text-white hover:bg-aid-dark transition-colors rounded-full px-4 py-2 font-bold font-body">
          <Avatar className="h-6 w-6" />
          <Name className="text-white" />
          {text && <span className="ml-2">{text}</span>}
        </ConnectWallet>
        <WalletDropdown>
          <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
            <Avatar />
            <Name />
            <Address />
            <EthBalance />
          </Identity>
          <WalletDropdownLink icon="wallet" href="https://keys.coinbase.com">
            Wallet
          </WalletDropdownLink>
          <WalletDropdownDisconnect />
        </WalletDropdown>
      </Wallet>
    </div>
  );
}
