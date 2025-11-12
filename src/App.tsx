import { useState, useEffect } from 'react';
import Header from './components/Header';
import MetaMaskPrompt from './components/MetaMaskPrompt';
import EventsPage from './pages/EventsPage';
import MyTicketsPage from './pages/MyTicketsPage';
import TransferPage from './pages/TransferPage';
import VerifyPage from './pages/VerifyPage';

export type Page = 'events' | 'my-tickets' | 'transfer' | 'verify';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('events');
  const [showMetaMaskPrompt, setShowMetaMaskPrompt] = useState(false);

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

  const renderPage = () => {
    switch (currentPage) {
      case 'events':
        return <EventsPage />;
      case 'my-tickets':
        return <MyTicketsPage />;
      case 'transfer':
        return <TransferPage />;
      case 'verify':
        return <VerifyPage />;
      default:
        return <EventsPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
      
      <main className="container mx-auto px-4 py-8">
        {renderPage()}
      </main>

      <MetaMaskPrompt 
        show={showMetaMaskPrompt} 
        onClose={() => setShowMetaMaskPrompt(false)} 
      />
    </div>
  );
}

export default App;