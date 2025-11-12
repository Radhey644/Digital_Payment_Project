import React from 'react';
import { Wallet, Calendar, Ticket, QrCode, ArrowLeftRight, ChevronDown } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import type { Page } from '../App';

interface HeaderProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({
  currentPage,
  setCurrentPage,
}) => {
  const { account, balance, isConnected, isLoading, error, connect, disconnect } = useWallet();
  const navigationItems = [
    { id: 'events' as Page, label: 'Events', icon: Calendar },
    { id: 'my-tickets' as Page, label: 'My Tickets', icon: Ticket },
    { id: 'transfer' as Page, label: 'Transfer', icon: ArrowLeftRight },
    { id: 'verify' as Page, label: 'Verify', icon: QrCode },
  ];

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Ticket className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">TicketNFT</h1>
              <p className="text-xs text-slate-500">Polygon Mumbai</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentPage === item.id
                      ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <select
              value={currentPage}
              onChange={(e) => setCurrentPage(e.target.value as Page)}
              className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {navigationItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* Wallet Connection */}
          <div className="flex flex-col items-end">
            {isConnected && account ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-sm">
                  <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                  <span>{formatAddress(account)}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="px-4 py-2 border-b border-slate-200">
                    <p className="text-xs text-slate-500">Connected Wallet</p>
                    <p className="text-sm font-medium text-slate-800">{formatAddress(account)}</p>
                    {balance && (
                      <p className="text-xs text-slate-600 mt-1">{parseFloat(balance).toFixed(4)} MATIC</p>
                    )}
                  </div>
                  {error && (
                    <div className="px-4 py-2 border-b border-slate-200">
                      <p className="text-xs text-red-600">{error}</p>
                    </div>
                  )}
                  <button
                    onClick={disconnect}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <button
                  onClick={() => {
                    console.log('Connect button clicked in Header');
                    connect();
                  }}
                  disabled={isLoading}
                  className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Wallet className="w-4 h-4" />
                  <span>{isLoading ? 'Connecting...' : 'Connect Wallet'}</span>
                </button>
                {error && !isLoading && (
                  <p className="text-xs text-red-600 mt-1 max-w-xs">{error}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;