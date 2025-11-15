"use client";

import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccountProviderContext } from "@/context/account-providers/provider-context";
import { EXPLORER_URL, ZERODEV_DECIMALS, ZERODEV_TOKEN_ADDRESS } from "@/lib/constants";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader, Scan, X } from "lucide-react";
import { toast } from "sonner";
import { encodeFunctionData, formatUnits, parseUnits, isAddress } from "viem";
import { baseSepolia } from "viem/chains";
import { useBalance } from "wagmi";

// Type definitions
interface QRScanResult {
  data: string;
  cornerPoints?: Array<{ x: number; y: number }>;
  [key: string]: any;
}

interface QRPaymentData {
  ma: string; // merchant wallet address
  a: string;  // amount
}

interface QRScannerProps {
  onScanResult: (data: string) => void;
  isScanning: boolean;
  onStartScan: () => void;
  onStopScan: () => void;
}

type ScanError = Error | string | any;

// QR Scanner Component
const QRScannerComponent: React.FC<QRScannerProps> = ({ 
  onScanResult, 
  isScanning, 
  onStartScan, 
  onStopScan 
}) => {
  const videoEl = useRef<HTMLVideoElement | null>(null);
  const qrBoxEl = useRef<HTMLDivElement | null>(null);
  const scanner = useRef<QrScanner | null>(null);
  const [error, setError] = useState<string>('');

  const onScanSuccess = (result: QRScanResult): void => {
    console.log('QR Scanned:', result.data);
    onScanResult(result.data);
  };

  const onScanFail = (err: ScanError): void => {
    console.log('Scan failed:', err);
  };

  useEffect(() => {
    if (isScanning && videoEl.current && !scanner.current) {
      scanner.current = new QrScanner(
        videoEl.current,
        onScanSuccess,
        {
          onDecodeError: onScanFail,
          preferredCamera: 'environment',
          highlightScanRegion: true,
          highlightCodeOutline: true,
          overlay: qrBoxEl.current || undefined,
        }
      );
      
      scanner.current
        .start()
        .then(() => setError(''))
        .catch((err: Error) => {
          setError('Camera access denied. Please allow camera permission.');
          console.error('Scanner start error:', err);
        });
    }

    return () => {
      if (scanner.current) {
        scanner.current.stop();
        scanner.current = null;
      }
    };
  }, [isScanning]);

  const handleStartScan = (): void => {
    setError('');
    onStartScan();
  };

  const handleStopScan = (): void => {
    if (scanner.current) {
      scanner.current.stop();
      scanner.current = null;
    }
    onStopScan();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scan className="h-5 w-5" />
          QR Code Payment Scanner
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isScanning ? (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Ready to scan a payment QR code</p>
            <Button onClick={handleStartScan} className="w-full">
              <Scan className="mr-2 h-4 w-4" />
              Start Camera
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative aspect-square max-w-sm mx-auto">
              <video 
                ref={videoEl} 
                className="w-full h-full object-cover rounded-lg"
              />
              <div ref={qrBoxEl} className="absolute inset-0">
                <div className="qr-frame border-2 border-primary rounded-lg w-full h-full"></div>
              </div>
            </div>
            
            <Button onClick={handleStopScan} variant="outline" className="w-full">
              <X className="mr-2 h-4 w-4" />
              Stop Scanning
            </Button>
            
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Main QR Payment Component
const QRPaymentBatch = () => {
  const { kernelAccountClient, embeddedWallet } = useAccountProviderContext();
  const [isScanning, setIsScanning] = useState(false);
  const [qrData, setQrData] = useState<QRPaymentData | null>(null);
  const [amount, setAmount] = useState("");
  const [merchantAddress, setMerchantAddress] = useState("");
  const [manualMode, setManualMode] = useState(false);

  const { data: balance } = useBalance({
    address: embeddedWallet?.address,
    token: ZERODEV_TOKEN_ADDRESS,
    query: {
      refetchInterval: 5000,
    },
    chainId: baseSepolia.id,
  });

  // Parse QR code data
  const parseQRData = (data: string): QRPaymentData | null => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.ma && parsed.a) {
        return {
          ma: parsed.ma,
          a: parsed.a
        };
      }
      throw new Error('Invalid QR format');
    } catch (error) {
      console.error('Failed to parse QR data:', error);
      toast.error('Invalid QR code format. Expected: {"ma": "address", "a": "amount"}');
      return null;
    }
  };

  // Handle QR scan result
  const handleQRScanResult = (data: string) => {
    const parsedData = parseQRData(data);
    if (parsedData) {
      setQrData(parsedData);
      setAmount(parsedData.a);
      setMerchantAddress(parsedData.ma);
      setIsScanning(false);
      toast.success('QR code scanned successfully!');
    }
  };

  // Validate address format
  const validateAddress = (address: string): boolean => {
    return isAddress(address);
  };

  // Batch transaction mutation
  const {
    mutate: sendPaymentTransaction,
    isPending,
    data: userOpHash,
  } = useMutation({
    mutationKey: ["qr-payment-batch", kernelAccountClient?.account?.address, amount, merchantAddress],
    mutationFn: async () => {
      if (!kernelAccountClient?.account) throw new Error("No kernel account client found");
      if (!merchantAddress || !validateAddress(merchantAddress)) {
        throw new Error("Invalid merchant address");
      }
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error("Invalid amount");
      }

      // const amountInWei = parseUnits(amount, ZERODEV_DECIMALS);

      return kernelAccountClient.sendUserOperation({
        calls: [
          // Step 1: Mint tokens (if needed)
          {
            to: ZERODEV_TOKEN_ADDRESS,
            value: BigInt(0),
            data: encodeFunctionData({
              abi: [
                {
                  name: "mint",
                  type: "function",
                  inputs: [
                    { name: "to", type: "address" },
                    { name: "amount", type: "uint256" },
                  ],
                },
              ],
              functionName: "mint",
              args: [kernelAccountClient.account.address, amount],
            }),
          },
          // Step 2: Transfer tokens to merchant
          {
            to: ZERODEV_TOKEN_ADDRESS,
            value: BigInt(0),
            data: encodeFunctionData({
              abi: [
                {
                  name: "transfer",
                  type: "function",
                  inputs: [
                    { name: "to", type: "address" },
                    { name: "amount", type: "uint256" },
                  ],
                },
              ],
              functionName: "transfer",
              args: [merchantAddress, amount],
            }),
          },
        ],
      });
    },
    onSuccess: (data) => {
      toast.success("Payment transaction sent successfully!");
      console.log('Transaction hash:', data);
    },
    onError: (error) => {
      toast.error("Payment transaction failed");
      console.error('Transaction error:', error);
    },
  });

  // Get transaction receipt
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

  const isDisabled = !embeddedWallet || !kernelAccountClient;
  const canPay = merchantAddress && amount && !isPending && !isDisabled;

  const resetPayment = () => {
    setQrData(null);
    setAmount("");
    setMerchantAddress("");
    setManualMode(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* QR Scanner */}
      {!qrData && !manualMode && (
        <QRScannerComponent
          onScanResult={handleQRScanResult}
          isScanning={isScanning}
          onStartScan={() => setIsScanning(true)}
          onStopScan={() => setIsScanning(false)}
        />
      )}

      {/* Manual Entry Option */}
      {!qrData && !isScanning && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Can't scan QR code? Enter payment details manually
              </p>
              <Button
                variant="outline"
                onClick={() => setManualMode(true)}
                className="w-full"
              >
                Enter Payment Details Manually
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Details & Transaction */}
      {(qrData || manualMode) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Payment Details
              <Button
                variant="ghost"
                size="sm"
                onClick={resetPayment}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge className="h-9 text-sm font-medium">1. Mint ZDEV</Badge>
              <Input
                className="bg-background"
                type="text"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={!!qrData && !manualMode}
              />
            </div>

            <div className="flex items-center gap-2">
              <Badge className="h-9 text-sm font-medium">2. Pay Merchant</Badge>
              <Input
                className="bg-background"
                type="text"
                placeholder="Merchant Address"
                value={merchantAddress}
                onChange={(e) => setMerchantAddress(e.target.value)}
                disabled={!!qrData && !manualMode}
              />
            </div>

            {/* Address validation feedback */}
            {merchantAddress && !validateAddress(merchantAddress) && (
              <p className="text-destructive text-sm">Invalid merchant address format</p>
            )}

            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm">
                <strong>Current Balance:</strong> {formatUnits(balance?.value ?? BigInt(0), balance?.decimals ?? 18)} {balance?.symbol}
              </p>
              {qrData && (
                <p className="text-sm text-muted-foreground mt-1">
                  Payment from QR code
                </p>
              )}
            </div>

            <Button
              disabled={!canPay || isLoading}
              onClick={() => sendPaymentTransaction()}
              className="w-full"
            >
              {isPending ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                'Send Payment Transaction'
              )}
            </Button>

            {userOpReceipt && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-800 text-sm font-medium mb-2">
                  Payment Successful! ✅
                </p>
                <a
                  href={`${EXPLORER_URL}/tx/${userOpReceipt.receipt.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 text-sm underline underline-offset-4"
                >
                  View Transaction on Explorer
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QRPaymentBatch;