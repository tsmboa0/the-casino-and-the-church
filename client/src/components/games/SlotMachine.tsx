import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "../../hooks/use-is-mobile";
import { useAudio } from "../../lib/stores/useAudio";
import { useProgress } from "../../lib/stores/useProgress";
import "../../styles/slot-machine.css";

const symbols = ["🔔", "🥭", "🌽", "🍏", "🍅", "🍌"];

type ReelState = {
  isSpinning: boolean;
  intervalId: number | null;
  currentSymbol: string;
  queue: string[];
  offset: number;
  speed: number;
  spinTicks: number;
  stopping: boolean;
  target: string | null;
  landingSet: boolean;
  showScroll: boolean;
};

const makeQueue = (len: number) =>
  Array.from({ length: len }, () => symbols[Math.floor(Math.random() * symbols.length)]);

const initialReel: ReelState = {
  isSpinning: false,
  intervalId: null,
  currentSymbol: "🔔",
  queue: makeQueue(16),
  offset: 0,
  speed: 12,
  spinTicks: 0,
  stopping: false,
  target: null,
  landingSet: false,
  showScroll: false,
};

const SlotMachine: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { stopBackgroundMusic, playHit } = useAudio();
  
  // Progress system integration
  const { 
    casinoBalance, 
    updateCasinoBalance, 
    updateLuckProgress 
  } = useProgress();

  const [spinAudio] = useState(() => new Audio('/sounds/spinning_slot_machine.wav'));
  const [winAudio] = useState(() => new Audio('/sounds/casino_win_sound.wav'));
  const [loseAudio] = useState(() => new Audio('/sounds/casino_lost_sound.wav'));

  useEffect(() => {
    spinAudio.loop = false;
    spinAudio.volume = 0.6;
    winAudio.volume = 0.9;
    loseAudio.volume = 0.9;
  }, [spinAudio, winAudio, loseAudio]);

  useEffect(() => {
    stopBackgroundMusic();
    return () => {
      spinAudio.pause();
      spinAudio.currentTime = 0;
    };
  }, [stopBackgroundMusic, spinAudio]);

  const [bet, setBet] = useState<number>(50);
  const [unclaimed, setUnclaimed] = useState<number>(0);
  const [reels, setReels] = useState<ReelState[]>([
    { ...initialReel },
    { ...initialReel },
    { ...initialReel },
  ]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [resultText, setResultText] = useState<string>("");
  const [showResultModal, setShowResultModal] = useState(false);
  const [wonAmount, setWonAmount] = useState<number>(0);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [itemHeights, setItemHeights] = useState<number[]>([0, 0, 0]);

  const [finalSymbols, setFinalSymbols] = useState<string[]>(["🔔", "🔔", "🔔"])

  const randomSymbol = () => Math.floor(Math.random() * symbols.length);
  const reelRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const machineImgRef = useRef<HTMLImageElement>(null);

  const measureHeights = () => {
    setItemHeights(
      reelRefs.map(ref => {
        const el = ref.current;
        if (!el) return 0;
        const rect = el.getBoundingClientRect();
        return Math.round(rect.height);
      })
    );
  };

  useEffect(() => {
    measureHeights();
    const t = setTimeout(measureHeights, 100);
    const t2 = setTimeout(measureHeights, 300);
    window.addEventListener("resize", measureHeights);

    const observers: ResizeObserver[] = [];
    if (typeof ResizeObserver !== "undefined") {
      reelRefs.forEach(ref => {
        if (ref.current) {
          const ro = new ResizeObserver(() => measureHeights());
          ro.observe(ref.current);
          observers.push(ro);
        }
      });
    }

    return () => {
      clearTimeout(t);
      clearTimeout(t2);
      window.removeEventListener("resize", measureHeights);
      observers.forEach(o => o.disconnect());
    };
  }, []);

  const startLoop = (reelIndex: number) => {
    const id = window.setInterval(() => {
      setReels(prev => {
        const updated = [...prev];
        const r = { ...updated[reelIndex] };
        const itemH = itemHeights[reelIndex] || 100;

        if (!r.stopping && r.spinTicks < 60 && r.speed < 22) {
          r.speed = Math.min(22, r.speed * 1.05);
          r.spinTicks += 1;
        }

        r.offset += r.speed;

        if (r.stopping && r.speed > 3) r.speed *= 0.96;

        if (r.offset >= itemH) {
          r.offset -= itemH;

          if (r.stopping && !r.landingSet) {
            // Force target to be first symbol
            r.queue = [r.target!, ...r.queue.slice(0, -1)];
            r.landingSet = true;
          } else {
            // Keep spinning random symbols until stop triggered
            const nextSymbol = symbols[randomSymbol()];
            r.queue = [nextSymbol, ...r.queue.slice(0, -1)];
          }

          if (r.stopping && r.speed <= 3 && r.landingSet) {
            r.isSpinning = false;
            r.stopping = false;
            r.speed = 12;
            r.spinTicks = 0;
            r.offset = 0;
            r.currentSymbol = r.queue[0];
            r.showScroll = false;
            if (r.intervalId) window.clearInterval(r.intervalId);
            r.intervalId = null;
          }
        }

        r.currentSymbol = r.queue[0];
        updated[reelIndex] = r;
        return updated;
      });
    }, 16);

    setReels(prev => {
      const updated = [...prev];
      updated[reelIndex] = {
        ...updated[reelIndex],
        isSpinning: true,
        showScroll: true,
        intervalId: id,
        spinTicks: 0,
        speed: 12,
      };
      return updated;
    });
  };

  const spinReel = (reelIndex: number) => {
    setReels(prev => {
      const updated = [...prev];
      updated[reelIndex] = {
        ...updated[reelIndex],
        isSpinning: true,
        stopping: false,
        landingSet: false,
        target: null,
        spinTicks: 0,
        speed: 12,
        offset: 0,
        showScroll: true,
      };
      return updated;
    });
    startLoop(reelIndex);
  };

  const stopReel = (reelIndex: number, finalSymbol: string) => {
    console.log(`finalSymbol${reelIndex}: ${finalSymbol}`);
    setReels(prev => {
      const updated = [...prev];
      const r = { ...updated[reelIndex] };
      r.stopping = true;
      r.target = finalSymbol;
      updated[reelIndex] = r;
      return updated;
    });
  };

  const computePayout = (midSymbols: number[]): number => {
    const [a, b, c] = midSymbols;
    if (a === b && b === c) return bet * 3;
    if (a === b || b === c || a === c) return bet * 2;
    return 0;
  };

  const handlePlay = async () => {
    if (isPlaying) return;
    if (bet <= 0 || bet > casinoBalance) return;

    setIsPlaying(true);
    setResultText("");
    setWonAmount(0);
    setShowResultModal(false);
    updateCasinoBalance(-bet);

    playHit();
    try {
      spinAudio.currentTime = 0;
      await spinAudio.play();
    } catch {}

    spinReel(0);
    setTimeout(() => spinReel(1), 150);
    setTimeout(() => spinReel(2), 300);

    const finalMid = [randomSymbol(), randomSymbol(), randomSymbol()];
    console.log(`finalMid: ${finalMid.map(i => symbols[i]).join(", ")}`);

    setTimeout(() => stopReel(0, symbols[finalMid[0]]), 2000);
    const fs1 = finalSymbols
    fs1[0]= symbols[finalMid[0]]
    setFinalSymbols(fs1)
    setTimeout(() => stopReel(1, symbols[finalMid[1]]), 2500);
    const fs2 = finalSymbols
    fs2[1] = symbols[finalMid[1]]
    setFinalSymbols(fs2)
    setTimeout(() => stopReel(2, symbols[finalMid[2]]), 3000);
    const fs3 = finalSymbols
    fs3[2] = symbols[finalMid[2]]
    setFinalSymbols(fs3)

    setTimeout(() => {
      const checkDone = window.setInterval(() => {
        setReels(currentReels => {
          const allStopped = currentReels.every(r => !r.isSpinning && !r.stopping);
          if (allStopped) {
            window.clearInterval(checkDone);
            spinAudio.pause();
            spinAudio.currentTime = 0;

            const payout = computePayout(finalMid);
            setTimeout(() => {
              if (payout > 0) {
                try {
                  winAudio.currentTime = 0;
                  winAudio.play();
                } catch {}
                setWonAmount(payout);
                setUnclaimed(prev => {
                  const total = prev + payout;
                  setResultText(`You won ${payout} chips! Unclaimed total: ${total}. Tap CASHOUT to add to balance.`);
                  return total;
                });
                // Increase luck when winning
                updateLuckProgress(1.5);
              } else {
                try {
                  loseAudio.currentTime = 0;
                  loseAudio.play();
                } catch {}
                setResultText(`No win. Try again! 😅`);
                setWonAmount(0);
                // Decrease luck when losing
                updateLuckProgress(-0.8);
              }
              setShowResultModal(true);
              setIsPlaying(false);
            }, 2000);
          }
          return currentReels;
        });
      }, 50);
    }, 3000);
  };

  const setBetByPercent = (pct: number) => {
    playHit();
    setBet(Math.max(1, Math.floor((casinoBalance * pct) / 100)));
  };

  const handleCashout = () => {
    playHit();
    if (unclaimed > 0) {
      updateCasinoBalance(unclaimed);
      const claimed = unclaimed;
      setUnclaimed(0);
      setWonAmount(claimed);
      setResultText(`Claimed ${claimed} chips! Added to your balance.`);
      setShowResultModal(true);
    } else {
      setWonAmount(0);
      setResultText(`No winnings to claim yet.`);
      setShowResultModal(true);
    }
  };

  return (
    <div className={`slot-machine-page ${isMobile ? 'mobile' : 'desktop'}`}>
      {/* Background */}
      <div className="slot-bg">
        <img src="/scenes/casino_scene.png" alt="Casino" />
        <div className="slot-overlay" />
      </div>

      {/* Top bar with balance & claim */}
      <div className="slot-topbar">
        <div className="slot-topbar-inner">
          <div className="slot-balance">💰 Balance: <span className="coins">{casinoBalance.toFixed(2)}</span></div>
          <div className="slot-unclaimed">🏆 Unclaimed: <span className="coins">{unclaimed.toFixed(2)}</span></div>

        </div>
      </div>

      {/* Back Button */}
      <button className="slot-back" onClick={() => navigate('/casino')}>
        ← BACK
      </button>

      {/* Main Layout */}
      <div className="slot-layout">
        {/* Machine */}
        <div className="machine-container">
          <img ref={machineImgRef} onLoad={measureHeights} className="machine-image" src="/assets/slot_machine.png" alt="Slot Machine" />

          {/* Reels overlay - positions tuned via CSS for responsiveness */}
          {[0,1,2].map((idx) => (
            <div className={`reel reel-${idx+1}`} key={idx} ref={reelRefs[idx]}>
              {reels[idx].showScroll ? (
                <div className="reel-inner" style={{ transform: `translateY(${Math.round(reels[idx].offset)}px)`, ['--item-h' as any]: `${itemHeights[idx]}px` }}>
                  {[reels[idx].queue[reels[idx].queue.length - 1], ...reels[idx].queue].map((s, i) => (
                    <div key={i} className="symbol">{s}</div>
                  ))}
                </div>
              ) : (
                <div className="symbol centered">{finalSymbols[idx]}</div>
              )}
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="controls-container">
          <div className="panel">
            <div className="stats">
              <div className="stat"><span className="label">Bet</span><span className="value">{bet}</span></div>
              <div className="stat"><span className="label">Status</span><span className="value">{isPlaying ? 'Spinning…' : 'Ready'}</span></div>
              <div className="stat">
                <button className="rules-btn" onClick={() => { playHit(); setShowRulesModal(true); }}>📜 Rules</button>
              </div>
            </div>

            <div className="bet-grid">
              <button className="bet-btn" onClick={() => setBetByPercent(5)}>5%</button>
              <button className="bet-btn" onClick={() => setBetByPercent(10)}>10%</button>
              <button className="bet-btn" onClick={() => setBetByPercent(25)}>25%</button>
              <button className="bet-btn" onClick={() => setBetByPercent(50)}>50%</button>
              <button className="bet-btn" onClick={() => setBetByPercent(75)}>75%</button>
              <button className="bet-btn" onClick={() => setBetByPercent(100)}>100%</button>
            </div>

            <div className="action-row">
              <button className="play-btn" onClick={handlePlay} disabled={isPlaying || bet > casinoBalance}>PLAY</button>
              <button className="cashout-btn" onClick={handleCashout} disabled={isPlaying}>CASHOUT</button>
            </div>
          </div>
        </div>
      </div>

      {/* Result Modal */}
      {showResultModal && (
        <div className="result-modal-overlay" onClick={() => setShowResultModal(false)}>
          <div className="result-modal" onClick={(e) => e.stopPropagation()}>
            <div className="result-title">{wonAmount > 0 ? 'WINNER!' : 'NOTICE'}</div>
            <div className="result-message">{resultText}</div>
            <button className="result-close" onClick={() => setShowResultModal(false)}>OK</button>
          </div>
        </div>
      )}

      {/* Rules Modal */}
      {showRulesModal && (
        <div className="rules-modal-overlay" onClick={() => setShowRulesModal(false)}>
          <div className="rules-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rules-title">📜 Game Rules</div>
            <div className="rules-body">
              <ul className="rules-list">
                <li>Set your bet using the % buttons.</li>
                <li>Press PLAY to spin the three reels.</li>
                <li>Match 3 symbols: win 3x your bet.</li>
                <li>Match any 2 symbols: win 2x your bet.</li>
                <li>Winnings go to Unclaimed. Press CASHOUT to add to Balance.</li>
                <li>No win? Try again and watch your luck change!</li>
              </ul>
            </div>
            <button className="rules-close" onClick={() => setShowRulesModal(false)}>CLOSE</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlotMachine;
