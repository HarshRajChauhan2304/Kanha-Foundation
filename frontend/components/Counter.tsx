"use client";
import React, { useState, useEffect } from 'react';

interface CounterProps {
  target?: number; // final number to count to
  initial?: number; // start number, default 0
  prefix?: string; // e.g., "₹"
  suffix?: string; // e.g., " Cr+"
  duration?: number; // animation duration in ms (default 2000)
  decimals?: number; // number of decimal places (default 0)
  className?: string; // custom classes for text styling
}

export default function Counter({ 
  target = 0, 
  initial = 0, 
  prefix = '', 
  suffix = '', 
  duration = 2000,
  decimals = 0,
  className = 'text-xl md:text-2xl font-extrabold text-white'
}: CounterProps) {
  const [count, setCount] = useState(initial);

  useEffect(() => {
    if (target <= initial) {
      setCount(target);
      return;
    }

    const startTime = performance.now();
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      if (elapsedTime >= duration) {
        setCount(target);
      } else {
        const progress = elapsedTime / duration;
        // Ease out quadratic
        const easeOutProgress = progress * (2 - progress);
        const currentCount = initial + (target - initial) * easeOutProgress;
        setCount(currentCount);
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [target, initial, duration]);

  const formattedCount = count.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });

  return (
    <div className="flex items-center space-x-0.5">
      {prefix && <span className={className}>{prefix}</span>}
      <span className={className}>{formattedCount}</span>
      {suffix && <span className={className}>{suffix}</span>}
    </div>
  );
}
