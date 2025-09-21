import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "../hooks/use-is-mobile";
import { useAudio } from "../lib/stores/useAudio";
import { useProgress } from "../lib/stores/useProgress";
import "../styles/casino-realm.css";

const CasinoRealm: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isGoingBack, setIsGoingBack] = useState(false);
  const [casinoMusic, setCasinoMusic] = useState<HTMLAudioElement | null>(null);
  
  // Progress system integration
  const { 
    luckProgress, 
    casinoBalance,
    setLastCasinoTime, 
    applyCrossRealmDecay 
  } = useProgress();
  
  const { 
    backgroundMusic, 
    hitSound, 
    successSound, 
    isMuted,
    stopBackgroundMusic,
    playHit,
    playSuccess
  } = useAudio();

  // Initialize casino music and handle transition
  useEffect(() => {
    // Stop homepage music
    if (backgroundMusic) {
      stopBackgroundMusic();
    }

    // Initialize casino music
    const casinoAudio = new Audio('/sounds/casino-funk-background-335164.mp3');
    casinoAudio.loop = true;
    casinoAudio.volume = 0.5;
    casinoAudio.preload = 'auto';
    setCasinoMusic(casinoAudio);

    // Start casino music after transition
    const transitionTimer = setTimeout(() => {
      setIsTransitioning(false);
      if (!isMuted && casinoAudio) {
        casinoAudio.play().catch(error => {
          console.log("Casino music autoplay prevented:", error);
        });
      }
    }, 2000);

    return () => {
      clearTimeout(transitionTimer);
      if (casinoAudio) {
        casinoAudio.pause();
        casinoAudio.currentTime = 0;
      }
    };
  }, [backgroundMusic, stopBackgroundMusic, isMuted]);

  // Apply cross-realm decay and track casino time
  useEffect(() => {
    // Apply decay when entering casino
    applyCrossRealmDecay();
    
    // Set casino time when entering
    setLastCasinoTime();
    
    // Apply decay every 30 seconds while in casino
    const decayInterval = setInterval(() => {
      applyCrossRealmDecay();
    }, 30000);

    return () => {
      clearInterval(decayInterval);
    };
  }, [applyCrossRealmDecay, setLastCasinoTime]);

  const playHoverSound = () => {
    playHit();
  };

  const handleGameSelect = (game: string) => {
    playHit();
    console.log(`Selected game: ${game}`);
    if (game === 'slot-machine') {
      navigate('/casino/slots');
      return;
    }
    if (game === 'memecoin-simulator') {
      navigate('/casino/memecoin');
      return;
    }
    // TODO: Navigate to specific game
  };

  const handleBackToHome = () => {
    playHit();
    // Stop casino music before transition
    if (casinoMusic) {
      casinoMusic.pause();
      casinoMusic.currentTime = 0;
    }
    setIsGoingBack(true);
    // Navigate after transition
    setTimeout(() => {
      navigate('/');
    }, 1500);
  };

  const games = [
    { id: 'slot-machine', name: 'Slot Machine', emoji: '🎰', description: 'Pull the lever and test your luck' },
    { id: 'coin-flip', name: 'Coin Flip', emoji: '🪙', description: 'Heads or tails, 50/50 chance' },
    { id: 'memecoin-simulator', name: 'Memecoin Simulator', emoji: '🚀', description: 'Ride the pump or crash' },
    { id: 'rug-pull-roulette', name: 'Rug Pull Roulette', emoji: '🎲', description: 'Spin the wheel of fortune' }
  ];

  if (isTransitioning) {
    return (
      <div className="casino-transition-screen">
        <div className="casino-transition-text">Entering the casino realm...</div>
      </div>
    );
  }

  if (isGoingBack) {
    return (
      <div className="casino-transition-screen">
        <div className="casino-transition-text">Going back to realms...</div>
      </div>
    );
  }

  return (
    <div className={`casino-realm-container ${isMobile ? 'mobile' : 'desktop'}`}>
      {/* Background Image */}
      <div className="casino-background">
        <img src="/scenes/casino_scene.png" alt="Casino Realm" />
      </div>

      {/* Progress Bar and Balance */}
      <div className="luck-progress-container">
        <div className="luck-progress-bar">
          <div 
            className="luck-progress-fill"
            style={{ width: `${luckProgress.toFixed(2)}%` }}
          ></div>
          <div className="luck-progress-text">LUCK</div>
        </div>
        <div className="luck-value">{luckProgress.toFixed(2)}%</div>
        <div className="casino-balance">💰 {casinoBalance.toFixed(2)} $CNC</div>
      </div>

      {/* Back Button */}
      <button 
        className="back-button"
        onClick={handleBackToHome}
        onMouseEnter={playHoverSound}
      >
        <span className="back-icon">←</span>
        <span className="back-text desktop-only">BACK TO REALMS</span>
      </button>

      {/* Main Content */}
      <div className="casino-content">
        {/* Gambler Character */}
        <div className="gambler-container">
          <div className="gambler-image">
            <img src="/avatars/gambler.png" alt="Gambler" />
          </div>
          <div className="gambler-glow"></div>
        </div>

        {/* Game Selection */}
        <div className="games-container">
          <h2 className="games-title">SELECT YOUR GAME</h2>
          <div className="games-grid">
            {games.map((game) => (
              <button
                key={game.id}
                className="game-button"
                onClick={() => handleGameSelect(game.id)}
                onMouseEnter={playHoverSound}
              >
                <div className="game-emoji">{game.emoji}</div>
                <div className="game-name">{game.name}</div>
                <div className="game-description">{game.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Audio Control */}
      <button 
        className="audio-control"
        onClick={() => {
          if (casinoMusic) {
            if (casinoMusic.paused) {
              casinoMusic.play();
            } else {
              casinoMusic.pause();
            }
          }
        }}
        title="Toggle Music"
      >
        🔊
      </button>
    </div>
  );
};

export default CasinoRealm; 