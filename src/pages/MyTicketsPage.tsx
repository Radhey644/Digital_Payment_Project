import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Hash, QrCode, Send, ExternalLink, Download, X, CheckCircle } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { ethers } from 'ethers';
// @ts-ignore - JavaScript module without types
import { getTicketsByOwner, getTicketDetails, transferTicket } from '../web3/contract';
// @ts-ignore - JavaScript module without types
import { generateTicketQR, downloadQRCode } from '../utils/qrcode';

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
  const { account, isConnected, chainId } = useWallet();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [transferModal, setTransferModal] = useState<{ open: boolean; ticket: Ticket | null }>({ open: false, ticket: null });
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [qrModal, setQrModal] = useState<{ open: boolean; ticket: Ticket | null }>({ open: false, ticket: null });

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

  const handleTransfer = async (ticket: Ticket) => {
    if (!recipientAddress || !ethers.isAddress(recipientAddress)) {
      alert('Please enter a valid Ethereum address');
      return;
    }

    setIsTransferring(true);
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      
      await transferTicket(signer, recipientAddress, ticket.tokenId);
      
      alert(`Successfully transferred Token #${ticket.tokenId} to ${recipientAddress}`);
      
      // Remove ticket from list
      setTickets(prev => prev.filter(t => t.tokenId !== ticket.tokenId));
      setTransferModal({ open: false, ticket: null });
      setRecipientAddress('');
    } catch (err: any) {
      console.error('Transfer failed:', err);
      alert(err?.message || 'Transfer failed');
    } finally {
      setIsTransferring(false);
    }
  };

  const handleDownloadQR = (ticket: Ticket) => {
    if (ticket.qrCode) {
      downloadQRCode(ticket.qrCode, `ticket-${ticket.tokenId}-qr.png`);
    }
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
        <h2 className="text-2xl font-bold text-slate-800 mb-2">No Tickets Found</h2>
        <p className="text-slate-600 mb-4">
          {(chainId !== 1337) ? 'Wrong network. Switch MetaMask to Localhost 8545 (Chain ID 1337) then reload.' : 'You have no tickets on this local chain. Try minting a free ticket from Events.'}
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
                  onClick={() => setTransferModal({ open: true, ticket })}
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
                <button
                  onClick={() => setQrModal({ open: true, ticket })}
                  className="flex items-center justify-center px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all duration-200"
                  title="View QR Code"
                >
                  <QrCode className="w-4 h-4" />
                </button>
                {/* {chainId !== 1337 && (
                  <a
                    href={`https://mumbai.polygonscan.com/token/${import.meta.env.VITE_CONTRACT_ADDRESS}?a=${ticket.tokenId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all duration-200"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )} */}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* QR Code Modal */}
      {qrModal.open && qrModal.ticket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setQrModal({ open: false, ticket: null })}>
          <div className="bg-white rounded-xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-800">Ticket QR Code</h3>
              <button onClick={() => setQrModal({ open: false, ticket: null })} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="text-center space-y-4">
              <div className="bg-slate-50 p-6 rounded-lg">
                {qrModal.ticket.qrCode && (
                  <img src={qrModal.ticket.qrCode} alt="Ticket QR Code" className="w-full max-w-xs mx-auto border-4 border-white shadow-lg" />
                )}
              </div>
              <div className="text-left space-y-2">
                <p className="text-sm font-semibold text-slate-700">{qrModal.ticket.eventName}</p>
                <p className="text-xs text-slate-600">Token ID: #{qrModal.ticket.tokenId}</p>
                <p className="text-xs text-slate-600">{formatDate(qrModal.ticket.eventDate)}</p>
                <p className="text-xs text-slate-600">Owner: {qrModal.ticket.currentOwner.slice(0, 10)}...</p>
              </div>
              
              {/* QR Data for Verification */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-left">
                <p className="text-xs font-semibold text-blue-700 mb-1">📋 Verification Code:</p>
                <div className="bg-white rounded p-2 font-mono text-xs break-all text-slate-700 max-h-24 overflow-y-auto">
                  {JSON.stringify({
                    tokenId: qrModal.ticket.tokenId,
                    owner: qrModal.ticket.currentOwner,
                    eventId: qrModal.ticket.eventId,
                    eventName: qrModal.ticket.eventName,
                    timestamp: Date.now(),
                    type: 'TICKET_NFT'
                  })}
                </div>
                <button
                  onClick={() => {
                    const data = JSON.stringify({
                      tokenId: qrModal.ticket!.tokenId,
                      owner: qrModal.ticket!.currentOwner,
                      eventId: qrModal.ticket!.eventId,
                      eventName: qrModal.ticket!.eventName,
                      timestamp: Date.now(),
                      type: 'TICKET_NFT'
                    });
                    navigator.clipboard.writeText(data);
                    alert('✅ Verification code copied!\nPaste it in Verify page to check authenticity.');
                  }}
                  className="mt-2 w-full text-xs bg-blue-100 text-blue-700 py-1.5 px-3 rounded hover:bg-blue-200 transition-colors font-semibold"
                >
                  📋 Copy Verification Code
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleDownloadQR(qrModal.ticket!)}
                  className="flex items-center justify-center space-x-2 bg-indigo-500 text-white py-3 px-4 rounded-lg hover:bg-indigo-600 transition-all duration-200"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm">Download</span>
                </button>
                <button
                  onClick={() => {
                    setQrModal({ open: false, ticket: null });
                    setTimeout(() => {
                      const verifyInput = document.getElementById('ticketId') as HTMLTextAreaElement;
                      if (verifyInput) {
                        verifyInput.value = qrModal.ticket!.tokenId.toString();
                        verifyInput.focus();
                      }
                    }, 100);
                  }}
                  className="flex items-center justify-center space-x-2 bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-all duration-200"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Verify</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {transferModal.open && transferModal.ticket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setTransferModal({ open: false, ticket: null })}>
          <div className="bg-white rounded-xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-800">Transfer Ticket</h3>
              <button onClick={() => setTransferModal({ open: false, ticket: null })} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm font-semibold text-slate-700">{transferModal.ticket.eventName}</p>
                <p className="text-xs text-slate-600 mt-1">Token ID: #{transferModal.ticket.tokenId}</p>
                <p className="text-xs text-slate-600">{formatDate(transferModal.ticket.eventDate)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Recipient Address</label>
                <input
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                />
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-xs text-amber-800">⚠️ This action cannot be undone. Make sure the recipient address is correct.</p>
              </div>
              <button
                onClick={() => handleTransfer(transferModal.ticket!)}
                disabled={isTransferring || !recipientAddress}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                  isTransferring || !recipientAddress
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-indigo-500 text-white hover:bg-indigo-600'
                }`}
              >
                {isTransferring ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Transferring...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Transfer Ticket</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTicketsPage;