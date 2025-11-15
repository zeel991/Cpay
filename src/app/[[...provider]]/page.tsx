"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { useAccountProviderContext } from "@/context/account-providers/provider-context";
import { useAccountWrapperContext } from "@/context/wrapper";
import { EXPLORER_URL } from "@/lib/constants";
import { UserPill as PrivyUserPill } from "@privy-io/react-auth/ui";
import { toast } from "sonner";
import { useBalance } from "wagmi";
import { baseSepolia } from "viem/chains";
import { usePrivy } from "@privy-io/react-auth";

export default function Home() {
  const { accountProvider: selectedProvider } = useAccountWrapperContext();
  const { login, embeddedWallet, isDeployed } = useAccountProviderContext();
  const { user } = usePrivy();

  // Get ETH balance
  const { data: ethBalance } = useBalance({
    address: embeddedWallet?.address as `0x${string}`,
    query: {
      refetchInterval: 5000,
    },
    chainId: baseSepolia.id,
  });

  // Helper function to capitalize the provider name
  const capitalizeProvider = (provider: string) => {
    return provider.charAt(0).toUpperCase() + provider.slice(1);
  };

  // Helper function to format balance
  const formatBalance = (balance: string | undefined, decimals: number = 4) => {
    if (!balance) return "0.0000";
    const num = parseFloat(balance);
    return num.toFixed(decimals);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-4xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Brand & Status */}
          <div className="text-center lg:text-left">
            <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Cpay
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              EIP-7702 & ZeroDev powered payments
            </p>
            
            {/* Status Circle */}
            <div className="flex justify-center lg:justify-start">
              <div className="relative">
                <div className={`w-32 h-32 rounded-full flex flex-col items-center justify-center text-center text-xl font-bold transition-all duration-300 ${
                  isDeployed 
                    ? "bg-gradient-to-br from-green-400 to-green-600 text-white" 
                    : !embeddedWallet 
                    ? "bg-gradient-to-br from-gray-400 to-gray-600 text-white"
                    : "bg-gradient-to-br from-yellow-400 to-orange-500 text-white"
                } shadow-2xl hover:scale-105 transform transition-transform`}>
                  <div className="text-4xl mb-1">
                    {isDeployed ? "✅" : !embeddedWallet ? "❌" : "⚠️"}
                  </div>
                  <div className="text-sm">
                    {isDeployed ? "Deployed" : !embeddedWallet ? "Logged Out" : "Not Deployed"}
                  </div>
                </div>
                
                {/* Animated ring */}
                <div className={`absolute inset-0 rounded-full border-2 border-transparent ${
                  isDeployed 
                    ? "border-green-300 animate-pulse" 
                    : !embeddedWallet 
                    ? "border-gray-300" 
                    : "border-yellow-300 animate-pulse"
                }`}></div>
              </div>
            </div>
          </div>

          {/* Right Side - Account Info */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                <span className="font-mono text-lg font-semibold text-gray-800">
                  {capitalizeProvider(selectedProvider)} Account
                </span>
              </div>
              {isDeployed ? (
                <Badge className="bg-green-100 text-green-800 border-green-200 px-3 py-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Deployed
                </Badge>
              ) : !embeddedWallet ? (
                <Badge className="bg-gray-100 text-gray-800 border-gray-200 px-3 py-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>
                  Logged Out
                </Badge>
              ) : (
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 px-3 py-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                  Not Deployed
                </Badge>
              )}
            </div>

            {/* Privy User Details */}
            {selectedProvider === "privy" && user && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {user.email?.address?.charAt(0).toUpperCase() || user.id?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {user.email?.address || `User ${user.id?.slice(0, 8)}`}
                    </p>
                    <p className="text-xs text-gray-600">Privy Account</p>
                  </div>
                </div>
                <div className="text-xs text-gray-600">
                  <p>ID: {user.id}</p>
                  <p>Created: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}</p>
                </div>
              </div>
            )}

            {/* Wallet Address */}
            {embeddedWallet && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-4">
                <p className="text-sm font-medium text-gray-600 mb-2">Wallet Address</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs break-all font-mono bg-white px-3 py-2 rounded-lg border flex-1">
                    {embeddedWallet?.address}
                  </code>
                  <CopyButton
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    copyValue={embeddedWallet.address}
                    onCopy={() => toast.success("Address copied to clipboard")}
                  />
                </div>
                <a
                  target="_blank"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center gap-1 mt-2"
                  href={`${EXPLORER_URL}/address/${embeddedWallet?.address}`}
                >
                  View on Explorer
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}

            {/* Balance Display */}
            {embeddedWallet && ethBalance && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">ETH Balance</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {formatBalance(ethBalance.formatted)} {ethBalance.symbol}
                    </p>
                    <p className="text-xs text-gray-500">
                      ${ethBalance.value ? (parseFloat(ethBalance.formatted) * 2000).toFixed(2) : "0.00"} USD
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-600">
                  <p>Chain: Base Sepolia</p>
                  <p>Auto-refresh: Every 5s</p>
                </div>
              </div>
            )}

            {selectedProvider === "privy" && <PrivyUserPill />}

            {/* Action Button */}
            {selectedProvider === "local" && !embeddedWallet && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  className="px-6 py-3 text-base font-medium border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                  onClick={() => login()}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create 7702 Account
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
