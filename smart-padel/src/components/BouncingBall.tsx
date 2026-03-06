'use client';

interface BouncingBallProps {
  /** Diámetro de la pelota en px. Default: 36 */
  size?: number;
  /** Duración total de un ciclo de rebote en ms. Default: 700 */
  duration?: number;
  /** Altura del rebote relativa al tamaño. Default: 2.2 */
  bounceHeight?: number;
}

export function BouncingBall({ size = 36, duration = 700, bounceHeight = 2.2 }: BouncingBallProps) {
  const travel = size * bounceHeight;
  const shadowBase = size * 0.55;
  const animId = `bb-${size}-${duration}`;

  return (
    <>
      <style>{`
        .${animId}-wrap {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          height: ${travel + size + size * 0.28}px;
          width: ${size * 1.2}px;
          position: relative;
          flex-shrink: 0;
          margin-bottom: 2px;
        }

        .${animId}-ball {
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          background: radial-gradient(
            circle at 35% 32%,
            #e8ff6a 0%,
            #c8f400 38%,
            #86b000 75%,
            #5a7800 100%
          );
          box-shadow:
            inset -3px -4px 8px rgba(0,0,0,0.35),
            inset 2px 2px 6px rgba(255,255,180,0.45),
            0 0 ${size * 0.3}px rgba(180,255,0,0.25);
          position: relative;
          flex-shrink: 0;
          transform-origin: center bottom;
          animation: ${animId}-bounce ${duration}ms cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }

        .${animId}-ball::before,
        .${animId}-ball::after {
          content: '';
          position: absolute;
          border: 1.5px solid rgba(255,255,255,0.18);
          border-radius: 50%;
        }
        .${animId}-ball::before {
          width: 55%;
          height: 100%;
          left: 22%;
          top: 0;
          border-left-color: transparent;
          border-right-color: transparent;
          transform: rotate(12deg);
        }
        .${animId}-ball::after {
          width: 100%;
          height: 55%;
          left: 0;
          top: 22%;
          border-top-color: transparent;
          border-bottom-color: transparent;
          transform: rotate(-12deg);
        }

        .${animId}-shadow {
          width: ${shadowBase}px;
          height: ${size * 0.14}px;
          background: radial-gradient(ellipse, rgba(180,255,0,0.45) 0%, rgba(0,0,0,0) 75%);
          border-radius: 50%;
          flex-shrink: 0;
          animation: ${animId}-shadow ${duration}ms cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }

        @keyframes ${animId}-bounce {
          0%   { transform: translateY(0px) scaleX(1) scaleY(1); }
          15%  { transform: translateY(-${travel * 0.25}px) scaleX(1) scaleY(1); }
          45%  { transform: translateY(-${travel}px) scaleX(1) scaleY(1); }
          75%  { transform: translateY(-${travel * 0.05}px) scaleX(1) scaleY(1); }
          88%  { transform: translateY(${size * 0.05}px) scaleX(1.22) scaleY(0.82); }
          100% { transform: translateY(0px) scaleX(1) scaleY(1); }
        }

        @keyframes ${animId}-shadow {
          0%   { transform: scaleX(1);    opacity: 0.65; }
          15%  { transform: scaleX(0.75); opacity: 0.4;  }
          45%  { transform: scaleX(0.35); opacity: 0.18; }
          75%  { transform: scaleX(0.9);  opacity: 0.6;  }
          88%  { transform: scaleX(1.25); opacity: 0.85; }
          100% { transform: scaleX(1);    opacity: 0.65; }
        }
      `}</style>

      <div className={`${animId}-wrap`} role="img" aria-label="Pelota de pádel">
        <div className={`${animId}-ball`} />
        <div className={`${animId}-shadow`} style={{ marginTop: `${size * 0.05}px` }} />
      </div>
    </>
  );
}

export default BouncingBall;

