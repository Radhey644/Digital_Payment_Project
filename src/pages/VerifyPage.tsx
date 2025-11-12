import React, { useState } from 'react';
import { QrCode, Search, CheckCircle, XCircle, Camera } from 'lucide-react';
// @ts-ignore - JavaScript module without types
import { getTicketDetails, verifyTicket } from '../web3/contract';
// @ts-ignore - JavaScript module without types
import { parseTicketQR } from '../utils/qrcode';

interface VerificationResult {
  isValid: boolean;
  ticketInfo?: {
    tokenId: number;
    eventName: string;
    eventDate: string;
    venue: string;
    ownerAddress: string;
    price: string;
    isTicketValid: boolean;
  };
  message: string;
}

const VerifyPage: React.FC = () => {
  const [ticketId, setTicketId] = useState('');
  const [ownerAddress, setOwnerAddress] = useState('');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ticketId.trim()) {
      return;
    }

    setIsVerifying(true);
    
    try {
      let tokenId: number;
      let owner: string | null = null;

      // Try to parse as QR code JSON first
      try {
        const qrData = parseTicketQR(ticketId);
        tokenId = Number(qrData.tokenId);
        owner = qrData.ownerAddress;
      } catch {
        // Otherwise treat as a token ID
        tokenId = Number(ticketId);
        if (Number.isNaN(tokenId)) {
          throw new Error('Invalid token ID');
        }
      }

      // Get ticket details from blockchain
      const details = await getTicketDetails(tokenId);

      // If we have an owner from QR, verify against it
      let isTicketValid = details.isValid;
      if (owner) {
        const verificationResult = await verifyTicket(tokenId, owner);
        isTicketValid = isTicketValid && verificationResult;
      }

      setVerificationResult({
        isValid: true,
        ticketInfo: {
          tokenId,
          eventName: details.eventName,
          eventDate: details.eventDate,
          venue: details.venue,
          ownerAddress: details.currentOwner,
          price: details.price,
          isTicketValid,
        },
        message: isTicketValid
          ? 'Valid ticket! Ready for event entry.'
          : 'This ticket has been invalidated or is not authentic.',
      });
    } catch (error: any) {
      console.error('Verification error:', error);
      setVerificationResult({
        isValid: false,
        message: error?.message || 'Invalid ticket. This ticket ID was not found in our system.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const resetVerification = () => {
    setVerificationResult(null);
    setTicketId('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-slate-800">Verify Ticket</h1>
        <p className="text-lg text-slate-600">
          Verify NFT tickets using Token ID or QR code for event entry
        </p>
      </div>

      {!verificationResult ? (
        /* Verification Form */
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <form onSubmit={handleVerify} className="space-y-6">
            {/* Input Methods */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 rounded-lg p-4 text-center">
                <QrCode className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <h3 className="font-semibold text-slate-800">QR Code</h3>
                <p className="text-sm text-slate-600">Scan ticket QR code</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 text-center">
                <Search className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <h3 className="font-semibold text-slate-800">Token ID</h3>
                <p className="text-sm text-slate-600">Enter token manually</p>
              </div>
            </div>

            {/* QR Scanner Mockup */}
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
              <Camera className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 mb-2">QR Code Scanner</h3>
              <p className="text-slate-500 text-sm mb-4">
                In a real implementation, this would activate your device's camera to scan QR codes
              </p>
              <button
                type="button"
                className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors duration-200"
              >
                Activate Camera
              </button>
            </div>

            <div className="text-center">
              <div className="text-slate-400 text-sm font-medium">OR</div>
            </div>

            {/* Manual Input */}
            <div>
              <label htmlFor="ticketId" className="block text-sm font-semibold text-slate-700 mb-2">
                Enter Token ID or QR Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="ticketId"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  placeholder="0x1a2b3c... or QR_CODE_1"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all duration-200"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <Search className="w-5 h-5 text-slate-400" />
                </div>
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Enter a token ID (e.g., "1", "2", "3") or paste QR code JSON data
              </div>
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={!ticketId.trim() || isVerifying}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2 ${
                !ticketId.trim() || isVerifying
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 hover:shadow-lg'
              }`}
            >
              {isVerifying ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <QrCode className="w-5 h-5" />
                  <span>Verify Ticket</span>
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        /* Verification Result */
        <div className={`rounded-xl p-8 text-center border-2 ${
          verificationResult.isValid 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            verificationResult.isValid 
              ? 'bg-green-100' 
              : 'bg-red-100'
          }`}>
            {verificationResult.isValid ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : (
              <XCircle className="w-8 h-8 text-red-600" />
            )}
          </div>

          <h2 className={`text-2xl font-bold mb-2 ${
            verificationResult.isValid ? 'text-green-800' : 'text-red-800'
          }`}>
            {verificationResult.isValid ? '✅ Valid Ticket' : '❌ Invalid Ticket'}
          </h2>

          <p className={`mb-6 ${
            verificationResult.isValid ? 'text-green-700' : 'text-red-700'
          }`}>
            {verificationResult.message}
          </p>

          {verificationResult.isValid && verificationResult.ticketInfo && (
            <div className="bg-white rounded-lg p-6 mb-6 text-left">
              <h3 className="font-semibold text-slate-800 mb-4">Ticket Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Event:</span>
                  <span className="font-medium text-slate-800">
                    {verificationResult.ticketInfo.eventName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Date:</span>
                  <span className="font-medium text-slate-800">
                    {formatDate(verificationResult.ticketInfo.eventDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Venue:</span>
                  <span className="font-medium text-slate-800">
                    {verificationResult.ticketInfo.venue}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Token ID:</span>
                  <span className="font-mono text-sm text-slate-800">
                    {verificationResult.ticketInfo.tokenId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Owner:</span>
                  <span className="font-mono text-sm text-slate-800">
                    {formatAddress(verificationResult.ticketInfo.ownerAddress)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Valid:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    verificationResult.ticketInfo.isTicketValid
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {verificationResult.ticketInfo.isTicketValid ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Price:</span>
                  <span className="font-medium text-slate-800">
                    {verificationResult.ticketInfo.price} MATIC
                  </span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={resetVerification}
            className="bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-700 transition-all duration-200"
          >
            Verify Another Ticket
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
        <h3 className="font-semibold text-slate-800 mb-3">🔍 How to Verify</h3>
        <ul className="text-sm text-slate-600 space-y-2">
          <li>• Use the QR scanner to scan a ticket's QR code directly</li>
          <li>• Alternatively, enter the Token ID manually if available</li>
          <li>• Valid tickets will show green with full event details</li>
          <li>• Invalid or used tickets will be clearly marked</li>
          <li>• All verifications are recorded on the blockchain for security</li>
        </ul>
      </div>
    </div>
  );
};

export default VerifyPage;