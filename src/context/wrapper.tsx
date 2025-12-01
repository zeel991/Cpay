"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import React, { createContext, useContext, useEffect, useState } from "react";
import { baseSepolia, sepolia } from "viem/chains";
import { createConfig, http, WagmiProvider } from "wagmi";
import PrivyAccountProvider from "@/context/account-providers/privy-account-provider";
import { AccountProviders } from "@/context/account-providers/provider-context";
import type { PrivyClientConfig } from '@privy-io/react-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export const AccountProviderWrapperContext = createContext<{
  accountProvider: AccountProviders;
  setAccountProvider: (accountProvider: AccountProviders) => void;
}>({
  accountProvider: "privy",
  setAccountProvider: () => {},
});

const queryClient = new QueryClient();

export const privyConfig: PrivyClientConfig = {
  appearance: {
    theme: 'dark',
    accentColor: '#676FFF',
    logo: '/next.svg',
  },
  loginMethods: ['wallet'],
  embeddedWallets: {
    createOnLogin: 'users-without-wallets',
  },
  defaultChain: baseSepolia,
  supportedChains: [sepolia, baseSepolia],
}

export const wagmiConfig = createConfig({
  chains: [baseSepolia, sepolia],
  transports: {
    [sepolia.id]: http(),
    [baseSepolia.id]: http(),
  },
});

const AccountProviderWrapper = ({
  children,
  initialProvider,
}: {
  children: React.ReactNode;
  initialProvider: string;
}) => {
  useEffect(() => {
    console.log("[ENV DEBUG] NEXT_PUBLIC_PRIVY_APP_ID:", process.env.NEXT_PUBLIC_PRIVY_APP_ID ? `${process.env.NEXT_PUBLIC_PRIVY_APP_ID.substring(0, 8)}...` : "MISSING");
    console.log("[ENV DEBUG] NEXT_PUBLIC_PROJECT_ID:", process.env.NEXT_PUBLIC_PROJECT_ID ? `${process.env.NEXT_PUBLIC_PROJECT_ID.substring(0, 8)}...` : "MISSING");
  }, []);

  const [accountProvider, setAccountProvider] = useState<AccountProviders>(
    (initialProvider as AccountProviders) ?? "privy",
  );

  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  useEffect(() => {
    console.log("[ENV DEBUG] Initializing Privy with appId:", privyAppId ? `${privyAppId.substring(0, 8)}...` : "MISSING");
    
    if (!privyAppId) {
      console.error("[ENV ERROR] NEXT_PUBLIC_PRIVY_APP_ID is required but not set!");
    }
  }, [privyAppId]);

  return (
    <AccountProviderWrapperContext.Provider
      value={{
        accountProvider,
        setAccountProvider,
      }}
    >
       <PrivyProvider
         appId={privyAppId as string}
         config={privyConfig}
       > 
        <QueryClientProvider client={queryClient}>
          <WagmiProvider config={wagmiConfig} reconnectOnMount={false}>
            <PrivyAccountProvider>
              {children}
            </PrivyAccountProvider>
          </WagmiProvider>
        </QueryClientProvider>
      </PrivyProvider>
     </AccountProviderWrapperContext.Provider>
  );
};

export const useAccountWrapperContext = () => {
  return useContext(AccountProviderWrapperContext);
};

export default AccountProviderWrapper;