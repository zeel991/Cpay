"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import React, { createContext, useContext, useMemo, useState } from "react";
import { baseSepolia, sepolia } from "viem/chains";
import { createConfig, http, WagmiProvider } from "wagmi";
import LocalAccountProvider from "./account-providers/local-account-provider";
import PrivyAccountProvider from "./account-providers/privy-account-provider";
import { AccountProviders } from "./account-providers/provider-context";

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
  chains: [baseSepolia, sepolia, ],
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
  const [accountProvider, setAccountProvider] = useState<AccountProviders>(
    (initialProvider as AccountProviders) ?? "privy",
  );

  const EmbeddedOrInjectedProvider = useMemo(() => {
    if (accountProvider === "privy") {
      const PrivyProviderWrapper = ({ children }: { children: React.ReactNode }) => (
        <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID as string}
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
      );
      return PrivyProviderWrapper;
    }
  

    const LocalProviderWrapper = ({ children }: { children: React.ReactNode }) => (
      <WagmiProvider config={wagmiConfig}>
        <LocalAccountProvider>{children}</LocalAccountProvider>
      </WagmiProvider>
    );
    return LocalProviderWrapper;
  }, [accountProvider]);

  return (
    <AccountProviderWrapperContext.Provider
      value={{
        accountProvider,
        setAccountProvider,
      }}
    >
      <EmbeddedOrInjectedProvider>{children}</EmbeddedOrInjectedProvider>
    </AccountProviderWrapperContext.Provider>
  );
};

export const useAccountWrapperContext = () => {
  return useContext(AccountProviderWrapperContext);
};

export default AccountProviderWrapper;
