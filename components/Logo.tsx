import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'icon' | 'text' | 'full';
}

export const Logo: React.FC<LogoProps> = ({ className = "w-32 h-32", variant = 'full' }) => {
  const showIcon = variant === 'icon' || variant === 'full';
  const showText = variant === 'text' || variant === 'full';

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {showIcon && (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${showText ? 'h-[80%]' : 'h-full'} w-full object-contain`}>
          <defs>
            <mask id="studyMask">
              <circle cx="100" cy="100" r="90" fill="white" />
            </mask>
            <linearGradient id="indigoGrad" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
          </defs>
          
          {/* Background Circle */}
          <circle cx="100" cy="100" r="90" fill="url(#indigoGrad)" mask="url(#studyMask)" />
          
          {/* Sparkles / Magic Study Stars */}
          <path d="M 50 45 L 53 52 L 60 55 L 53 58 L 50 65 L 47 58 L 40 55 L 47 52 Z" fill="#22d3ee" />
          <path d="M 150 45 L 152 50 L 157 52 L 152 54 L 150 59 L 148 54 L 143 52 L 148 50 Z" fill="#22d3ee" opacity="0.8" />
          <path d="M 140 140 L 143 147 L 150 150 L 143 153 L 140 160 L 137 153 L 130 150 L 137 147 Z" fill="#22d3ee" />

          {/* Graduation Cap Base (Shadow) */}
          <path d="M 60 115 L 60 132 C 60 142, 140 142, 140 132 L 140 115 Z" fill="#312e81" />
          
          {/* Graduation Cap Base (Front) */}
          <path d="M 65 110 L 65 125 C 65 135, 135 135, 135 125 L 135 110 Z" fill="#1e1b4b" stroke="#818cf8" strokeWidth="3" />
          
          {/* Graduation Cap Rhombus (Top Plate) */}
          <path d="M 100 65 L 165 92 L 100 119 L 35 92 Z" fill="#1e1b4b" stroke="#e0e7ff" strokeWidth="5" strokeLinejoin="round" />
          
          {/* Tassel String */}
          <path d="M 100 92 L 145 105 L 152 135" stroke="#fbbf24" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          
          {/* Tassel Fringe */}
          <path d="M 148 135 L 156 135 L 152 147 Z" fill="#fbbf24" />
          
          {/* Book or Shield details */}
          <circle cx="100" cy="92" r="6" fill="#fbbf24" />
        </svg>
      )}
      
      {showText && (
        <div className={`flex items-center justify-center gap-1 ${showIcon ? 'mt-2' : ''}`}>
          <span className="text-4xl font-bold text-[#6366f1] dark:text-slate-100 tracking-tight drop-shadow-sm" style={{ fontFamily: 'sans-serif' }}>Study</span>
          {/* Academic Book/Graduation Icon */}
          <div className="flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-1">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#6366f1" />
              <path d="M2 17L12 22L22 17" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-4xl font-bold text-[#14b8a6] dark:text-[#5eead4] tracking-tight drop-shadow-sm" style={{ fontFamily: 'sans-serif' }}>Match</span>
        </div>
      )}
    </div>
  );
};