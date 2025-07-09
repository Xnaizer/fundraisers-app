"use client";

import React from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { XellarKitProvider, defaultConfig, darkTheme } from "@xellar/kit";
import { liskSepolia } from "viem/chains";

const config = defaultConfig({
  appName: "Xellar",
  walletConnectProjectId: "f379d061a49ed024f4083d1a766e4b0a",
  xellarAppId: "c9edbbd4-bc16-463e-adcc-792a61a443da",
  xellarEnv: "sandbox",
  chains: [liskSepolia],
});

const queryClient = new QueryClient();

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <XellarKitProvider theme={darkTheme}>{children}</XellarKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
