"use client";

import { useAccountProviderContext } from "@/context/account-providers/provider-context";
import { useBalance } from "wagmi";
import { baseSepolia } from "viem/chains";
import { ZERODEV_TOKEN_ADDRESS } from "@/lib/constants";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import BalanceOverview from "@/components/dashboard/BalanceOverview";
import RecentOperations from "@/components/dashboard/RecentOperations";
import PromoSection from "@/components/dashboard/PromoSection";
import MyCardsSection from "@/components/dashboard/MyCardsSection";
import TransactionHistory from "@/components/dashboard/TransactionHistory";

export default function WalletPage() {
  const { embeddedWallet } = useAccountProviderContext();

  const { data: tokenBalance } = useBalance({
    address: embeddedWallet?.address as `0x${string}`,
    token: ZERODEV_TOKEN_ADDRESS,
    query: {
      refetchInterval: 5000,
    },
    chainId: baseSepolia.id,
  });

  const { data: ethBalance } = useBalance({
    address: embeddedWallet?.address as `0x${string}`,
    query: {
      refetchInterval: 5000,
    },
    chainId: baseSepolia.id,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
        <DashboardHeader />

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Main Content */}
          <div className="space-y-6 lg:col-span-2">
            <BalanceOverview
              tokenBalance={tokenBalance}
              ethBalance={ethBalance}
            />
            <RecentOperations />
            <TransactionHistory />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <PromoSection />
            <MyCardsSection />
          </div>
        </div>
      </div>
    </div>
  );
}