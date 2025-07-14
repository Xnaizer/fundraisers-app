// global.d.ts

interface EthereumProvider {
  // Basic request method
  request: (args: {
    method: string;
    params?: unknown[] | Record<string, unknown>;
  }) => Promise<unknown>;

  // Event handling
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
  removeAllListeners?: (event?: string) => void;

  // Provider properties
  isMetaMask?: boolean;
  isConnected?: () => boolean;
  chainId?: string;
  networkVersion?: string;
  selectedAddress?: string | null;

  // Connection methods
  enable?: () => Promise<string[]>;
  send?: (method: string, params?: unknown[]) => Promise<unknown>;
  sendAsync?: (
    request: { method: string; params?: unknown[] },
    callback: (error: Error | null, result?: unknown) => void
  ) => void;

  // Additional MetaMask specific methods
  _metamask?: {
    isUnlocked: () => Promise<boolean>;
  };
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}