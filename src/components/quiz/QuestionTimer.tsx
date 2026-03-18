'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface QuestionTimerProps {
  limitSeconds: number;
  onExpire: () => void;
  isActive: boolean;
  questionKey: string; // resets when question changes
}

export default function QuestionTimer({
  limitSeconds,
  onExpire,
  isActive,
  questionKey,
}: QuestionTimerProps) {
  const remainingRef = useRef(limitSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const displayRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Reset on question change
    remainingRef.current = limitSeconds;
    if (displayRef.current) displayRef.current.textContent = String(limitSeconds);
    if (barRef.current) barRef.current.style.width = '100%';
  }, [questionKey, limitSeconds]);

  useEffect(() => {
    if (!isActive) {
      clearTimer();
      return;
    }

    intervalRef.current = setInterval(() => {
      remainingRef.current -= 1;
      const pct = (remainingRef.current / limitSeconds) * 100;

      if (displayRef.current) {
        displayRef.current.textContent = String(remainingRef.current);
      }
      if (barRef.current) {
        barRef.current.style.width = `${Math.max(0, pct)}%`;
      }

      if (remainingRef.current <= 0) {
        clearTimer();
        onExpire();
      }
    }, 1000);

    return clearTimer;
  }, [isActive, questionKey, limitSeconds, onExpire, clearTimer]);

  const pct = (remainingRef.current / limitSeconds) * 100;
  const isWarning = pct <= 33;
  const isCritical = pct <= 15;

  return (
    <div className="flex flex-col gap-2">
      <div
        className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
          isCritical
            ? 'text-rose-400'
            : isWarning
            ? 'text-amber-400'
            : 'text-indigo-400'
        }`}
      >
        {isCritical ? (
          <AlertTriangle className="w-4 h-4 animate-pulse" />
        ) : (
          <Clock className="w-4 h-4" />
        )}
        <span ref={displayRef}>{limitSeconds}</span>s
      </div>
      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden w-24">
        <div
          ref={barRef}
          className={`h-full rounded-full transition-all duration-1000 ${
            isCritical
              ? 'bg-rose-500'
              : isWarning
              ? 'bg-amber-500'
              : 'bg-indigo-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
