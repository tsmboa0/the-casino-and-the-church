import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "../hooks/use-is-mobile";
import { useAudio } from "../lib/stores/useAudio";
import { useProgress } from "../lib/stores/useProgress";
import "../styles/casino-realm.css";
import { useConnection } from "@solana/wallet-adapter-react";
import { useSolBalance } from "../hooks/useSolBalance";

const CasinoRealm: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isGoingBack, setIsGoingBack] = useState(false);
  const [casinoMusic, setCasinoMusic] = useState<HTMLAudioElement | null>(null);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState<string>("");
  
  // Progress system integration
  const { 
    luckProgress, 
    setLastCasinoTime, 
    applyCrossRealmDecay 
  } = useProgress();

  // Wallet + CNC balance
  const { connection } = useConnection();
  const { balance: solBalance } = useSolBalance();
  
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

  const handleGameSelect = async (game: string) => {
    playHit();
    if (game === 'slot-machine') {
      navigate('/casino/slots');
      return;
    }
    if (game === 'memecoin-simulator') {
      navigate('/casino/memecoin');
      return;
    }
    const picked = featuredGames.find(g => g.id === game);
    setSelectedTitle((picked?.name || game).toUpperCase());
    setShowComingSoon(true);
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

  // Featured six games to render as shuffled cards (with images)
  const featuredGames = useMemo(() => ([
    { id: 'slot-machine', name: '777 Slot Machine', image: '/assets/casino_games/slot-image.jpg' },
    { id: 'memecoin-simulator', name: 'Memecoin Simulator', image: '/assets/casino_games/memecoin-simulator.webp' },
    { id: 'coin-flip', name: 'Coin Flip', image: '/assets/casino_games/5d0888d10b189f5e2_9078f79a-1c2e-48b3-8833-07f50c9279ca.png' },
    { id: 'rug-pull-roulette', name: 'Rug Pull Roulette', image: '/assets/casino_games/b78db705fcf8ac48_376f4127-82a8-4fe5-aee0-9faea7017bbf.png' },
    { id: 'barbarossa', name: 'Barbarossa', image: '/assets/casino_games/104bf8ff8e8cae125_b0f8ac20-2f18-41e4-a507-7c9ac9f1d17a.jpeg' },
    { id: 'raging-lion', name: 'Raging Lion', image: '/assets/casino_games/432f10db51a752e51_f72c6605-3e1f-4ac0-9ef4-26c295758d36.jpeg' }
  ]), []);

  const [startIndex, setStartIndex] = useState(0);

  const orderedCards = useMemo(() => {
    return featuredGames.map((g, i) => featuredGames[(startIndex + i) % featuredGames.length]);
  }, [featuredGames, startIndex]);

  const swipeLeft = () => {
    playHit();
    setStartIndex((prev) => (prev + 1) % featuredGames.length);
  };

  const swipeRight = () => {
    playHit();
    setStartIndex((prev) => (prev - 1 + featuredGames.length) % featuredGames.length);
  };

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
        <div className="casino-balance">💰 {(solBalance ?? 0).toFixed(4)} SOL</div>
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

        {/* Game Selection - Shuffled Cards */}
        <div className="games-container">
          <h2 className="games-title">SELECT YOUR GAME</h2>
          <div className="shuffled-cards">
            <button className="deck-control left" onClick={swipeRight} title="Previous">◀</button>
            <button className="deck-control right" onClick={swipeLeft} title="Next">▶</button>
            {orderedCards.map((game, index) => (
              <button
                key={game.id}
                className={`casino-card card-${index} ${index === 0 ? 'card-active' : ''}`}
                onClick={() => handleGameSelect(game.id)}
                onMouseEnter={playHoverSound}
                title={game.name}
              >
                <img src={game.image} alt={game.name} />
                <div className="card-overlay">
                  <span className="card-name">{game.name}</span>
                </div>
              </button>
            ))}
          </div>
          <button
            className="load-more-button"
            onClick={() => navigate('/casino/games')}
            onMouseEnter={playHoverSound}
          >
            LOAD MORE GAMES
          </button>
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
      {showComingSoon && (
        <div className="coming-modal-overlay" role="dialog" aria-modal="true">
          <div className="coming-modal">
            <div className="coming-header">
              <span className="coming-title">COMING SOON</span>
            </div>
            <div className="coming-body">
              <div className="soon-line">{selectedTitle || 'NEW GAME'}</div>
              <div className="soon-sub">This table is being prepared. Check back shortly!</div>
            </div>
            <div className="coming-actions">
              <button className="pixel-btn" onClick={() => { playHit(); setShowComingSoon(false); }}>OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CasinoRealm; 