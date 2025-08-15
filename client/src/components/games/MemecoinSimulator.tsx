import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "../../hooks/use-is-mobile";
import { useAudio } from "../../lib/stores/useAudio";
import { useProgress } from "../../lib/stores/useProgress";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import "../../styles/memecoin-simulator.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

// Type definitions
interface Order {
  id: number;
  timestamp: string;
  type: 'BUY' | 'SELL';
  amount: number;
  price: number;
  total: number;
}

interface ResultData {
  reason: 'crash' | 'sold' | 'liquidation';
  finalPercent: number;
  totalValue: number;
  profitLoss: number;
}

interface CandleData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: CandleData[];
    borderColor: string;
    backgroundColor: string;
    borderWidth: number;
    fill: boolean;
    tension: number;
  }[];
}

const MemecoinSimulator: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { stopBackgroundMusic, playHit, playSuccess } = useAudio();
  
  // Progress system integration
  const { 
    casinoBalance, 
    updateCasinoBalance, 
    updateLuckProgress 
  } = useProgress();

  // Game state
  const [holdings, setHoldings] = useState<number>(0); // Start with 0 holdings
  const [currentPrice, setCurrentPrice] = useState<number>(1.00);
  const [previousPrice, setPreviousPrice] = useState<number>(1.00);
  const [tradeAmount, setTradeAmount] = useState<string>("");
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [gameEnded, setGameEnded] = useState<boolean>(false);
  const [showResultModal, setShowResultModal] = useState<boolean>(false);
  const [resultData, setResultData] = useState<ResultData>({
    reason: 'crash',
    finalPercent: 0,
    totalValue: 0,
    profitLoss: 0,
  });
  const [isTransitioning, setIsTransitioning] = useState<boolean>(true);
  const [simulationStarted, setSimulationStarted] = useState<boolean>(false);

  // Chart data
  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    datasets: [
      {
        label: 'Price',
        data: [],
        borderColor: '#00ff00',
        backgroundColor: 'rgba(0, 255, 0, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.1,
      },
    ],
  });

  // Audio refs
  const [crashAudio] = useState<HTMLAudioElement>(() => new Audio('/sounds/casino_lost_sound.wav'));
  const [pumpAudio] = useState<HTMLAudioElement>(() => new Audio('/sounds/casino_win_sound.wav'));
  const [tradeAudio] = useState<HTMLAudioElement>(() => new Audio('/sounds/hit.mp3'));

  useEffect(() => {
    crashAudio.volume = 0.8;
    pumpAudio.volume = 0.8;
    tradeAudio.volume = 0.6;
    stopBackgroundMusic();
    
    // Start transition
    setTimeout(() => setIsTransitioning(false), 1000);

    return () => {
      crashAudio.pause();
      crashAudio.currentTime = 0;
      pumpAudio.pause();
      pumpAudio.currentTime = 0;
      tradeAudio.pause();
      tradeAudio.currentTime = 0;
    };
  }, [crashAudio, pumpAudio, tradeAudio, stopBackgroundMusic]);

  // Calculate P/L
  const totalValue = casinoBalance + (holdings * currentPrice);
  const initialValue = 1000; // $1000 starting balance
  const profitLoss = totalValue - initialValue;
  const profitLossPercent = ((profitLoss / initialValue) * 100);

  // Generate candlestick data
  const generateCandleData = (currentPrice: number): CandleData => {
    const volatility = 0.15; // Increased volatility for more dramatic movements
    const open = currentPrice;
    
    // More dramatic price movements for realistic pump/dump
    const high = open * (1 + Math.random() * volatility * 2); // Up to 30% high
    const low = open * (1 - Math.random() * volatility * 2); // Up to 30% low
    const close = low + Math.random() * (high - low);
    const volume = 200 + Math.random() * 1800; // Higher volume range

    return {
      timestamp: new Date().toLocaleTimeString(),
      open,
      high: Math.max(open, high),
      low: Math.min(open, low),
      close,
      volume: Math.round(volume),
    };
  };

  // Generate new price with volatility - More dramatic for fast-paced trading
  const generateNewPrice = (currentPrice: number): number => {
    const random = Math.random();
    
    // 15% chance for pump (50% to 300% increase) - More dramatic pumps
    if (random < 0.15) {
      const pumpPercent = 50 + Math.random() * 250; // 50% to 300%
      return currentPrice * (1 + pumpPercent / 100);
    }
    
    // 15% chance for dump (50% to 100% decrease) - More dramatic dumps
    if (random < 0.30) {
      const dumpPercent = 50 + Math.random() * 50; // 50% to 100%
      const newPrice = currentPrice * (1 - dumpPercent / 100);
      return Math.max(newPrice, 0.01); // Don't go below $0.01
    }
    
    // 70% chance for normal movement (-20% to +20%) - More volatile normal movement
    const normalChange = (Math.random() - 0.5) * 0.4; // -20% to +20%
    const newPrice = currentPrice * (1 + normalChange);
    return Math.max(newPrice, 0.01);
  };

  // Update chart data with candlestick
  const updateChart = (candleData: CandleData): void => {
    setChartData(prevData => {
      const newData: ChartData = {
        ...prevData,
        labels: [...prevData.labels, candleData.timestamp],
        datasets: [
          {
            ...prevData.datasets[0],
            data: [...prevData.datasets[0].data, candleData],
            borderColor: candleData.close >= candleData.open ? '#00ff00' : '#ff0000',
            backgroundColor: candleData.close >= candleData.open ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)',
          },
        ],
      };

      // Keep only last 50 candles
      if (newData.labels.length > 50) {
        newData.labels = newData.labels.slice(-50);
        newData.datasets[0].data = newData.datasets[0].data.slice(-50);
      }

      return newData;
    });
  };

  // Price update interval - only runs when simulation is started
  useEffect(() => {
    if (!simulationStarted || gameEnded || isTransitioning) return;

    const interval = setInterval(() => {
      // Get the last candle's close price to build the next candle from
      const lastCandle = chartData.datasets[0].data[chartData.datasets[0].data.length - 1];
      const basePrice = lastCandle ? lastCandle.close : currentPrice;
      
      const newPrice = generateNewPrice(basePrice);
      const candleData = generateCandleData(newPrice);
      
      setPreviousPrice(currentPrice);
      setCurrentPrice(newPrice);
      updateChart(candleData);

      // Check for game ending conditions - More aggressive crash detection
      if (newPrice <= 0.01) {
        // 100% crash
        endGame('crash', -100);
      } else if (casinoBalance <= 0 && holdings <= 0) {
        // Liquidation
        endGame('liquidation', profitLossPercent);
      }
    }, 800); // Faster updates - every 800ms instead of 1000ms

    return () => clearInterval(interval);
  }, [currentPrice, gameEnded, isTransitioning, casinoBalance, holdings, profitLossPercent, simulationStarted, chartData.datasets[0].data]);

  // End game function
  const endGame = (reason: 'crash' | 'sold' | 'liquidation', finalPercent: number): void => {
    setGameEnded(true);
    
    if (reason === 'crash') {
      crashAudio.play().catch(console.log);
      // Decrease luck when crashing
      updateLuckProgress(-3.5);
    } else if (finalPercent > 0) {
      pumpAudio.play().catch(console.log);
      // Increase luck when profiting
      updateLuckProgress(4.2);
    } else {
      // Small luck decrease for breaking even or small loss
      updateLuckProgress(-0.5);
    }

    setResultData({
      reason,
      finalPercent: Math.round(finalPercent * 100) / 100,
      totalValue: Math.round(totalValue * 100) / 100,
      profitLoss: Math.round(profitLoss * 100) / 100,
    });
    
    setTimeout(() => setShowResultModal(true), 1000);
  };

  // Trading functions
  const handleBuy = (): void => {
    if (gameEnded) return;
    
    const amount = parseFloat(tradeAmount);
    if (!amount || amount <= 0) return;
    
    const cost = amount * currentPrice;
    if (cost > casinoBalance) return;

    updateCasinoBalance(-cost);
    setHoldings(prev => prev + amount);
    setTradeAmount("");
    
    // Start simulation on first buy
    if (!simulationStarted) {
      setSimulationStarted(true);
      // Add initial candle starting from current price
      const initialCandle = generateCandleData(currentPrice);
      updateChart(initialCandle);
      // Set the next price to build on this candle's close
      setCurrentPrice(initialCandle.close);
    }
    
    // Add to order history
    const order: Order = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      type: 'BUY',
      amount: amount,
      price: currentPrice,
      total: cost,
    };
    setOrderHistory(prev => [order, ...prev.slice(0, 9)]); // Keep last 10 orders
    
    tradeAudio.play().catch(console.log);
    playHit();
  };

  const handleSell = (): void => {
    if (gameEnded) return;
    
    const amount = parseFloat(tradeAmount);
    if (!amount || amount <= 0) return;
    
    if (amount > holdings) return;

    const revenue = amount * currentPrice;
    updateCasinoBalance(revenue);
    setHoldings(prev => prev - amount);
    setTradeAmount("");
    
    // Add to order history
    const order: Order = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      type: 'SELL',
      amount: amount,
      price: currentPrice,
      total: revenue,
    };
    setOrderHistory(prev => [order, ...prev.slice(0, 9)]); // Keep last 10 orders
    
    tradeAudio.play().catch(console.log);
    playHit();
    
    // End game on sell
    endGame('sold', profitLossPercent);
  };

  const handleBackToCasino = (): void => {
    playHit();
    navigate('/casino');
  };

  // Custom candlestick chart component
  const CandlestickChart: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to the end when new candles are added
    useEffect(() => {
      if (containerRef.current && simulationStarted) {
        containerRef.current.scrollLeft = containerRef.current.scrollWidth;
      }
    }, [chartData.datasets[0].data.length, simulationStarted]);

    if (!simulationStarted) {
      return (
        <div className="chart-placeholder">
                  <div className="start-trading-text">
          <div className="trading-prompt">🚀</div>
          <div className="trading-prompt">Click BUY to Start Trading!</div>
          <div className="trading-subtitle">Enter an amount and click BUY to begin the memecoin simulation</div>
          <div className="trading-warning">⚠️ Fast-paced trading - Act quickly to lock profits!</div>
        </div>
        </div>
      );
    }

    // Calculate price range for proper scaling
    const allPrices = chartData.datasets[0].data.flatMap(candle => [candle.high, candle.low]);
    const minPrice = Math.min(...allPrices, currentPrice);
    const maxPrice = Math.max(...allPrices, currentPrice);
    const priceRange = maxPrice - minPrice;
    const chartHeight = 300; // Fixed chart height

    // Create candlestick visualization with proper positioning
    const candles = chartData.datasets[0].data.map((candle, index) => {
      const isGreen = candle.close >= candle.open;
      
      // Calculate positions relative to price range - start from bottom
      const highPosition = ((candle.high - minPrice) / priceRange) * chartHeight;
      const lowPosition = ((candle.low - minPrice) / priceRange) * chartHeight;
      const openPosition = ((candle.open - minPrice) / priceRange) * chartHeight;
      const closePosition = ((candle.close - minPrice) / priceRange) * chartHeight;
      
      const wickHeight = highPosition - lowPosition;
      const bodyHeight = Math.abs(closePosition - openPosition);
      const bodyTop = Math.max(openPosition, closePosition);
      const bodyBottom = Math.min(openPosition, closePosition);
      
      return (
        <div key={index} className="candlestick-container">
          <div className="candlestick">
            {/* Wick */}
            <div 
              className={`candlestick-wick ${isGreen ? 'green' : 'red'}`}
              style={{
                height: `${wickHeight}px`,
                bottom: `${lowPosition}px`,
              }}
            />
            {/* Body */}
            <div 
              className={`candlestick-body ${isGreen ? 'green' : 'red'}`}
              style={{
                height: `${Math.max(bodyHeight, 2)}px`, // Minimum 2px height for visibility
                bottom: `${bodyBottom}px`,
              }}
            />
          </div>
          <div className="candle-volume">Vol {candle.volume.toFixed(0)}</div>
        </div>
      );
    });

    return (
      <div className="candlestick-chart">
        <div className="chart-header">
          <div className="volume-display">
            <span className="volume-label">Volume</span>
            <span className="volume-value">
              {chartData.datasets[0].data.length > 0 
                ? chartData.datasets[0].data[chartData.datasets[0].data.length - 1].volume.toFixed(2)
                : '0.00'
              }
            </span>
          </div>
          <button className="volume-button">^</button>
        </div>
        <div className="candlesticks-container" ref={containerRef}>
          {candles}
        </div>
        <div className="chart-grid">
          {/* Grid lines */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="grid-line" style={{ bottom: `${i * 20}%` }} />
          ))}
        </div>
      </div>
    );
  };

  if (isTransitioning) {
    return (
      <div className="memecoin-transition-screen">
        <div className="memecoin-transition-text">Loading Memecoin Simulator...</div>
      </div>
    );
  }

  return (
    <div className="memecoin-simulator-container">
      {/* Background */}
      <div className="memecoin-background">
        <img src="/scenes/casino_scene.png" alt="Casino Background" />
      </div>

      {/* Header */}
      <div className="memecoin-header">
        <button className="back-button" onClick={handleBackToCasino}>
          <span className="back-icon">←</span>
          <span className="back-text">Back to Casino</span>
        </button>
        <h1 className="game-title">🚀 Memecoin Simulator</h1>
      </div>

      {/* Main Content */}
      <div className="memecoin-content">
        {/* Left Panel - Chart */}
        <div className="chart-panel">
          <CandlestickChart />
        </div>

        {/* Right Panel - Trading Interface */}
        <div className="trading-panel">
          {/* Price Display */}
          <div className="price-display">
            <div className="current-price">
              <span className="price-label">Current Price:</span>
              <span className={`price-value ${currentPrice >= previousPrice ? 'positive' : 'negative'}`}>
                ${currentPrice.toFixed(4)}
              </span>
            </div>
            <div className="price-change">
              <span className={`change-value ${currentPrice >= previousPrice ? 'positive' : 'negative'}`}>
                {currentPrice >= previousPrice ? '+' : ''}{((currentPrice - previousPrice) / previousPrice * 100).toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Account Info */}
          <div className="account-info">
            <div className="info-row">
              <span className="info-label">Balance:</span>
              <span className="info-value">${casinoBalance.toFixed(2)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Holdings:</span>
              <span className="info-value">{holdings.toFixed(2)} coins</span>
            </div>
            <div className="info-row">
              <span className="info-label">Total Value:</span>
              <span className="info-value">${totalValue.toFixed(2)}</span>
            </div>
            <div className="info-row">
              <span className={`info-label ${profitLoss >= 0 ? 'positive' : 'negative'}`}>P/L:</span>
              <span className={`info-value ${profitLoss >= 0 ? 'positive' : 'negative'}`}>
                {profitLoss >= 0 ? '+' : ''}{profitLoss.toFixed(2)} ({profitLossPercent >= 0 ? '+' : ''}{profitLossPercent.toFixed(2)}%)
              </span>
            </div>
          </div>

          {/* Trading Controls */}
          <div className="trading-controls">
            <div className="trade-input-group">
              <input
                type="number"
                value={tradeAmount}
                onChange={(e) => setTradeAmount(e.target.value)}
                placeholder="Amount"
                className="trade-input"
                disabled={gameEnded}
              />
            </div>
            <div className="trade-buttons">
              <button
                className="buy-button"
                onClick={handleBuy}
                disabled={gameEnded || !tradeAmount || parseFloat(tradeAmount) <= 0}
              >
                BUY
              </button>
              <button
                className="sell-button"
                onClick={handleSell}
                disabled={gameEnded || !tradeAmount || parseFloat(tradeAmount) <= 0 || !simulationStarted}
              >
                SELL
              </button>
            </div>
          </div>

          {/* Order History */}
          <div className="order-history">
            <h3 className="history-title">Order History</h3>
            <div className="history-table">
              <div className="history-header">
                <span>Time</span>
                <span>Type</span>
                <span>Amount</span>
                <span>Price</span>
              </div>
              {orderHistory.map((order) => (
                <div key={order.id} className={`history-row ${order.type.toLowerCase()}`}>
                  <span>{order.timestamp}</span>
                  <span className={order.type.toLowerCase()}>{order.type}</span>
                  <span>{order.amount.toFixed(2)}</span>
                  <span>${order.price.toFixed(4)}</span>
                </div>
              ))}
              {orderHistory.length === 0 && (
                <div className="no-orders">No orders yet</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Result Modal */}
      {showResultModal && (
        <div className="result-modal-overlay">
          <div className="result-modal">
            <h2 className="result-title">
              {resultData.reason === 'crash' ? '💥 CRASH!' : 
               resultData.reason === 'sold' ? '💰 SOLD!' : '💸 LIQUIDATED!'}
            </h2>
            <div className="result-content">
              <p className="result-message">
                {resultData.reason === 'crash' ? 'The memecoin crashed 100%!' :
                 resultData.reason === 'sold' ? 'You sold your position!' :
                 'You were liquidated!'}
              </p>
              <div className="result-stats">
                <div className="stat-row">
                  <span>Final P/L:</span>
                  <span className={resultData.finalPercent >= 0 ? 'positive' : 'negative'}>
                    {resultData.finalPercent >= 0 ? '+' : ''}{resultData.finalPercent}%
                  </span>
                </div>
                <div className="stat-row">
                  <span>Total Value:</span>
                  <span>${resultData.totalValue}</span>
                </div>
                <div className="stat-row">
                  <span>Profit/Loss:</span>
                  <span className={resultData.profitLoss >= 0 ? 'positive' : 'negative'}>
                    {resultData.profitLoss >= 0 ? '+' : ''}${resultData.profitLoss}
                  </span>
                </div>
              </div>
            </div>
            <div className="result-actions">
              <button className="play-again-button" onClick={() => window.location.reload()}>
                Play Again
              </button>
              <button className="back-to-casino-button" onClick={handleBackToCasino}>
                Back to Casino
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemecoinSimulator; 