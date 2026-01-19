"use client";

import { useEffect, useState } from "react";
import { getBlockchainValue } from "../services/blockchain.service";

export default function BlockchainValue() {
  const [value, setValue] = useState<any>(null);

  useEffect(() => {
    getBlockchainValue().then(setValue).catch(console.error);
  }, []);

  return <pre>{JSON.stringify(value, null, 2)}</pre>;
}