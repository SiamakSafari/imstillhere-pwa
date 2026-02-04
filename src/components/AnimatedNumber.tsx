"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function AnimatedNumber({
  value,
  duration = 800,
  className,
  style,
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value);
  const displayRef = useRef(value);

  useEffect(() => {
    const startValue = displayRef.current;
    if (startValue === value) return;

    const steps = Math.min(Math.abs(value - startValue), 60);
    const stepDuration = duration / Math.max(steps, 1);
    let step = 0;

    const interval = setInterval(() => {
      step++;
      const t = step / steps;
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(startValue + (value - startValue) * eased);
      setDisplay(current);

      if (step >= steps) {
        clearInterval(interval);
        setDisplay(value);
        displayRef.current = value;
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [value, duration]);

  return (
    <span className={className} style={style}>
      {display}
    </span>
  );
}
