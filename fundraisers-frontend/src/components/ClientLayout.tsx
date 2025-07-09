"use client";

import React from "react";
import { Web3Provider } from "./Provider"; // Web3Provider pakai use client juga
import MouseMove from "./MouseMove";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <Web3Provider>
      <MouseMove />
      {children}
    </Web3Provider>
  );
}