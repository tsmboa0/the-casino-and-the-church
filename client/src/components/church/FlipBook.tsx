import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAudio } from "../../lib/stores/useAudio";
import "../../styles/church-flipbook.css";

export type FlipPage = {
  id: string;
  title: string;
  subtitle?: string;
  art?: string;
  route?: string;
  comingSoon?: boolean;
};

type Props = {
  pages: FlipPage[];
  onSelect: (page: FlipPage) => void;
};

const FlipBook: React.FC<Props> = ({ pages, onSelect }) => {
  const { playHit } = useAudio();
  const [index, setIndex] = useState(0); // left page index
  const [isFlipping, setIsFlipping] = useState(false);
  // direction: 'ltor' = flip a left page onto the right (go to previous)
  // 'rtol' = flip a right page onto the left (go to next)
  const [direction, setDirection] = useState<"ltor" | "rtol" | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const leftPage = pages[index];
  const rightPage = pages[index + 1];

  const canPrev = index > 0 && !isFlipping;
  const canNext = index + 2 < pages.length && !isFlipping;

  const handlePrev = () => {
    if (!canPrev) return;
    playHit();
    setDirection("ltor");
    setIsFlipping(true);
    setTimeout(() => {
      setIndex((i) => Math.max(0, i - 2));
      setIsFlipping(false);
      setDirection(null);
    }, 560);
  };

  const handleNext = () => {
    if (!canNext) return;
    playHit();
    setDirection("rtol");
    setIsFlipping(true);
    setTimeout(() => {
      setIndex((i) => Math.min(pages.length - 2, i + 2));
      setIsFlipping(false);
      setDirection(null);
    }, 560);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [canPrev, canNext]);

  // Simple swipe
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let startX = 0;
    let active = false;
    const down = (e: PointerEvent) => { active = true; startX = e.clientX; };
    const up = (e: PointerEvent) => {
      if (!active) return; active = false;
      const dx = e.clientX - startX;
      if (dx > 40) handlePrev();
      else if (dx < -40) handleNext();
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointerup", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointerup", up);
    };
  }, [canPrev, canNext]);

  return (
    <div className="flipbook" ref={containerRef}>
      <button className="book-control left" onClick={handlePrev} aria-label="Previous pages" disabled={!canPrev}>◀</button>
      <button className="book-control right" onClick={handleNext} aria-label="Next pages" disabled={!canNext}>▶</button>

      <div className={`book-stage ${isFlipping ? `flipping-${direction}` : ""}`}>
        <div className="book-spine"></div>

        <div className="page left">
          {leftPage && (
            <div className="page-content">
              {leftPage.art && <img className="page-art" src={leftPage.art} alt="quest" />}
              <div className="page-title" style={{ color: '#3f3f3f' }}>{leftPage.title}</div>
              {leftPage.subtitle && <div className="page-sub">{leftPage.subtitle}</div>}
              <button className="page-btn" onClick={() => onSelect(leftPage)}>Begin</button>
            </div>
          )}
        </div>

        <div className="page right">
          {rightPage && (
            <div className="page-content">
              {rightPage.art && <img className="page-art" src={rightPage.art} alt="quest" />}
              <div className="page-title" style={{ color: '#3f3f3f' }}>{rightPage.title}</div>
              {rightPage.subtitle && <div className="page-sub">{rightPage.subtitle}</div>}
              <button className="page-btn" onClick={() => onSelect(rightPage)}>Begin</button>
            </div>
          )}
        </div>

        {/* turning page visual */}
        {direction && <div className={`turning ${direction === 'ltor' ? 'from-left' : 'from-right'}`}></div>}
      </div>
    </div>
  );
};

export default FlipBook;


