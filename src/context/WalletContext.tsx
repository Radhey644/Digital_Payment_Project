import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// @ts-ignore - JavaScript module without types
import * as walletHelpers from '../web3/connectWallet';
const {
  connectWallet,
  disconnectWallet,
  getCurrentAccount,
  getAccountBalance,
  onAccountsChanged,
  onChainChanged,
  isMetaMaskInstalled,
  isCorrectNetwork,
} = walletHelpers;

interface WalletContextType {
  account: string | null;
  balance: string | null;
  chainId: number | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider = ({ children }: WalletProviderProps) => {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConnected = !!account;

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (!isMetaMaskInstalled()) {
        console.log('MetaMask not installed');
        return;
      }

      try {
        const currentAccount = await getCurrentAccount();
        console.log('Current account on mount:', currentAccount);
        
        if (currentAccount) {
          const walletBalance = await getAccountBalance(currentAccount);
          const correctNetwork = await isCorrectNetwork();
          
          setAccount(currentAccount);
          setBalance(walletBalance);
          
          if (!correctNetwork) {
            setError('Switching to local Hardhat network...');
            try {
              await (walletHelpers as any).switchToLocalChain();
              setError(null);
            } catch (e:any) {
              setError('Please switch to Hardhat localhost network (Chain ID 1337) in MetaMask');
            }
          } else {
            setError(null);
          }
        }
      } catch (err) {
        console.error('Error checking connection:', err);
      }
    };

    checkConnection();

    // Setup event listeners
      onAccountsChanged((newAccount: string | null) => {
      if (newAccount) {
        setAccount(newAccount);
        getAccountBalance(newAccount).then(setBalance);
        setError(null);
      } else {
        setAccount(null);
        setBalance(null);
      }
    });

      onChainChanged((newChainId: number) => {
      setChainId(newChainId);
      if (newChainId !== 1337) {
        setError('Wrong network. Expected Hardhat localhost (1337)');
      } else {
        setError(null);
      }
    });
  }, []);

  const connect = async () => {
    console.log('Connect wallet clicked');
    setIsLoading(true);
    setError(null);

    try {
      if (!isMetaMaskInstalled()) {
        const errorMsg = 'MetaMask is not installed. Please install MetaMask extension from https://metamask.io';
        setError(errorMsg);
        alert(errorMsg);
        throw new Error(errorMsg);
      }

      console.log('Requesting wallet connection...');
      const walletData = await connectWallet();
      console.log('Wallet connected:', walletData.address);
      
      setAccount(walletData.address);
      setBalance(walletData.balance);
      setChainId(walletData.chainId);

      // Check if correct network
      if (walletData.chainId !== 1337) {
        console.log('Wrong network detected, attempting switch to local Hardhat...');
        setError('Switching to local Hardhat network (1337)...');
        try {
          await (walletHelpers as any).switchToLocalChain();
          setError(null);
          console.log('Successfully switched to local Hardhat');
        } catch (switchErr: any) {
          console.error('Failed to switch network:', switchErr);
          setError('Please manually add/select Hardhat localhost (RPC http://127.0.0.1:8545, Chain ID 1337)');
        }
      } else {
        console.log('Already on local Hardhat network');
      }
    } catch (err: any) {
      console.error('Connection error:', err);
      const errorMessage = err.message || 'Failed to connect wallet';
      setError(errorMessage);
      setAccount(null);
      setBalance(null);
      
      // Show user-friendly error
      if (err.code === 4001) {
        alert('Connection rejected. Please try again and approve the connection in MetaMask.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    disconnectWallet();
    setAccount(null);
    setBalance(null);
    setChainId(null);
    setError(null);
  };

  const switchNetwork = async () => {
    setError(null);
    try {
  await (walletHelpers as any).switchToLocalChain();
      setError(null);
    } catch (err: any) {
      console.error('Network switch error:', err);
      setError(err.message || 'Failed to switch network');
    }
  };

  const value: WalletContextType = {
    account,
    balance,
    chainId,
    isConnected,
    isLoading,
    error,
    connect,
    disconnect,
    switchNetwork,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};
