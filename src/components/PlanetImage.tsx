import React, { useState } from 'react';

interface PlanetImageProps {
  src: string;
  alt: string;
  className?: string;
  color: string;
}

export default function PlanetImage({ src, alt, className, color }: PlanetImageProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (error) {
    return (
      <div 
        className={`${className} flex items-center justify-center overflow-hidden relative`}
        style={{
          background: `radial-gradient(circle at 30% 30%, ${color}, #000)`,
          boxShadow: `0 0 60px ${color}40`
        }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(circle at 70% 70%, rgba(0,0,0,0.5) 0%, transparent 50%)'
        }} />
      </div>
    );
  }

  return (
    <div className={`${className} relative`}>
      {!loaded && (
        <div className="absolute inset-0 bg-white/5 animate-pulse rounded-full" />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
        onError={() => setError(true)}
        onLoad={() => setLoaded(true)}
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
