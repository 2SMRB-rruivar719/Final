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
            <mask id="globeMask">
              <circle cx="100" cy="100" r="90" fill="white" />
            </mask>
          </defs>
          
          {/* Globe Background with Stripes */}
          <g mask="url(#globeMask)">
            {/* Top - Cream */}
            <rect x="0" y="0" width="200" height="75" fill="#f4e8c1" />
            {/* Middle - Green */}
            <rect x="0" y="75" width="200" height="55" fill="#a0c1b9" />
            {/* Bottom - Dark Blue */}
            <rect x="0" y="130" width="200" height="70" fill="#4a6fa5" /> 
          </g>

          {/* Dotted Line Trail */}
          <path 
            d="M 170 60 Q 150 20 80 80" 
            stroke="#70a0af" 
            strokeWidth="5" 
            strokeLinecap="round"
            strokeDasharray="0 10"
            fill="none"
          />
          <circle cx="175" cy="55" r="3" fill="#70a0af" />
          <circle cx="165" cy="45" r="3" fill="#70a0af" />
          <circle cx="150" cy="35" r="3" fill="#70a0af" />
          <circle cx="130" cy="35" r="3" fill="#70a0af" />
          <circle cx="110" cy="45" r="3" fill="#70a0af" />

          {/* Small Plane (Top Right) */}
          <path 
            d="M175 60 L185 55 L182 65 L190 70 L180 75 L178 85 L170 75 Z" 
            fill="#a0c1b9" 
            stroke="white" 
            strokeWidth="2"
          />

          {/* Main Swoosh (Arrow around globe) */}
          <path 
            d="M 30 130 C 30 130, 80 180, 160 100" 
            stroke="#70a0af" 
            strokeWidth="16" 
            strokeLinecap="round"
            fill="none"
            strokeOpacity="1"
          />
          
          {/* Inner stroke of swoosh for detail */}
           <path 
            d="M 30 130 C 30 130, 80 180, 160 100" 
            stroke="white" 
            strokeWidth="4" 
            strokeLinecap="round"
            fill="none"
            opacity="0.3"
          />

          {/* Main Plane (White) */}
          <g transform="translate(155, 95) rotate(-45)">
            <path 
              d="M 0 -5 L 5 5 L 0 3 L -5 5 Z" 
              transform="scale(3.5)"
              fill="white" 
              stroke="#70a0af" 
              strokeWidth="0.5"
            />
          </g>
        </svg>
      )}
      
      {showText && (
        <div className={`flex items-center justify-center gap-1 ${showIcon ? 'mt-2' : ''}`}>
          <span className="text-4xl font-bold text-[#4a6fa5] dark:text-slate-100 tracking-tight drop-shadow-sm" style={{ fontFamily: 'sans-serif' }}>Travel</span>
          {/* Handshake Icon */}
          <div className="flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-1">
               <path d="M18 6.00003L15.34 8.66003C15.93 9.61003 16.41 10.66 16.71 11.78L19.29 9.20003C19.68 8.81003 19.68 8.18003 19.29 7.79003L18.21 6.71003C18.12 6.62003 18 6.57003 17.88 6.57003C17.75 6.57003 17.63 6.62003 17.54 6.71003L18 6.00003Z" fill="#4a6fa5" opacity="0.6"/>
               <path d="M12.02 20.37L13.88 21.61C14.36 21.93 15 21.78 15.3 21.28L21.71 10.13C21.84 9.90003 21.83 9.62003 21.68 9.40003C21.53 9.18003 21.28 9.06003 21.02 9.10003L18.17 9.54003C17.89 8.28003 17.34 7.10003 16.65 6.04003L15.83 5.22003C15.24 4.63003 14.3 4.63003 13.71 5.22003L8.05001 10.88C7.57001 11.36 7.50001 12.11 7.89001 12.67L10.32 16.14L9.12001 17.94C8.80001 18.42 8.95001 19.06 9.43001 19.38L11.29 20.62C11.51 20.77 11.8 20.73 12.02 20.37Z" fill="#a0c1b9"/>
               <path d="M9.79 15.38L7.36 11.91C6.97 11.35 7.04 10.6 7.52 10.12L13.18 4.46C13.77 3.87 14.71 3.87 15.3 4.46L16.12 5.28C15.08 3.96 13.56 2.99 11.83 2.58C9.53 2.03 7.07 2.45 5.14 3.73C4.24 4.33 3.51 5.15 3.03 6.11C2.56 7.06 2.37 8.13 2.49 9.19C2.65 10.65 3.37 11.98 4.48 12.98L7.42 16.89C7.86 17.48 8.68 17.62 9.29 17.21L9.79 15.38Z" fill="#4a6fa5"/>
            </svg>
          </div>
          <span className="text-4xl font-bold text-[#a0c1b9] dark:text-[#b8ddd4] tracking-tight drop-shadow-sm" style={{ fontFamily: 'sans-serif' }}>Match</span>
        </div>
      )}
    </div>
  );
};