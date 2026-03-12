'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    className = '',
    disabled,
    ...props
  }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-heading font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";

    const variants = {
      primary: "bg-aid-dark text-white hover:bg-aid-green focus:ring-aid-green shadow-md hover:shadow-lg",
      secondary: "bg-aid-green text-white hover:bg-aid-dark focus:ring-aid-dark shadow-md hover:shadow-lg",
      outline: "border-2 border-aid-dark/20 text-aid-dark hover:bg-aid-dark hover:text-white hover:border-aid-dark focus:ring-aid-dark bg-transparent",
      ghost: "text-aid-dark hover:bg-aid-dark/5 focus:ring-aid-dark/20 bg-transparent",
      danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 shadow-md hover:shadow-lg shadow-red-500/20",
      success: "bg-aid-green text-white hover:bg-aid-dark focus:ring-aid-green shadow-md hover:shadow-lg",
    };

    const sizes = {
      sm: "px-4 py-2 text-sm rounded-xl gap-1.5",
      md: "px-6 py-3 text-base rounded-2xl gap-2",
      lg: "px-8 py-4 text-lg rounded-2xl gap-2",
      xl: "px-10 py-5 text-xl rounded-3xl gap-3",
      icon: "w-10 h-10 rounded-full p-0",
    };

    const loadingSpinner = (
      <Loader2 className="w-4 h-4 animate-spin" />
    );

    return (
      <button 
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading ? (
          <>
            {loadingSpinner}
            {children && <span>{children}</span>}
          </>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children && <span>{children}</span>}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
