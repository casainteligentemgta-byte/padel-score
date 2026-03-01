'use client';

import React, { useState, useEffect, useRef } from 'react';

interface AutoShrinkNameProps {
  name: string;
  className?: string; // Para que le pases tus clases de Tailwind (color, font-bold, etc.)
  style?: React.CSSProperties; // Opcional: fontSize, etc.
}

const AutoShrinkName: React.FC<AutoShrinkNameProps> = ({ name, className = '', style: customStyle }) => {
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const resizeText = () => {
      if (containerRef.current && textRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const textWidth = textRef.current.scrollWidth;

        if (textWidth > containerWidth) {
          const ratio = containerWidth / textWidth;
          setScale(Math.max(ratio, 0.5));
        } else {
          setScale(1);
        }
      }
    };

    resizeText();
    window.addEventListener('resize', resizeText);
    return () => window.removeEventListener('resize', resizeText);
  }, [name]);

  return (
    <div
      ref={containerRef}
      className={`w-full overflow-hidden whitespace-nowrap ${className}`}
      style={{ display: 'flex', alignItems: 'center' }}
    >
      <span
        ref={textRef}
        style={{
          display: 'inline-block',
          transformOrigin: 'left center',
          transform: `scale(${scale})`,
          transition: 'transform 0.1s ease-out',
          ...customStyle,
        }}
      >
        {name}
      </span>
    </div>
  );
};

export default AutoShrinkName;
