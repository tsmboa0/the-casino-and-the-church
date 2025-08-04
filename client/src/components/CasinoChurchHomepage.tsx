import React, { useState, useEffect, useRef } from "react";
import { useIsMobile } from "../hooks/use-is-mobile";

const CasinoChurchHomepage: React.FC = () => {
  const isMobile = useIsMobile();
  const [hoveredSide, setHoveredSide] = useState<'casino' | 'church' | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio for button interactions
    audioRef.current = new Audio('/sounds/hit.mp3');
    audioRef.current.volume = 0.3;
  }, []);

  const playHoverSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Audio play prevented - user hasn't interacted yet
      });
    }
  };

  const handleEnterCasino = () => {
    console.log("Entering Casino...");
    // TODO: Navigate to casino game
  };

  const handleEnterChurch = () => {
    console.log("Entering Church...");
    // TODO: Navigate to church game
  };

  return (
    <div className={`homepage-container ${isMobile ? 'mobile' : 'desktop'}`}>
      {/* Game Title */}
      <div className="game-title">
        <h1 className="pixel-title">THE CASINO & THE CHURCH</h1>
        <div className="balance-meter">
          <span className="balance-icon">⚖️</span>
          <div className="balance-bar">
            <div className="balance-fill"></div>
          </div>
        </div>
      </div>

      {/* Split Screen Layout */}
      <div className="split-container">
        {/* Casino Side */}
        <div 
          className={`side casino-side ${hoveredSide === 'casino' ? 'hovered' : ''}`}
          onMouseEnter={() => {
            setHoveredSide('casino');
            playHoverSound();
          }}
          onMouseLeave={() => setHoveredSide(null)}
        >
          <div className="casino-background">
            {/* Dark atmospheric fog */}
            <div className="casino-fog">
              <div className="fog-layer fog-1"></div>
              <div className="fog-layer fog-2"></div>
              <div className="fog-layer fog-3"></div>
            </div>
            
            <div className="neon-signs">
              <div className="neon-sign neon-purple">$$$</div>
              <div className="neon-sign neon-gold">JACKPOT</div>
              <div className="neon-sign neon-pink">🎰</div>
            </div>
            <div className="slot-machines">
              <div className="slot-machine slot-1"></div>
              <div className="slot-machine slot-2"></div>
            </div>
            <div className="dancing-lights">
              <div className="light light-1"></div>
              <div className="light light-2"></div>
              <div className="light light-3"></div>
              <div className="light light-4"></div>
            </div>
            <div className="meme-posters">
              <div className="poster poster-1">🚀</div>
              <div className="poster poster-2">💎</div>
              <div className="poster poster-3">🦍</div>
            </div>
            
            {/* Dark smoke effects */}
            <div className="smoke-effects">
              <div className="smoke smoke-1"></div>
              <div className="smoke smoke-2"></div>
              <div className="smoke smoke-3"></div>
            </div>
          </div>

          <div className="side-content">
            <div className="avatar-container">
              <div className="casino-avatar">
                <div className="avatar-body">
                  <div className="avatar-head">😎</div>
                  <div className="avatar-outfit">
                    <div className="flashy-jacket"></div>
                    <div className="gold-chain"></div>
                  </div>
                  <div className="sol-tokens">
                    <span className="token">◎</span>
                    <span className="token">◎</span>
                    <span className="token">◎</span>
                  </div>
                </div>
              </div>
            </div>

            <button 
              className="enter-button casino-button"
              onClick={handleEnterCasino}
              onMouseEnter={playHoverSound}
            >
              <span className="button-icon">🎰</span>
              <span className="button-text">Enter Casino</span>
              <div className="button-glow"></div>
            </button>

            <div className="tooltip casino-tooltip">
              "Speculate. Win. Repeat."
            </div>
          </div>
        </div>

        {/* Church Side */}
        <div 
          className={`side church-side ${hoveredSide === 'church' ? 'hovered' : ''}`}
          onMouseEnter={() => {
            setHoveredSide('church');
            playHoverSound();
          }}
          onMouseLeave={() => setHoveredSide(null)}
        >
          <div className="church-background">
            {/* Mystical darkness and shadows */}
            <div className="church-shadows">
              <div className="shadow-layer shadow-1"></div>
              <div className="shadow-layer shadow-2"></div>
              <div className="shadow-layer shadow-3"></div>
            </div>
            
            <div className="stained-glass">
              <div className="glass-panel panel-1"></div>
              <div className="glass-panel panel-2"></div>
              <div className="glass-panel panel-3"></div>
            </div>
            <div className="floating-scrolls">
              <div className="scroll scroll-1">📜</div>
              <div className="scroll scroll-2">📋</div>
            </div>
            <div className="pulpit">
              <div className="candle candle-1">🕯️</div>
              <div className="candle candle-2">🕯️</div>
              <div className="candle candle-3">🕯️</div>
            </div>
            <div className="holy-symbols">
              <div className="symbol symbol-1">✨</div>
              <div className="symbol symbol-2">🙏</div>
              <div className="symbol symbol-3">⭐</div>
            </div>
            
            {/* Ethereal mist effects */}
            <div className="ethereal-mist">
              <div className="mist mist-1"></div>
              <div className="mist mist-2"></div>
              <div className="mist mist-3"></div>
            </div>
          </div>

          <div className="side-content">
            <div className="avatar-container">
              <div className="church-avatar">
                <div className="avatar-body">
                  <div className="avatar-head">😇</div>
                  <div className="avatar-robes">
                    <div className="digital-robe"></div>
                    <div className="holy-hood"></div>
                  </div>
                  <div className="glowing-ledger">
                    <div className="ledger">📖</div>
                    <div className="ledger-glow"></div>
                  </div>
                </div>
              </div>
            </div>

            <button 
              className="enter-button church-button"
              onClick={handleEnterChurch}
              onMouseEnter={playHoverSound}
            >
              <span className="button-icon">⛪</span>
              <span className="button-text">Enter Church</span>
              <div className="button-glow"></div>
            </button>

            <div className="tooltip church-tooltip">
              "Preach. Build. Believe."
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Branding */}
      <div className="branding">
        <div className="solana-badge">
          <span className="badge-text">Built on</span>
          <span className="solana-logo">◎ Solana</span>
        </div>
        <div className="honeycomb-badge">
          <span className="badge-text">Powered by</span>
          <span className="honeycomb-logo">🐝 Honeycomb Protocol</span>
        </div>
      </div>
    </div>
  );
};

export default CasinoChurchHomepage;
