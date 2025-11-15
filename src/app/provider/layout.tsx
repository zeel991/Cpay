"use client";
import "@/app/globals.css";
import { accountProviders, AccountProviders } from "@/context/account-providers/provider-context";
import { useParams, useRouter } from "next/navigation";
import "@turnkey/sdk-react/styles";
import { useEffect } from "react";

export default function ProviderLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { provider } = useParams();
  const accountProvider = provider?.[0] as AccountProviders;
  const router = useRouter();

  useEffect(() => {
    if (accountProvider && !accountProviders.includes(accountProvider)) {
      router.push("/");
    }
  }, [accountProvider, router]);

  return <>{children}</>;
}
