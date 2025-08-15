import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { WalletProvider } from "./lib/wallet/WalletProvider";
import CasinoChurchHomepage from "./components/CasinoChurchHomepage";
import CasinoRealm from "./components/CasinoRealm";
import ChurchRealm from "./components/ChurchRealm";
import WriteSermons from "./components/church/WriteSermons";
import ProphecyQuests from "./components/church/ProphecyQuests";
import SlotMachine from "./components/games/SlotMachine";
import MemecoinSimulator from "./components/games/MemecoinSimulator";
import "./styles/homepage.css";
import "./styles/wallet.css";

function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simple loading delay to ensure assets are ready
    const timer = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!isLoaded) {
    return (
      <div className="loading-screen">
        <div className="pixel-loader">Loading...</div>
      </div>
    );
  }

  return (
    <WalletProvider>
      <Router>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<CasinoChurchHomepage />} />
            <Route path="/casino" element={<CasinoRealm />} />
            <Route path="/casino/slots" element={<SlotMachine />} />
            <Route path="/casino/memecoin" element={<MemecoinSimulator />} />
            <Route path="/church" element={<ChurchRealm />} />
            <Route path="/church/sermons" element={<WriteSermons />} />
            <Route path="/church/quests" element={<ProphecyQuests />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </WalletProvider>
  );
}

export default App;
