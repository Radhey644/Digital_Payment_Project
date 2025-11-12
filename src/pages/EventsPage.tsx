import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Users, Ticket } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
// @ts-ignore - JavaScript module without types
import { fetchEvents, purchaseTicket, createTransaction } from '../utils/api';
// @ts-ignore - JS module without types
import { mintTicket } from '../web3/contract';
import { ethers } from 'ethers';

interface EventItem {
  eventId: number;
  name: string;
  date: string;
  time?: string;
  venue: string;
  price: string; // stored as string in backend
  image?: string;
  totalTickets: number;
  availableTickets: number;
  description?: string;
}

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [purchasingTicket, setPurchasingTicket] = useState<number | null>(null);
  const { isConnected, account } = useWallet();

  // Load events from backend
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchEvents({ active: true });
        setEvents(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load events');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleBuyTicket = async (eventItem: EventItem) => {
    if (!isConnected || !account) {
      alert('Please connect your wallet first!');
      return;
    }

    setPurchasingTicket(eventItem.eventId);
    try {
      // Get signer
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();

      // Prepare mint data
      // Allow free (zero-price) tickets; only reject NaN or negative prices
      const priceNum = Number(eventItem.price);
      if (Number.isNaN(priceNum) || priceNum < 0) {
        throw new Error('Invalid event price');
      }

      const result = await mintTicket(signer, {
        to: account,
        eventId: eventItem.eventId,
        eventName: eventItem.name,
        eventDate: eventItem.date,
        venue: eventItem.venue,
        price: priceNum,
        tokenURI: `https://ticketnft.example.com/metadata/${eventItem.eventId}`,
      });

      // Update backend availability
      await purchaseTicket(eventItem.eventId);

      // Record transaction
      await createTransaction({
        transactionHash: result.transactionHash,
        tokenId: result.tokenId ?? 0,
        eventId: eventItem.eventId,
        eventName: eventItem.name,
        type: 'MINT',
        from: account,
        to: account,
        price: String(eventItem.price),
        blockNumber: result.blockNumber,
        status: 'CONFIRMED',
      });

      // Optimistically update available tickets locally
      setEvents((prev) => prev.map((e) =>
        e.eventId === eventItem.eventId
          ? { ...e, availableTickets: Math.max(0, (e.availableTickets || 0) - 1) }
          : e
      ));

      alert('Ticket purchased successfully! Your NFT ticket has been minted.');
    } catch (err: any) {
      console.error(err);
      alert(err?.message || 'Failed to purchase ticket');
    } finally {
      setPurchasingTicket(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAvailabilityColor = (availableTickets: number, totalTickets: number) => {
    const percentage = ((totalTickets - availableTickets) / totalTickets) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-slate-800">Upcoming Events</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Discover amazing events and secure your spot with blockchain-powered NFT tickets
        </p>
      </div>

      {/* Loading & Error */}
      {loading && (
        <div className="text-center text-slate-600">Loading events...</div>
      )}
      {error && (
        <div className="text-center text-red-600">{error}</div>
      )}

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div
            key={event.eventId}
            className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
          >
            {/* Event Image */}
            <div className="relative overflow-hidden">
              <img
                src={event.image || 'https://via.placeholder.com/400x300?text=Event'}
                alt={event.name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-4 right-4">
                <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-sm font-semibold text-slate-800">
                  {Number(event.price) === 0 ? 'FREE' : `${Number(event.price)} MATIC`}
                </span>
              </div>
            </div>

            {/* Event Details */}
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{event.name}</h3>
                {event.description && (
                  <p className="text-slate-600 text-sm">{event.description}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-slate-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="text-sm">{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center text-slate-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="text-sm">{event.venue}</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-slate-600" />
                  <span className={`text-sm font-medium ${getAvailabilityColor(event.availableTickets, event.totalTickets)}`}>
                    {event.availableTickets} tickets left
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((event.totalTickets - event.availableTickets) / event.totalTickets) * 100}%`
                  }}
                ></div>
              </div>

              {/* Buy Button */}
              <button
                onClick={() => handleBuyTicket(event)}
                disabled={purchasingTicket === event.eventId || event.availableTickets <= 0}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2 ${
                  event.availableTickets <= 0
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : purchasingTicket === event.eventId
                    ? 'bg-indigo-400 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 hover:shadow-lg'
                }`}
              >
                {purchasingTicket === event.eventId ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Minting NFT...</span>
                  </>
                ) : event.availableTickets <= 0 ? (
                  <span>Sold Out</span>
                ) : (
                  <>
                    <Ticket className="w-4 h-4" />
                    <span>{Number(event.price) === 0 ? 'Get Free Ticket' : 'Buy Ticket'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {!isConnected && (
        <div className="text-center py-8">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 max-w-md mx-auto">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-amber-800 mb-2">Connect Your Wallet</h3>
            <p className="text-amber-700 text-sm">
              Connect your MetaMask wallet to purchase NFT tickets and manage your collection.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsPage;