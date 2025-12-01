"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownLeft, Scan, Plus } from "lucide-react";
import Link from "next/link";

interface Operation {
  id: string;
  type: "send" | "receive" | "scan";
  amount: string;
  recipient?: string;
  timestamp: string;
  status: "completed" | "pending";
}

// Mock data - replace with actual data from your context/API
const mockOperations: Operation[] = [
  {
    id: "1",
    type: "send",
    amount: "10.50",
    recipient: "0x1234...5678",
    timestamp: "2 hours ago",
    status: "completed",
  },
  {
    id: "2",
    type: "receive",
    amount: "25.00",
    timestamp: "5 hours ago",
    status: "completed",
  },
  {
    id: "3",
    type: "scan",
    amount: "5.00",
    recipient: "0xabcd...efgh",
    timestamp: "1 day ago",
    status: "completed",
  },
];

export default function RecentOperations() {
  const getIcon = (type: Operation["type"]) => {
    switch (type) {
      case "send":
        return <ArrowUpRight className="w-4 h-4 text-red-600" />;
      case "receive":
        return <ArrowDownLeft className="w-4 h-4 text-green-600" />;
      case "scan":
        return <Scan className="w-4 h-4 text-purple-600" />;
    }
  };

  const getTypeLabel = (type: Operation["type"]) => {
    switch (type) {
      case "send":
        return "Sent";
      case "receive":
        return "Received";
      case "scan":
        return "QR Payment";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Operations</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/scanner">
              <Plus className="w-4 h-4 mr-2" />
              New Payment
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockOperations.length > 0 ? (
            mockOperations.map((operation) => (
              <div
                key={operation.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-muted">
                    {getIcon(operation.type)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{getTypeLabel(operation.type)}</p>
                    {operation.recipient && (
                      <p className="text-xs text-muted-foreground font-mono">
                        {operation.recipient}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">{operation.timestamp}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      operation.type === "receive" ? "text-green-600" : "text-gray-800"
                    }`}
                  >
                    {operation.type === "receive" ? "+" : "-"}
                    {operation.amount} USDC
                  </p>
                  <span className="text-xs text-muted-foreground">{operation.status}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No recent operations</p>
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link href="/scanner">Make your first payment</Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


