import React from 'react';
import { AlertCircle, ExternalLink } from 'lucide-react';

interface MetaMaskPromptProps {
  show: boolean;
  onClose: () => void;
}

const MetaMaskPrompt: React.FC<MetaMaskPromptProps> = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              MetaMask Not Found
            </h3>
            <p className="text-slate-600 mb-4">
              MetaMask is required to use this application. Please install MetaMask to connect your wallet and interact with blockchain features.
            </p>
            <div className="space-y-3">
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
              >
                <span>Install MetaMask</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                onClick={onClose}
                className="w-full bg-slate-100 text-slate-700 px-4 py-3 rounded-lg font-semibold hover:bg-slate-200 transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetaMaskPrompt;
