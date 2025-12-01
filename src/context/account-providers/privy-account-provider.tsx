import {
  baseSepoliaBundlerRpc,
  baseSepoliaPaymasterRpc,
  entryPoint,
  kernelAddresses,
  kernelVersion,
} from "@/lib/constants";
import { useCreateWallet, useLogin, usePrivy, useSign7702Authorization, useWallets } from "@privy-io/react-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { createKernelAccount, createKernelAccountClient, createZeroDevPaymasterClient } from "@zerodev/sdk";
import React, { useEffect, useMemo } from "react";
import { createWalletClient, custom, Hex, http } from "viem";
import { baseSepolia, sepolia , avalancheFuji, avalanche } from "viem/chains";
import { usePublicClient } from "wagmi";
import { AccountProviderContext, EmbeddedWallet } from "./provider-context";
/**
 * Constants for the Privy account provider
 */
const PROVIDER = "privy";

/**
 * PrivyAccountProvider is a React component that manages authentication and wallet functionality
 * using Privy's authentication system. It handles wallet creation, kernel account setup,
 * and provides authentication UI components.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to be wrapped
 * @returns {JSX.Element} The provider component with authentication functionality
 */
const PrivyAccountProvider = ({ children }: { children: React.ReactNode }) => {
  const { wallets } = useWallets();
  const { user } = usePrivy();
  const { createWallet } = useCreateWallet();
  const { signAuthorization } = useSign7702Authorization();

  const { login } = useLogin();

  const privyEmbeddedWallet = useMemo(() => {
    return wallets.find((wallet) => wallet.walletClientType === "privy");
  }, [wallets]);

  /**
   * Creates a wallet client using the embedded wallet's ethereum provider
   * The configured wallet client or null if not available
   */
  const { data: privyAccount } = useQuery({
    queryKey: [PROVIDER, "walletClient", privyEmbeddedWallet?.address],
    queryFn: async () => {
      if (!privyEmbeddedWallet) {
        return null;
      }
      const walletClient = createWalletClient({
        account: privyEmbeddedWallet.address as Hex,
        chain: baseSepolia,
        transport: custom(await privyEmbeddedWallet.getEthereumProvider()),
      });
      return walletClient;
    },
    enabled: !!privyEmbeddedWallet,
  });

  /**
   * Creates a public client for blockchain interactions
   * The configured public client or null if wallet client is not available
   */
  const sepoliaPublicClient = usePublicClient({
    chainId: sepolia.id,
  });
  const baseSepoliaPublicClient = usePublicClient({
    chainId: baseSepolia.id,
  });
  /**
   * Creates a paymaster client for handling gas payments
   * The configured paymaster client or null if public client is not available
   */
  const baseSepoliaPaymasterClient = useMemo(() => {
    if (!baseSepoliaPublicClient) return null;
    return createZeroDevPaymasterClient({
      chain: baseSepolia,
      transport: http(baseSepoliaPaymasterRpc),
    });
  }, [baseSepoliaPublicClient]);

  /**
   * Creates an ECDSA validator for the kernel account
   * The configured validator or null if prerequisites are not met
   */
  const { data: kernelClients } = useQuery({
    queryKey: [
      PROVIDER,
      "kernelClient",
      privyAccount?.account.address,
      baseSepoliaPaymasterClient?.name,
      sepoliaPublicClient?.name,
    ],
    queryFn: async () => {
      if (!privyAccount || !baseSepoliaPublicClient || !baseSepoliaPaymasterClient) return null;

      const ecdsaValidator = await signerToEcdsaValidator(baseSepoliaPublicClient, {
        signer: privyAccount,
        entryPoint,
        kernelVersion,
      });

      const authorization = await signAuthorization({
        contractAddress: kernelAddresses.accountImplementationAddress,
        chainId: baseSepolia.id,
      });

      const kernelAccount = await createKernelAccount(baseSepoliaPublicClient, {
        eip7702Account: privyAccount,
        entryPoint,
        kernelVersion,
        eip7702Auth: authorization,
      });

      const kernelAccountClient = createKernelAccountClient({
        account: kernelAccount,
        chain: baseSepolia,
        bundlerTransport: http(baseSepoliaBundlerRpc),
        paymaster: baseSepoliaPaymasterClient,
        client: baseSepoliaPublicClient,
      });

      return { kernelAccountClient, kernelAccount, ecdsaValidator };
    },
    enabled: !!baseSepoliaPublicClient && !!privyAccount && !!baseSepoliaPaymasterClient,
  });

  /**
   * Handles the sign-in process by opening the Privy sign-in modal
   */
  const signIn = async () => {
    // setOpenPrivySignInModal(true);
    login();
  };

  /**
   * Mutation hook for creating a new embedded wallet
   * The mutation object with createEmbeddedWallet function
   */
  const { mutate: createEmbeddedWallet } = useMutation({
    mutationFn: async () => {
      const newEmbeddedWallet = await createWallet();
      return newEmbeddedWallet;
    },
  });

  useEffect(() => {
    if (user) {
      if (!privyEmbeddedWallet) {
        createEmbeddedWallet();
      }
    }
  }, [user, privyEmbeddedWallet, createEmbeddedWallet]);

  const { data: embeddedWallet } = useQuery<EmbeddedWallet | null>({
    queryKey: [PROVIDER, "embeddedWallet", privyEmbeddedWallet?.address, user],
    queryFn: async () => {
      if (!user) return null;
      if (!privyEmbeddedWallet) return null;

      return {
        provider: "privy",
        address: privyEmbeddedWallet.address as `0x${string}`,
        user: user.email?.address ?? user.id,
      };
    },
    enabled: !!privyEmbeddedWallet && !!user,
  });

  const { data: isDeployed } = useQuery({
    queryKey: [PROVIDER, "isDeployed", kernelClients?.kernelAccount.address],
    queryFn: async () => {
      if (!kernelClients) return false;
      return kernelClients.kernelAccount.isDeployed();
    },
    enabled: !!kernelClients?.kernelAccount,
    refetchInterval: ({ state }) => (state.data ? false : 2000),
  });

  return (
    <AccountProviderContext.Provider
      value={{
        provider: "privy",
        login: signIn,
        embeddedWallet,
        isDeployed: Boolean(isDeployed),
        kernelAccountClient: kernelClients?.kernelAccountClient,
        ecdsaValidator: kernelClients?.ecdsaValidator,
        intentClient: undefined,
        createIntentClient: async () => {
          throw new Error("Not implemented");
        },
        signer: privyAccount,
      }}
    >
      {children}
    </AccountProviderContext.Provider>
  );
};

export default PrivyAccountProvider;
