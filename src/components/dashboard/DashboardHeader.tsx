"use client";

import { useAccountProviderContext } from "@/context/account-providers/provider-context";
import { useAccountWrapperContext } from "@/context/wrapper";
import { capitalize } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Wallet, Scan } from "lucide-react";
import Link from "next/link";

export default function DashboardHeader() {
  const { accountProvider: selectedProvider } = useAccountWrapperContext();
  const { embeddedWallet, isDeployed } = useAccountProviderContext();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Manage your payments and transactions.
        </p>
      </div>

      <div className="flex items-center gap-3">
        {isDeployed ? (
          <Badge className="bg-green-100 text-green-800 border-green-200 px-3 py-1">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Deployed
          </Badge>
        ) : embeddedWallet ? (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 px-3 py-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
            Not Deployed
          </Badge>
        ) : (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200 px-3 py-1">
            <div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>
            Logged Out
          </Badge>
        )}

        <Link
          href="/scanner"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <Scan className="w-4 h-4" />
          <span className="hidden sm:inline">Scan & Pay</span>
        </Link>
      </div>
    </div>
  );
}


