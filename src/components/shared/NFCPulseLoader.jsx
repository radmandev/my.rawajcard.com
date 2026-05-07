import React from 'react';

const RINGS = [
  { size: 100, color: '#38B6FF', delay: '0s', blur: true },
  { size: 80, color: '#6B3FA0', delay: '0.4s' },
  { size: 56, color: '#CC39CC', delay: '0.8s' },
  { size: 32, color: '#CC39CC', delay: '1.2s' },
];

export default function NFCPulseLoader({ fullScreen = true, className = '' }) {
  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center'
    : 'flex items-center justify-center';

  return (
    <div
      className={`${containerClasses} ${className}`.trim()}
      style={{ background: '#0D0D1E' }}
      role="status"
      aria-label="Loading"
      aria-live="polite"
    >
      <div className="relative h-[100px] w-[100px]">
        {RINGS.map((ring) => (
          <span
            key={`${ring.size}-${ring.delay}`}
            className={`nfc-loader-ring${ring.blur ? ' nfc-loader-ring--blur' : ''}`}
            style={{
              width: `${ring.size}px`,
              height: `${ring.size}px`,
              borderColor: ring.color,
              animationDelay: ring.delay,
            }}
          />
        ))}

        <span className="nfc-loader-core" />
      </div>
    </div>
  );
}
