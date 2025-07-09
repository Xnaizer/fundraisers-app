"use client";

import { ConnectButton } from "@xellar/kit";

export default function ConnectWalletButton() {
  // Fungsi untuk mempersingkat address
  const shortenAddress = (address: string | undefined) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <ConnectButton.Custom>
        {({ openConnectModal, isConnected, account, openProfileModal }) => {
          const commonClass =
            "backdrop-blur-sm hover:shadow-cyan-500/50 transition-shadow duration-300 cursor-pointer flex items-center justify-center gap-2 text-white border-2 border-cyan-500 bg-cyan-400 hover:bg-cyan-500 px-4 py-2 rounded-xl font-sm w-full sm:w-auto text-sm";

          return !isConnected ? (
            <button onClick={openConnectModal} className={commonClass}>
              Connect Wallet
            </button>
          ) : (
            <button onClick={openProfileModal} className={commonClass}>
              {shortenAddress(account?.address)}
            </button>
          );
        }}
      </ConnectButton.Custom>
    </div>
  );
}
