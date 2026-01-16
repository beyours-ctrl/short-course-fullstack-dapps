'use client';

import { useState, useEffect } from 'react';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain,
} from 'wagmi';
import { injected } from 'wagmi/connectors';
import { avalancheFuji } from 'viem/chains';

const CONTRACT_ADDRESS = '0x996a5AB17817129795eF04A437482EfC696265c8';
const SIMPLE_STORAGE_ABI = [
  { inputs: [], name: 'getValue', outputs: [{ type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ name: '_value', type: 'uint256' }], name: 'setValue', outputs: [], stateMutability: 'nonpayable', type: 'function' },
];

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [inputValue, setInputValue] = useState('');
  
  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const { address, isConnected, chainId } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const { data: value, isLoading: isReading, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SIMPLE_STORAGE_ABI,
    functionName: 'getValue',
  });

  const { writeContract, data: hash, error: writeError, isPending: isWriting, reset } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isConfirmed) {
      setToast({ message: "Transaction Success! Value Updated.", type: 'success' });
      refetch();
      setInputValue('');
      reset();
    }
    if (writeError) {
      const msg = writeError.message.includes("User rejected") 
        ? "Transaction Rejected by User" 
        : "Transaction Failed / Reverted";
      setToast({ message: msg, type: 'error' });
      reset();
    }
  }, [isConfirmed, writeError, refetch, reset]);

  const handleSetValue = async () => {
    if (!inputValue) return;
    if (chainId !== avalancheFuji.id) {
      setToast({ message: "Switching to Avalanche Fuji...", type: 'info' });
      switchChain({ chainId: avalancheFuji.id });
      return;
    }

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: SIMPLE_STORAGE_ABI,
      functionName: 'setValue',
      args: [BigInt(inputValue)],
    });
  };

  if (!mounted) return null;

  const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white p-6 relative overflow-hidden">
      
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
          toast.type === 'success' ? 'bg-green-500 border-green-500/50 text-green-40' : 
          toast.type === 'error' ? 'bg-red-500 border-red-500/50 text-red-40' : 
          'bg-blue-500 border-blue-500/50 text-blue-40'
        }`}>
          <div className={`h-2 w-2 rounded-full ${toast.type === 'success' ? 'bg-green-700' : toast.type === 'error' ? 'bg-red-700' : 'bg-blue-700'}`} />
          <span className="text-sm font-bold tracking-tight">{toast.message}</span>
        </div>
      )}

      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-900/20 blur-[150px] rounded-full" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-purple-900/20 blur-[150px] rounded-full" />
      </div>

      <div className="w-full max-w-md bg-zinc-900/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative transition-all duration-500 hover:border-white/20">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-white via-white to-zinc-600 bg-clip-text text-transparent italic tracking-tighter uppercase">
              AvalancheDapps
            </h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Avalanche Fuji</span>
            </div>
          </div>
        </div>

        {/* Wallet Connection */}
        {!isConnected ? (
          <button
            onClick={() => connect({ connector: injected() })}
            disabled={isConnecting}
            className="w-full bg-white text-black h-14 rounded-2xl font-black tracking-tight hover:bg-zinc-200 transition-all active:scale-95 disabled:opacity-50"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        ) : (
          <div className="bg-black/40 border border-white/5 rounded-3xl p-4 flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 p-[2px]">
                <div className="h-full w-full bg-black rounded-full flex items-center justify-center text-[10px] font-bold tracking-tighter">
                  D
                </div>
              </div>
              <div>
                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider leading-none">Connected</p>
                <p className="text-sm font-mono font-bold text-white">{shortenAddress(address!)}</p>
              </div>
            </div>
            <button onClick={() => disconnect()} className="p-2 hover:bg-red-500/10 rounded-xl text-red-500 transition-all">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
        )}

        {/* Data Card */}
        <div className="bg-white/5 rounded-3xl p-6 mb-6 border border-white/5 relative overflow-hidden group">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">CURRENT VALUE</p>
          <div className="flex items-center gap-3">
             <span className="text-5xl font-black tracking-tighter text-white">
               {isReading ? "---" : value?.toString() || '0'}
             </span>
             <button onClick={() => refetch()} className="mt-2 text-zinc-500 hover:text-white transition-colors">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={isReading ? "animate-spin" : ""}><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
             </button>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div className="relative">
            <input
              type="number"
              placeholder="New Value"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isWriting || isConfirming}
              className="w-full bg-black/40 border-2 border-white/5 h-16 rounded-2xl px-6 text-xl font-bold focus:border-blue-500/50 outline-none transition-all placeholder:text-zinc-800"
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black bg-white/10 px-2 py-1 rounded text-zinc-400">UNIT</div>
          </div>

          <button
            onClick={handleSetValue}
            disabled={isWriting || isConfirming || !inputValue || !isConnected}
            className={`w-full h-16 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all active:scale-[0.98] ${
              (isWriting || isConfirming) 
                ? 'bg-zinc-800 text-zinc-600' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-[0_0_20px_rgba(37,99,235,0.2)] text-white'
            }`}
          >
            {isWriting ? 'Approve Wallet...' : isConfirming ? 'Confirming...' : 'Update Value'}
          </button>
        </div>

        {/* Footer */}
        <p className="text-[10px] text-center text-zinc-600 font-bold uppercase mt-8 tracking-widest leading-loose">
           Powered by <br /> Darris Daffa Muhammad <br /> 231011403321
        </p>

      </div>
    </main>
  );
}