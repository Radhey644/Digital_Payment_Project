import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import MetaMaskPrompt from './components/MetaMaskPrompt';
import EventsPage from './pages/EventsPage';
import MyTicketsPage from './pages/MyTicketsPage';
import TransferPage from './pages/TransferPage';
import VerifyPage from './pages/VerifyPage';

export type Page = 'events' | 'my-tickets' | 'transfer' | 'verify';

function App() {
  useEffect(() => {
    // Check if MetaMask is installed
    const checkMetaMask = () => {
      if (typeof (window as any).ethereum === 'undefined') {
        console.warn('MetaMask not detected');
      } else {
        console.log('MetaMask detected');
      }
    };
    checkMetaMask();

    // Listen for MetaMask installation
    window.addEventListener('ethereum#initialized', checkMetaMask);
    return () => {
      window.removeEventListener('ethereum#initialized', checkMetaMask);
    };
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Navigate to="/events" replace />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/my-tickets" element={<MyTicketsPage />} />
            <Route path="/transfer" element={<TransferPage />} />
            <Route path="/verify" element={<VerifyPage />} />
            <Route path="*" element={<Navigate to="/events" replace />} />
          </Routes>
        </main>

        <MetaMaskPrompt 
          show={false} 
          onClose={() => {}} 
        />
      </div>
    </Router>
  );
}

export default App;