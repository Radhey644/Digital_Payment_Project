// Type definitions for web3/connectWallet.js

export function isMetaMaskInstalled(): boolean;

export interface WalletData {
  address: string;
  balance: string;
  chainId: number;
  provider: any;
  signer: any;
}

export function connectWallet(): Promise<WalletData>;
export function disconnectWallet(): boolean;
export function getCurrentAccount(): Promise<string | null>;
export function getAccountBalance(address: string): Promise<string>;
export function switchToMumbai(): Promise<boolean>;
export function onAccountsChanged(callback: (account: string | null) => void): void;
export function onChainChanged(callback: (chainId: number) => void): void;
export function formatAddress(address: string): string;
export function isCorrectNetwork(): Promise<boolean>;
export function addTokenToWallet(
  tokenAddress: string,
  tokenSymbol: string,
  tokenDecimals: number,
  tokenImage?: string
): Promise<boolean>;

declare const _default: {
  isMetaMaskInstalled: typeof isMetaMaskInstalled;
  connectWallet: typeof connectWallet;
  disconnectWallet: typeof disconnectWallet;
  getCurrentAccount: typeof getCurrentAccount;
  getAccountBalance: typeof getAccountBalance;
  switchToMumbai: typeof switchToMumbai;
  onAccountsChanged: typeof onAccountsChanged;
  onChainChanged: typeof onChainChanged;
  formatAddress: typeof formatAddress;
  isCorrectNetwork: typeof isCorrectNetwork;
  addTokenToWallet: typeof addTokenToWallet;
};

export default _default;
