"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, ExternalLink } from "lucide-react";
import { EXPLORER_URL } from "@/lib/constants";
import { useAccountProviderContext } from "@/context/account-providers/provider-context";
import Link from "next/link";

interface Transaction {
  hash: string;
  type: "payment" | "transfer";
  amount: string;
  timestamp: string;
  status: "success" | "pending" | "failed";
}

// Mock data - replace with actual transaction data
const mockTransactions: Transaction[] = [
  {
    hash: "0x1234...5678",
    type: "payment",
    amount: "10.50",
    timestamp: "2 hours ago",
    status: "success",
  },
  {
    hash: "0xabcd...efgh",
    type: "transfer",
    amount: "25.00",
    timestamp: "5 hours ago",
    status: "success",
  },
  {
    hash: "0x9876...5432",
    type: "payment",
    amount: "5.00",
    timestamp: "1 day ago",
    status: "pending",
  },
];

export default function TransactionHistory() {
  const { embeddedWallet } = useAccountProviderContext();

  const getStatusColor = (status: Transaction["status"]) => {
    switch (status) {
      case "success":
        return "text-green-600 bg-green-50";
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      case "failed":
        return "text-red-600 bg-red-50";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-purple-600" />
            Transaction History
          </CardTitle>
          {embeddedWallet && (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`${EXPLORER_URL}/address/${embeddedWallet.address}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View All
                <ExternalLink className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockTransactions.length > 0 ? (
            mockTransactions.map((tx, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm truncate font-mono">{tx.hash}</p>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(
                        tx.status
                      )}`}
                    >
                      {tx.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="capitalize">{tx.type}</span>
                    <span>•</span>
                    <span>{tx.timestamp}</span>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="font-semibold text-sm">{tx.amount} USDC</p>
                  <Link
                    href={`${EXPLORER_URL}/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-purple-600 hover:underline flex items-center gap-1 justify-end mt-1"
                  >
                    View
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No transactions yet</p>
              <p className="text-xs mt-1">Your transaction history will appear here</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


