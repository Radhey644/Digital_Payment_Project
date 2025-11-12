import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Hash, QrCode, Send, ExternalLink } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
// @ts-ignore - JavaScript module without types
import { getTicketsByOwner, getTicketDetails } from '../web3/contract';
// @ts-ignore - JavaScript module without types
import { generateTicketQR } from '../utils/qrcode';

interface Ticket {
  tokenId: number;
  eventId: number;
  eventName: string;
  eventDate: string;
  venue: string;
  price: string;
  mintedAt: number;
  currentOwner: string;
  isValid: boolean;
  qrCode?: string;
}

const MyTicketsPage: React.FC = () => {
  const { account, isConnected } = useWallet();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTickets = async () => {
      if (!isConnected || !account) {
        setTickets([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const tokenIds = await getTicketsByOwner(account);
        const ticketDetails = await Promise.all(
          tokenIds.map(async (tokenId: number) => {
            const details = await getTicketDetails(tokenId);
            // Generate QR code
            const qrCode = await generateTicketQR({
              tokenId,
              ownerAddress: account,
              eventId: details.eventId,
              eventName: details.eventName,
            });
            return {
              tokenId,
              ...details,
              qrCode,
            };
          })
        );
        setTickets(ticketDetails);
      } catch (err: any) {
        console.error('Error loading tickets:', err);
        setError(err?.message || 'Failed to load tickets');
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, [isConnected, account]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (isValid: boolean) => {
    return isValid
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="text-slate-600">Loading tickets...</div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <QrCode className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Connect Your Wallet</h2>
        <p className="text-slate-600 mb-6">
          Please connect your wallet to view your NFT tickets.
        </p>
      </div>
    );
  }

  if (tickets.length === 0 && !loading) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <QrCode className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">No Tickets Yet</h2>
        <p className="text-slate-600 mb-6">
          You haven't purchased any tickets yet. Browse events to get your first NFT ticket.
        </p>
        <button className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200">
          Browse Events
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-slate-800">My Tickets</h1>
        <p className="text-lg text-slate-600">
          Manage your NFT tickets and verify your event access
        </p>
        <div className="flex items-center justify-center space-x-4 text-sm text-slate-500">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Active</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span>Used</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Transferred</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="text-2xl font-bold text-slate-800">
            {tickets.filter(t => t.isValid).length}
          </div>
          <div className="text-slate-600">Valid Tickets</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="text-2xl font-bold text-slate-800">
            {tickets.filter(t => !t.isValid).length}
          </div>
          <div className="text-slate-600">Invalid Tickets</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="text-2xl font-bold text-slate-800">
            {tickets.reduce((total, ticket) => total + Number(ticket.price), 0).toFixed(2)}
          </div>
          <div className="text-slate-600">Total MATIC Spent</div>
        </div>
      </div>

      {/* Tickets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tickets.map((ticket) => (
          <div
            key={ticket.tokenId}
            className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800 mb-2">
                    {ticket.eventName}
                  </h3>
                  <div className="space-y-1">
                    <div className="flex items-center text-slate-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="text-sm">{formatDate(ticket.eventDate)}</span>
                    </div>
                    <div className="flex items-center text-slate-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="text-sm">{ticket.venue}</span>
                    </div>
                    <div className="flex items-center text-slate-600">
                      <Hash className="w-4 h-4 mr-2" />
                      <span className="text-sm font-mono">#{ticket.tokenId}</span>
                    </div>
                  </div>
                </div>
                <div className="ml-4">
                  {ticket.qrCode && (
                    <img src={ticket.qrCode} alt="QR Code" className="w-24 h-24 rounded-lg border border-slate-200" />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(ticket.isValid)}`}>
                    {ticket.isValid ? 'Valid' : 'Invalid'}
                  </span>
                  <span className="text-slate-600 text-sm">
                    {ticket.price} MATIC
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  Minted: {new Date(ticket.mintedAt * 1000).toLocaleDateString()}
                </div>
              </div>

              <div className="flex space-x-3">
                <button 
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                    ticket.isValid
                      ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                  disabled={!ticket.isValid}
                >
                  <Send className="w-4 h-4" />
                  <span>Transfer</span>
                </button>
                <a
                  href={`https://mumbai.polygonscan.com/token/${import.meta.env.VITE_CONTRACT_ADDRESS}?a=${ticket.tokenId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all duration-200"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyTicketsPage;