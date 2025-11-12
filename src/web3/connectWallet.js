import { ethers } from 'ethers';

// Local development chain (Hardhat) config
const LOCAL_CHAIN_ID_DEC = 1337; // matches .env VITE_CHAIN_ID
const LOCAL_CHAIN_ID_HEX = '0x539'; // 1337 in hex
const LOCAL_RPC_URL = import.meta?.env?.VITE_MUMBAI_RPC_URL || 'http://127.0.0.1:8545';

// Check if MetaMask is installed
export const isMetaMaskInstalled = () => {
  return typeof window.ethereum !== 'undefined';
};

// Connect to MetaMask wallet
export const connectWallet = async () => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed. Please install MetaMask extension.');
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const balance = await provider.getBalance(address);
    
    // Get network info
    const network = await provider.getNetwork();
    
    return {
      address,
      balance: ethers.formatEther(balance),
      chainId: Number(network.chainId),
      provider,
      signer
    };
  } catch (error) {
    console.error('Error connecting to MetaMask:', error);
    throw error;
  }
};

// Disconnect wallet
export const disconnectWallet = () => {
  // Note: MetaMask doesn't have a programmatic disconnect
  // We just clear the local state
  return true;
};

// Get current account
export const getCurrentAccount = async () => {
  if (!isMetaMaskInstalled()) {
    return null;
  }

  try {
    // First check if there are any connected accounts
    const accounts = await window.ethereum.request({ 
      method: 'eth_accounts' 
    });
    
    if (accounts.length === 0) {
      return null;
    }
    
    return accounts[0];
  } catch (error) {
    console.error('Error getting current account:', error);
    return null;
  }
};

// Get account balance
export const getAccountBalance = async (address) => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Error getting balance:', error);
    throw error;
  }
};

// Switch to Polygon Mumbai network
// Switch to local Hardhat chain (1337). Falls back to legacy Mumbai switch if needed.
export const switchToLocalChain = async () => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }
  try {
    await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: LOCAL_CHAIN_ID_HEX }] });
    return true;
  } catch (switchError) {
    if (switchError.code === 4902) { // chain not added
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: LOCAL_CHAIN_ID_HEX,
              chainName: 'Hardhat Localhost',
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
              rpcUrls: [LOCAL_RPC_URL],
              blockExplorerUrls: [],
            },
          ],
        });
        return true;
      } catch (addErr) {
        console.error('Failed adding local chain:', addErr);
        throw addErr;
      }
    }
    console.error('Error switching to local chain:', switchError);
    throw switchError;
  }
};

// Listen for account changes
export const onAccountsChanged = (callback) => {
  if (!isMetaMaskInstalled()) {
    return;
  }

  window.ethereum.on('accountsChanged', (accounts) => {
    if (accounts.length === 0) {
      // User disconnected wallet
      callback(null);
    } else {
      callback(accounts[0]);
    }
  });
};

// Listen for network changes
export const onChainChanged = (callback) => {
  if (!isMetaMaskInstalled()) {
    return;
  }

  window.ethereum.on('chainChanged', (chainId) => {
    // Convert hex to decimal
    const decimalChainId = parseInt(chainId, 16);
    callback(decimalChainId);
  });
};

// Format address for display (0x1234...5678)
export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

// Check if connected to correct network
export const isCorrectNetwork = async () => {
  if (!isMetaMaskInstalled()) {
    return false;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    
    return chainId === LOCAL_CHAIN_ID_DEC;
  } catch (error) {
    console.error('Error checking network:', error);
    return false;
  }
};

// Add token to MetaMask
export const addTokenToWallet = async (tokenAddress, tokenSymbol, tokenDecimals, tokenImage) => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }

  try {
    const wasAdded = await window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: tokenAddress,
          symbol: tokenSymbol,
          decimals: tokenDecimals,
          image: tokenImage,
        },
      },
    });

    return wasAdded;
  } catch (error) {
    console.error('Error adding token to wallet:', error);
    throw error;
  }
};

// (no default export to simplify TypeScript named imports)
