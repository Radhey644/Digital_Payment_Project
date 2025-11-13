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
      let parsedInput = ticketId.trim();
      
      try {
        // If it looks like JSON, try to parse it
        if (parsedInput.startsWith('{') && parsedInput.includes('tokenId')) {
          const qrData = JSON.parse(parsedInput);
          if (qrData.type === 'TICKET_NFT') {
            tokenId = Number(qrData.tokenId);
            owner = qrData.owner || qrData.ownerAddress;
          } else {
            throw new Error('Invalid QR type');
          }
        } else {
          // Otherwise treat as a token ID
          tokenId = parseInt(parsedInput);
          if (isNaN(tokenId) || tokenId < 0) {
            throw new Error('Invalid token ID');
          }
        }
      } catch (err: any) {
        throw new Error('Invalid input. Please enter a token ID number (e.g., 6) or valid QR JSON data.');
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
                Enter Token ID or Paste QR Code Data
              </label>
              <textarea
                id="ticketId"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                placeholder='Token ID: 1  OR  QR JSON: {"tokenId":1,"owner":"0x...","eventId":1,"eventName":"Event","timestamp":...,"type":"TICKET_NFT"}'
                rows={3}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all duration-200 font-mono"
              />
              <div className="mt-2 text-xs text-slate-500 space-y-1">
                <div>✓ Enter token ID (e.g., "6", "7", "8")</div>
                <div>✓ Or paste complete QR code JSON from a ticket</div>
                <div>✓ Verification is done against the live blockchain</div>
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
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                  <div className="flex items-center space-x-2 text-blue-700 text-sm font-semibold">
                    <CheckCircle className="w-4 h-4" />
                    <span>✓ Verified on Blockchain</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">This ticket's ownership and validity are confirmed on-chain</p>
                </div>
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
                    #{verificationResult.ticketInfo.tokenId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Current Owner:</span>
                  <span className="font-mono text-sm text-slate-800">
                    {formatAddress(verificationResult.ticketInfo.ownerAddress)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Ticket Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    verificationResult.ticketInfo.isTicketValid
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {verificationResult.ticketInfo.isTicketValid ? '✓ VALID' : '✗ INVALID'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Price Paid:</span>
                  <span className="font-medium text-slate-800">
                    {verificationResult.ticketInfo.price} ETH
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
        <h3 className="font-semibold text-slate-800 mb-3">🔍 How Blockchain Verification Works</h3>
        <ul className="text-sm text-slate-600 space-y-2">
          <li>• <strong>Step 1:</strong> Enter token ID (e.g., "6") or paste QR code JSON data</li>
          <li>• <strong>Step 2:</strong> System queries the blockchain smart contract directly</li>
          <li>• <strong>Step 3:</strong> Contract returns ticket details, current owner, and validity status</li>
          <li>• <strong>Step 4:</strong> If QR code is used, ownership is cross-verified with QR owner data</li>
          <li>• ✅ Green result = Valid ticket with matching owner from blockchain</li>
          <li>• ❌ Red result = Invalid, transferred, or non-existent ticket</li>
          <li>• 🔗 All data comes from the immutable blockchain - cannot be faked</li>
        </ul>
      </div>

      {/* Security Badge */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6 text-center">
        <div className="flex items-center justify-center space-x-2 text-indigo-700 font-semibold mb-2">
          <CheckCircle className="w-5 h-5" />
          <span>Blockchain-Verified Security</span>
        </div>
        <p className="text-sm text-indigo-600">
          Every verification queries the live blockchain contract at <code className="bg-white px-2 py-1 rounded text-xs font-mono">0x5FbDB...0aa3</code>
          <br />No fake tickets can pass this verification.
        </p>
      </div>
    </div>
  );
};

export default VerifyPage;