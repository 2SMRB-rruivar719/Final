import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles =
    'px-6 py-3 rounded-xl font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-travel-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white';
  
  const variants = {
    primary: 'bg-travel-primary text-white shadow-md hover:shadow-lg hover:bg-opacity-95',
    secondary: 'bg-travel-secondary text-travel-dark shadow-sm hover:shadow-md hover:bg-opacity-95',
    outline: 'border-2 border-travel-primary text-travel-primary hover:bg-travel-primary hover:text-white hover:shadow-md',
    ghost: 'bg-transparent text-travel-accent hover:bg-gray-100',
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};