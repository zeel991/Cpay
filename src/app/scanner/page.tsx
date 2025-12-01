"use client";

import React, { useState } from "react";
import Link from "next/link";
import QRScanner from "./scanner-component";
import Footer from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccountProviderContext } from "@/context/account-providers/provider-context";
import { EXPLORER_URL,ZERODEV_DECIMALS , ZERODEV_TOKEN_ADDRESS, CONTRACT_ADDRESS } from "@/lib/constants";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader, X, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { encodeFunctionData, formatUnits, isAddress, parseUnits } from "viem";
import { baseSepolia } from "viem/chains";
import { useBalance } from "wagmi";
const paymentId = "0x0000000000000000000000000000000000000000000000000000000000000001";

// Enhanced interfaces for better type safety
interface QRPaymentData {
  ma: string; // merchant address
  a: string; // amount (now using 'a' instead of 'amount' to match your QR format)
  txn?: string; // transaction type (optional)
}

export default function Scanner() {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<string>("");
  const [scanHistory, setScanHistory] = useState<string[]>([]);
  const [parsedData, setParsedData] = useState<QRPaymentData | null>(null);
  const [amount, setAmount] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [isManualMode, setIsManualMode] = useState(false);

  const { kernelAccountClient, embeddedWallet, provider } = useAccountProviderContext();

  const { data: balance, refetch: refetchBalance } = useBalance({
    address: embeddedWallet?.address,
    token: ZERODEV_TOKEN_ADDRESS,
    query: {
      refetchInterval: 5000, // existing auto refetch every 5 sec
    },
    chainId: baseSepolia.id,
  });
  console.log("embeddedWallet", embeddedWallet?.address);

  // Enhanced QR data parsing function
  const parseQRPaymentData = (data: string): QRPaymentData | null => {
    try {
      const parsed = JSON.parse(data);

      // Support both formats: {ma, a} and {ma, amount, txn}
      if (parsed.ma && (parsed.a || parsed.amount)) {
        return {
          ma: parsed.ma,
          a: parsed.a || parsed.amount,
          txn: parsed.txn || "payment",
        };
      }

      throw new Error("Invalid payment QR format");
    } catch (error) {
      console.error("Failed to parse QR payment data:", error);
      toast.error('Invalid QR format. Expected: {"ma": "address", "a": "amount"}');
      return null;
    }
  };

  // Validation function
  const validatePaymentData = (data: QRPaymentData): boolean => {
    if (!isAddress(data.ma)) {
      toast.error("Invalid merchant address format");
      return false;
    }

    if (!data.a || parseFloat(data.a) <= 0) {
      toast.error("Invalid amount");
      return false;
    }

    return true;
  };

  // Enhanced batch transaction mutation

  const {
    mutate: sendPaymentTransaction,
    isPending,
    data: userOpHash,
    reset: resetTransaction,
  } = useMutation({
    mutationKey: ["qr-payment-batch", kernelAccountClient?.account?.address, amount, toAddress],
    mutationFn: async () => {
      try {
        if (!kernelAccountClient?.account) throw new Error("No kernel account client found");
        if (!toAddress || !isAddress(toAddress)) throw new Error("Invalid merchant address");
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) throw new Error("Invalid amount");

        // Ensure amount is a string
        // if (typeof amount !== "string") {
        //   throw new Error("Amount must be a string for parseUnits");
        // }

        // Now parse when safe
        const amountInWei = parseUnits(amount, ZERODEV_DECIMALS);

        const approveData = encodeFunctionData({
          abi: [
            {
              name: "approve",
              type: "function",
              inputs: [
                { name: "spender", type: "address" },
                { name: "amount", type: "uint256" },
              ],
            },
          ],
          functionName: "approve",
          args: [CONTRACT_ADDRESS, amountInWei],
        });
        console.log("approveData encoded successfully");

        const payData = encodeFunctionData({
          abi: [
            {
              name: "pay",
              type: "function",
              inputs: [
                { name: "paymentId", type: "bytes32" },
                { name: "token", type: "address" },
                { name: "amount", type: "uint256" },
              ],
            },
          ],
          functionName: "pay",
          args: [paymentId, ZERODEV_TOKEN_ADDRESS, amountInWei],
        });
        console.log("payData encoded successfully");

        return kernelAccountClient.sendUserOperation({
          calls: [
            {
              to: ZERODEV_TOKEN_ADDRESS,
              value: BigInt(0),
              data: approveData,
            },
            {
              to: CONTRACT_ADDRESS,
              value: BigInt(0),
              data: payData,
            },
          ],
        });
      } catch (error) {
        console.error("Error in mutationFn:", error);

        console.log("=== Debugging encodeFunctionData inputs ===");
        console.log("paymentId:", paymentId, typeof paymentId, paymentId.length);
        console.log(
          "ZERODEV_TOKEN_ADDRESS:",
          ZERODEV_TOKEN_ADDRESS,
          typeof ZERODEV_TOKEN_ADDRESS,
          ZERODEV_TOKEN_ADDRESS.length,
        );
        console.log("CONTRACT_ADDRESS:", CONTRACT_ADDRESS, typeof CONTRACT_ADDRESS, CONTRACT_ADDRESS.length);
        // console.log("amountInWei:", amountInWei, typeof amountInWei);
        // Try encoding to catch any errors early
        console.log("=== DEBUG ENCODE INPUTS ===");
        console.log("paymentId value:", paymentId, "\ntype:", typeof paymentId, "\nlength:", paymentId?.length);
        console.log(
          "ZERODEV_TOKEN_ADDRESS value:",
          ZERODEV_TOKEN_ADDRESS,
          "\ntype:",
          typeof ZERODEV_TOKEN_ADDRESS,
          "\nlength:",
          ZERODEV_TOKEN_ADDRESS?.length,
        );
        console.log(
          "CONTRACT_ADDRESS value:",
          CONTRACT_ADDRESS,
          "\ntype:",
          typeof CONTRACT_ADDRESS,
          "\nlength:",
          CONTRACT_ADDRESS?.length,
        );
        //  console.log("amountInWei value:", amountInWei, "\ntype:", typeof amountInWei, "\nisBigInt:", typeof amountInWei === 'bigint');
        // Check: Is paymentId a valid 32-byte hex string?
        const isBytes32 = typeof paymentId === "string" && /^0x[0-9a-fA-F]{64}$/.test(paymentId);
        console.log("paymentId is valid bytes32 hex:", isBytes32);

        // Check: Are addresses valid?
        //  const isAddress = (addr) => typeof addr === "string" && /^0x[0-9a-fA-F]{40}$/.test(addr);
        console.log("ZERODEV_TOKEN_ADDRESS is valid:", isAddress(ZERODEV_TOKEN_ADDRESS));
        console.log("CONTRACT_ADDRESS is valid:", isAddress(CONTRACT_ADDRESS));

        // If not valid, print an error
        if (!isBytes32) {
          console.error("paymentId is not valid bytes32 hex string. Use a helper to pad/convert!");
        }
        if (!isAddress(ZERODEV_TOKEN_ADDRESS)) {
          console.error("ZERODEV_TOKEN_ADDRESS is not a valid address.");
        }
        if (!isAddress(CONTRACT_ADDRESS)) {
          console.error("CONTRACT_ADDRESS is not a valid address.");
        }
        //  if (typeof amountInWei !== "bigint") {
        //    console.error("amountInWei must be a BigInt.");
        //  }
        throw error;
      }
    },

    onSuccess: (data) => {
      refetchBalance();
      toast.success("Payment transaction sent successfully!");
      console.log("Payment transaction hash:", data);
    },
    onError: (error) => {
      toast.error("Payment transaction failed");
      console.error("Payment transaction error:", error);
    },
  });

  const { data: userOpReceipt, isLoading } = useQuery({
    queryKey: ["userOpReceipt", userOpHash],
    queryFn: async () => {
      if (!userOpHash) throw new Error("No transaction hash found");
      return await kernelAccountClient?.waitForUserOperationReceipt({
        hash: userOpHash,
      });
    },
    enabled: !!userOpHash,
  });

  // Handle successful QR scan with enhanced parsing
  const handleScanResult = (data: string): void => {
    console.log("Scanned QR data:", data);
    setScanResult(data);
    setScanHistory((prev) => [data, ...prev.slice(0, 9)]);
    setIsScanning(false);

    // Parse QR payment data
    const paymentData = parseQRPaymentData(data);
    if (paymentData && validatePaymentData(paymentData)) {
      setParsedData(paymentData);
      setToAddress(paymentData.ma);
      setAmount(paymentData.a);
      toast.success("Payment QR code scanned successfully!");
    }
  };

  // Auto-fill from QR data
  const populateFromQRData = (data: QRPaymentData) => {
    setToAddress(data.ma);
    setAmount(data.a);
    setParsedData(data);
  };

  // Clear functions
  const clearParsedData = (): void => {
    setParsedData(null);
    setAmount("");
    setToAddress("");
    setScanResult("");
    resetTransaction();
    setIsManualMode(false);
  };

  const clearHistory = (): void => {
    setScanHistory([]);
    setScanResult("");
  };

  // Computed values
  const isDisabled = !embeddedWallet || !kernelAccountClient;
  const canExecutePayment = toAddress && amount && !isPending && !isDisabled && isAddress(toAddress);

  return (
    <>
      
      {/* Main Content */}
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="container mx-auto max-w-6xl px-6 py-12">
          <main className="space-y-8">
            {/* Header */}
            <div className="mb-12 text-center">
              <h1 className="mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
                QR Payment Scanner
              </h1>
              <p className="mx-auto max-w-2xl text-xl text-gray-600">
                Scan payment QR codes and execute instant batch transactions
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Scanner Section */}
              <div className="space-y-6">
                {/* QR Scanner Card */}
                {!parsedData && !isManualMode && (
                  <Card className="border-gray-200 bg-white/80 shadow-xl backdrop-blur-sm">
                    <CardContent className="p-8">
                      <QRScanner
                        onScanResult={handleScanResult}
                        isScanning={isScanning}
                        onStartScan={() => setIsScanning(true)}
                        onStopScan={() => setIsScanning(false)}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Manual Entry Option */}
                {!parsedData && !isScanning && (
                  <Card className="border-gray-200 bg-white/80 shadow-xl backdrop-blur-sm">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="mb-4 text-gray-600">Can't scan QR code? Enter payment details manually</p>
                        <Button
                          variant="outline"
                          onClick={() => setIsManualMode(true)}
                          className="w-full"
                        >
                          Enter Payment Details Manually
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Current Result Display */}
                {scanResult && (
                  <Card className="border-gray-200 bg-white/80 shadow-xl backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        Latest QR Scan
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <code className="mb-4 block font-mono text-sm break-all text-gray-800">{scanResult}</code>
                        <Button
                          variant="outline"
                          onClick={() => navigator.clipboard?.writeText(scanResult)}
                          className="w-full"
                        >
                          Copy to Clipboard
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Payment Transaction Section */}
              <div className="space-y-6">
                {/* Payment Form */}
                {(parsedData || isManualMode) && (
                  <Card className="border-gray-200 bg-white/80 shadow-xl backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          Payment Transaction
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearParsedData}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge className="h-9 text-sm font-medium">1. AMOUNT</Badge>
                        <Input
                          className="bg-background"
                          type="text"
                          placeholder="Amount"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          disabled={!!parsedData && !isManualMode}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge className="h-9 text-sm font-medium">2. Merchant ADDRESS</Badge>
                        <Input
                          className="bg-background"
                          type="text"
                          placeholder="Merchant Address"
                          value={toAddress}
                          onChange={(e) => setToAddress(e.target.value)}
                          disabled={!!parsedData && !isManualMode}
                        />
                      </div>

                      {/* Address validation feedback */}
                      {toAddress && !isAddress(toAddress) && (
                        <p className="text-sm text-red-600">Invalid merchant address format</p>
                      )}

                      {/* Payment info display */}
                      {parsedData && (
                        <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                          <p className="text-sm font-medium text-green-800">
                            Payment from QR code: {parsedData.a} tokens to {parsedData.ma.substring(0, 8)}...
                          </p>
                        </div>
                      )}

                      {balance && (
                        <div className="rounded-lg bg-gray-50 p-3">
                          <p className="text-sm text-gray-600">
                            <strong>Current Balance:</strong>{" "}
                            {formatUnits(balance?.value ?? BigInt(0), ZERODEV_DECIMALS ?? 18)} {"USDC"}
                          </p>
                        </div>
                      )}

                      <Button
                        disabled={!canExecutePayment || isLoading}
                        onClick={() => sendPaymentTransaction()}
                        className="w-full"
                      >
                        {isPending ? (
                          <>
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                            Processing Payment...
                          </>
                        ) : (
                          "Execute Payment Transaction"
                        )}
                      </Button>

                      {userOpReceipt && (
                        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                          <p className="mb-2 text-sm font-medium text-green-800">Payment Successful! ✅</p>
                          <a
                            href={`${EXPLORER_URL}/tx/${userOpReceipt.receipt.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-blue-600 underline underline-offset-4 hover:text-blue-800"
                          >
                            View Transaction on Explorer
                          </a>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Scan History */}
                {scanHistory.length > 0 && (
                  <Card className="border-gray-200 bg-white/80 shadow-xl backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                          <span>Scan History</span>
                          <Badge variant="secondary">{scanHistory.length}</Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearHistory}
                        >
                          Clear All
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-80 space-y-3 overflow-y-auto">
                        {scanHistory.map((item, index) => (
                          <div
                            key={index}
                            className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                          >
                            <div className="flex items-start gap-3">
                              <Badge variant="outline">#{index + 1}</Badge>
                              <div className="min-w-0 flex-1">
                                <code className="mb-2 block font-mono text-sm break-all text-gray-800">{item}</code>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigator.clipboard?.writeText(item)}
                                  >
                                    Copy
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const paymentData = parseQRPaymentData(item);
                                      if (paymentData && validatePaymentData(paymentData)) {
                                        populateFromQRData(paymentData);
                                        toast.success("Payment data loaded from history");
                                      }
                                    }}
                                  >
                                    Use for Payment
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Empty State */}
                {!scanResult && scanHistory.length === 0 && !parsedData && !isManualMode && (
                  <Card className="border-gray-200 bg-white/80 shadow-xl backdrop-blur-sm">
                    <CardContent className="p-8 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                        <svg
                          className="h-8 w-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                          />
                        </svg>
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-gray-800">No QR codes scanned yet</h3>
                      <p className="text-sm text-gray-600">Start scanning payment QR codes to execute transactions</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      <style jsx>{`
        /* Enhanced QR Scanner Styles */
        :global(.qr-scanner) {
          text-align: center;
        }

        :global(.qr-scanner h2) {
          color: #374151;
          margin-bottom: 24px;
          font-size: 24px;
          font-weight: 600;
        }

        :global(.scanner-start) {
          padding: 40px 20px;
        }

        :global(.scanner-start p) {
          color: #6b7280;
          margin-bottom: 24px;
          font-size: 16px;
          line-height: 1.6;
        }

        :global(.btn-primary) {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
          border: none;
          padding: 14px 28px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px 0 rgba(79, 70, 229, 0.3);
        }

        :global(.btn-primary:hover) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px 0 rgba(79, 70, 229, 0.4);
        }

        :global(.btn-secondary) {
          background: #6b7280;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          margin-top: 16px;
          transition: all 0.2s ease;
        }

        :global(.btn-secondary:hover) {
          background: #4b5563;
          transform: translateY(-1px);
        }

        :global(.qr-reader) {
          position: relative;
          width: 100%;
          max-width: 400px;
          margin: 0 auto;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        :global(.qr-reader video) {
          width: 100%;
          height: 300px;
          object-fit: cover;
          border-radius: 16px;
        }

        :global(.qr-box) {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        :global(.qr-frame) {
          width: 200px;
          height: 200px;
          border: 3px solid #4f46e5;
          border-radius: 16px;
          background: transparent;
          box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.3);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            border-color: #4f46e5;
          }
          50% {
            border-color: #7c3aed;
          }
        }

        :global(.error-message) {
          color: #dc2626;
          margin-top: 16px;
          padding: 12px 16px;
          background: #fef2f2;
          border-radius: 8px;
          border: 1px solid #fecaca;
          font-size: 14px;
        }

        @media (max-width: 640px) {
          :global(.qr-reader) {
            max-width: 100%;
          }

          :global(.qr-reader video) {
            height: 250px;
          }

          :global(.qr-frame) {
            width: 150px;
            height: 150px;
          }
        }
      `}</style>

      {/* Footer */}
      <Footer />
    </>
  );
}
