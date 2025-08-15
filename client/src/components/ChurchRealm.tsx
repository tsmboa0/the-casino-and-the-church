import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "../hooks/use-is-mobile";
import { useAudio } from "../lib/stores/useAudio";
import { useProgress } from "../lib/stores/useProgress";
import "../styles/church-realm.css";

const ChurchRealm: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isGoingBack, setIsGoingBack] = useState(false);
  const [churchMusic, setChurchMusic] = useState<HTMLAudioElement | null>(null);
  
  // Progress system integration
  const { 
    faithProgress, 
    casinoBalance,
    updateFaithProgress,
    updateCasinoBalance,
    setLastChurchTime, 
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

  // Initialize church music and handle transition
  useEffect(() => {
    // Stop homepage music
    if (backgroundMusic) {
      stopBackgroundMusic();
    }

    // Initialize church music
    const churchAudio = new Audio('/sounds/church_realm_music.mp3');
    churchAudio.loop = true;
    churchAudio.volume = 0.7;
    churchAudio.preload = 'auto';
    setChurchMusic(churchAudio);

    // Start church music after transition
    const transitionTimer = setTimeout(() => {
      setIsTransitioning(false);
      if (!isMuted && churchAudio) {
        churchAudio.play().catch(error => {
          console.log("Church music autoplay prevented:", error);
        });
      }
    }, 2000);

    return () => {
      clearTimeout(transitionTimer);
      if (churchAudio) {
        churchAudio.pause();
        churchAudio.currentTime = 0;
      }
    };
  }, [backgroundMusic, stopBackgroundMusic, isMuted]);

  // Apply cross-realm decay and track church time
  useEffect(() => {
    // Apply decay when entering church
    applyCrossRealmDecay();
    
    // Set church time when entering
    setLastChurchTime();
    
    // Apply decay every 30 seconds while in church
    const decayInterval = setInterval(() => {
      applyCrossRealmDecay();
    }, 30000);

    return () => {
      clearInterval(decayInterval);
    };
  }, [applyCrossRealmDecay, setLastChurchTime]);

  const playHoverSound = () => {
    playHit();
  };

  const handleActivitySelect = (activity: string) => {
    playHit();
    
    if (activity === 'write-sermons') {
      navigate('/church/sermons');
      return;
    }
    
    if (activity === 'prophecy-quests') {
      navigate('/church/quests');
      return;
    }
    
    // For other activities, just log the selection (pages will be designed later)
    console.log(`Selected activity: ${activity} - Page coming soon!`);
  };

  const handleBackToHome = () => {
    playHit();
    // Stop church music before transition
    if (churchMusic) {
      churchMusic.pause();
      churchMusic.currentTime = 0;
    }
    setIsGoingBack(true);
    // Navigate after transition
    setTimeout(() => {
      navigate('/');
    }, 1500);
  };

  const activities = [
    { id: 'write-sermons', name: 'Write Sermons', emoji: '📖', description: 'Share wisdom and build belief' },
    { id: 'dao-voting', name: 'DAO Voting', emoji: '🗳️', description: 'Participate in governance decisions' },
    { id: 'prophecy-quests', name: 'Prophecy Quests', emoji: '🔮', description: 'Complete sacred missions' },
    { id: 'doctrine-builder', name: 'Doctrine Builder', emoji: '⚖️', description: 'Craft the rules of faith' }
  ];

  if (isTransitioning) {
    return (
      <div className="transition-screen">
        <div className="transition-text">Entering the church realm...</div>
      </div>
    );
  }

  if (isGoingBack) {
    return (
      <div className="transition-screen">
        <div className="transition-text">Going back to realms...</div>
      </div>
    );
  }

  return (
    <div className={`church-realm-container ${isMobile ? 'mobile' : 'desktop'}`}>
      {/* Background Image */}
      <div className="church-background">
        <img src="/scenes/church_scene.png" alt="Church Realm" />
      </div>

      {/* Progress Bar and Balance */}
      <div className="faith-progress-container">
        <div className="faith-progress-bar">
          <div 
            className="faith-progress-fill"
            style={{ width: `${faithProgress.toFixed(2)}%` }}
          ></div>
          <div className="faith-progress-text">FAITH</div>
        </div>
        <div className="faith-value">{faithProgress.toFixed(2)}%</div>
        <div className="casino-balance">🎰 {casinoBalance.toFixed(2)}</div>
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
      <div className="church-content">
        {/* Priest Character */}
        <div className="priest-container">
          <div className="priest-image">
            <img src="/avatars/priest.png" alt="Priest" />
          </div>
          <div className="priest-glow"></div>
        </div>

        {/* Activity Selection */}
        <div className="activities-container">
          <h2 className="activities-title">CHOOSE YOUR PATH</h2>
          <div className="activities-grid">
            {activities.map((activity) => (
              <button
                key={activity.id}
                className="activity-button"
                onClick={() => handleActivitySelect(activity.id)}
                onMouseEnter={playHoverSound}
              >
                <div className="activity-emoji">{activity.emoji}</div>
                <div className="activity-name">{activity.name}</div>
                <div className="activity-description">{activity.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Audio Control */}
      <button 
        className="audio-control"
        onClick={() => {
          if (churchMusic) {
            if (churchMusic.paused) {
              churchMusic.play();
            } else {
              churchMusic.pause();
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

export default ChurchRealm; 