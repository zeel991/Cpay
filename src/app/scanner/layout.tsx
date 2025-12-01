"use client";
import "@/app/globals.css";
import { AccountProviders } from "@/context/account-providers/provider-context";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ScannerProviderLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { provider } = useParams();
  const accountProvider = provider?.[0] as AccountProviders;
  const router = useRouter();

  useEffect(() => {
    // Your scanner-specific logic here
  }, [accountProvider, provider, router]);

  // Just return the children - Navigation, Footer, etc. are already in root layout
  return <>{children}</>;
}