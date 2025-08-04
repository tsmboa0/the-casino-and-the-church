import { useState, useEffect } from "react";
import CasinoChurchHomepage from "./components/CasinoChurchHomepage";
import "@fontsource/inter";
import "./styles/homepage.css";

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
    <div className="app-container">
      <CasinoChurchHomepage />
    </div>
  );
}

export default App;
