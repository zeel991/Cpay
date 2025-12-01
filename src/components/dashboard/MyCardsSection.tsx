"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccountProviderContext } from "@/context/account-providers/provider-context";
import { useAccountWrapperContext } from "@/context/wrapper";
import { CreditCard } from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";
import { toast } from "sonner";
import { UserPill as PrivyUserPill } from "@privy-io/react-auth/ui";
import { usePrivy } from "@privy-io/react-auth";

export default function MyCardsSection() {
  const { embeddedWallet } = useAccountProviderContext();
  const { accountProvider: selectedProvider } = useAccountWrapperContext();
  const { user } = usePrivy();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-purple-600" />
          My Wallet
        </CardTitle>
      </CardHeader>
      <CardContent>
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

        {embeddedWallet ? (
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase">
                  Wallet Address
                </span>
                <CopyButton
                  copyValue={embeddedWallet.address}
                  onCopy={() => toast.success("Address copied to clipboard")}
                />
              </div>
              <p className="text-sm font-mono break-all text-gray-800">
                {embeddedWallet.address}
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase">
                  Account Type
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-800">
                EIP-7702 Smart Account
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Powered by ZeroDev
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">No wallet connected</p>
            <p className="text-xs mt-1">Connect your wallet to view details</p>
          </div>
        )}

        {/* Privy Login Button */}
        {selectedProvider === "privy" && <div className="mt-4"><PrivyUserPill /></div>}
      </CardContent>
    </Card>
  );
}

