"use client";
import "@/app/globals.css";
import { accountProviders, AccountProviders } from "@/context/account-providers/provider-context";
import { ReactQueryProvider } from "@/context/react-query";
import AccountProviderWrapper from "@/context/wrapper";
import { useParams, useRouter } from "next/navigation";
import { Toaster } from "sonner";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
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
    // Redirect to /privy if no provider is specified
    if (!provider || provider.length === 0) {
      router.replace('/privy');
      return;
    }
    
    // Redirect to home if invalid provider
    if (accountProvider && !accountProviders.includes(accountProvider)) {
      router.replace('/privy');
    }
  }, [accountProvider, provider, router]);

  return (
    <ReactQueryProvider>
      <AccountProviderWrapper initialProvider={accountProvider || 'privy'}>
        <Navigation />
        <div className="border-primary container mx-auto max-w-5xl space-y-12 overflow-hidden border-x-2 py-6">
          <main className="space-y-12">
            {children}
          </main>
        </div>
        <Footer />
        <Toaster richColors />
      </AccountProviderWrapper>
    </ReactQueryProvider>
  );
}
