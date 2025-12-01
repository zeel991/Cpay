"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatUnits } from "viem";
import { ZERODEV_DECIMALS } from "@/lib/constants";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";

interface BalanceOverviewProps {
  tokenBalance: any;
  ethBalance: any;
}

export default function BalanceOverview({ tokenBalance, ethBalance }: BalanceOverviewProps) {
  const formatBalance = (balance: bigint | undefined, decimals: number = 18, displayDecimals: number = 4) => {
    if (!balance) return "0.0000";
    const formatted = formatUnits(balance, decimals);
    return parseFloat(formatted).toFixed(displayDecimals);
  };

  const tokenAmount = tokenBalance ? formatBalance(tokenBalance.value, ZERODEV_DECIMALS, 2) : "0.00";
  const ethAmount = ethBalance ? formatBalance(ethBalance.value, 18, 4) : "0.0000";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-purple-600" />
          Balance Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Token Balance */}
          <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Token Balance</span>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-800">{tokenAmount}</span>
              <span className="text-sm text-muted-foreground">USDC</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ≈ ${(parseFloat(tokenAmount) * 1).toFixed(2)} USD
            </p>
          </div>

          {/* ETH Balance */}
          <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">ETH Balance</span>
              <TrendingDown className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-800">{ethAmount}</span>
              <span className="text-sm text-muted-foreground">ETH</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ≈ ${(parseFloat(ethAmount) * 2000).toFixed(2)} USD
            </p>
          </div>
        </div>

        {/* Total Value */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Total Value</span>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ${((parseFloat(tokenAmount) * 1) + (parseFloat(ethAmount) * 2000)).toFixed(2)} USD
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


