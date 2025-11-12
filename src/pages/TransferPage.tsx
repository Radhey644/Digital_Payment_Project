import React, { useEffect, useState } from 'react';
import { Send, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
// @ts-ignore - JavaScript module without types
import { getTicketsByOwner, getTicketDetails, transferTicket } from '../web3/contract';
// @ts-ignore - JavaScript module without types
import { createTransaction } from '../utils/api';
import { ethers } from 'ethers';

interface Ticket {
  tokenId: number;
  eventId: number;
  eventName: string;
  eventDate: string;
  venue: string;
  isValid: boolean;
}

const TransferPage: React.FC = () => {
  const { account, isConnected } = useWallet();
  const [availableTickets, setAvailableTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState(false);

  // Load user tickets
  useEffect(() => {
    const loadTickets = async () => {
      if (!isConnected || !account) {
        setAvailableTickets([]);
        return;
      }

      setLoading(true);
      try {
        const tokenIds = await getTicketsByOwner(account);
        const ticketDetails = await Promise.all(
          tokenIds.map(async (tokenId: number) => {
            const details = await getTicketDetails(tokenId);
            return {
              tokenId,
              eventId: details.eventId,
              eventName: details.eventName,
              eventDate: details.eventDate,
              venue: details.venue,
              isValid: details.isValid,
            };
          })
        );
        // Only show valid tickets
        setAvailableTickets(ticketDetails.filter((t: Ticket) => t.isValid));
      } catch (err: any) {
        console.error('Error loading tickets:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, [isConnected, account]);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTicket || !recipientAddress || !account) {
      alert('Please select a ticket and enter a recipient address.');
      return;
    }

    setIsTransferring(true);
    try {
      // Get signer
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();

      // Transfer on blockchain
      const result = await transferTicket(signer, recipientAddress, selectedTicket);

      // Get ticket details for event name
      const details = await getTicketDetails(selectedTicket);

      // Record transaction in backend
      await createTransaction({
        transactionHash: result.transactionHash,
        tokenId: selectedTicket,
        eventId: details.eventId,
        eventName: details.eventName,
        type: 'TRANSFER',
        from: account,
        to: recipientAddress.toLowerCase(),
        price: details.price,
        blockNumber: result.blockNumber,
        status: 'CONFIRMED',
      });

      // Remove transferred ticket from list
      setAvailableTickets((prev) => prev.filter((t) => t.tokenId !== selectedTicket));

      setTransferSuccess(true);
      
      // Reset form after a delay
      setTimeout(() => {
        setTransferSuccess(false);
        setSelectedTicket(null);
        setRecipientAddress('');
      }, 3000);
    } catch (err: any) {
      console.error(err);
      alert(err?.message || 'Failed to transfer ticket');
    } finally {
      setIsTransferring(false);
    }
  };

  const isValidAddress = (address: string) => {
    return address.length === 42 && address.startsWith('0x');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Connect Your Wallet</h2>
          <p className="text-slate-600 mb-6">
            Please connect your wallet to transfer NFT tickets.
          </p>
        </div>
      </div>
    );
  }

  if (availableTickets.length === 0 && !loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">No Transferable Tickets</h2>
          <p className="text-slate-600 mb-6">
            You don't have any valid tickets that can be transferred.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-slate-800">Transfer Ticket</h1>
        <p className="text-lg text-slate-600">
          Transfer your NFT tickets to another wallet address securely
        </p>
      </div>

      {transferSuccess ? (
        /* Success State */
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Transfer Successful!</h2>
          <p className="text-green-700">
            Your NFT ticket has been successfully transferred to the recipient's wallet.
          </p>
        </div>
      ) : (
        /* Transfer Form */
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <form onSubmit={handleTransfer} className="space-y-6">
            {/* Ticket Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Select Ticket to Transfer
              </label>
              <div className="space-y-3">
                {availableTickets.map((ticket) => (
                  <label
                    key={ticket.tokenId}
                    className={`block p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedTicket === ticket.tokenId
                        ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                        : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="ticket"
                      value={ticket.tokenId}
                      checked={selectedTicket === ticket.tokenId}
                      onChange={(e) => setSelectedTicket(Number(e.target.value))}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-800">
                          {ticket.eventName}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {formatDate(ticket.eventDate)} • {ticket.venue}
                        </p>
                        <p className="text-xs text-slate-500 font-mono mt-1">
                          Token ID: #{ticket.tokenId}
                        </p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedTicket === ticket.tokenId
                          ? 'border-indigo-500 bg-indigo-500'
                          : 'border-slate-300'
                      }`}>
                        {selectedTicket === ticket.tokenId && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Recipient Address */}
            <div>
              <label htmlFor="recipient" className="block text-sm font-semibold text-slate-700 mb-2">
                Recipient Wallet Address
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="recipient"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="0x742d35Cc6635C0532925a3b8D698764Cf7815845"
                  className={`w-full px-4 py-3 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 transition-all duration-200 ${
                    recipientAddress
                      ? isValidAddress(recipientAddress)
                        ? 'border-green-300 focus:ring-green-200 bg-green-50'
                        : 'border-red-300 focus:ring-red-200 bg-red-50'
                      : 'border-slate-300 focus:ring-indigo-200'
                  }`}
                />
                {recipientAddress && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {isValidAddress(recipientAddress) ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {recipientAddress && !isValidAddress(recipientAddress) && (
                <p className="mt-2 text-sm text-red-600">
                  Please enter a valid Ethereum address (42 characters starting with 0x)
                </p>
              )}
            </div>

            {/* Transfer Summary */}
            {selectedTicket && recipientAddress && isValidAddress(recipientAddress) && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Transfer Summary</h3>
                <div className="flex items-center space-x-4 text-sm text-slate-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span>From: Your Wallet</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>To: {recipientAddress.slice(0, 6)}...{recipientAddress.slice(-4)}</span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  Gas fees will be calculated automatically during the transfer.
                </div>
              </div>
            )}

            {/* Transfer Button */}
            <button
              type="submit"
              disabled={!selectedTicket || !isValidAddress(recipientAddress) || isTransferring}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2 ${
                !selectedTicket || !isValidAddress(recipientAddress) || isTransferring
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 hover:shadow-lg'
              }`}
            >
              {isTransferring ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Transferring NFT...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Transfer Ticket</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Important Notes */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <h3 className="font-semibold text-amber-800 mb-2">⚠️ Important Notes</h3>
        <ul className="text-sm text-amber-700 space-y-1">
          <li>• Once transferred, you will no longer have access to this ticket</li>
          <li>• The recipient must have a compatible Web3 wallet to receive the NFT</li>
          <li>• This action cannot be undone without the recipient's cooperation</li>
          <li>• Gas fees will be required to complete the transfer</li>
        </ul>
      </div>
    </div>
  );
};

export default TransferPage;