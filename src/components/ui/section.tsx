'use client';

import React from 'react';

interface SectionProps {
  id?: string;
  className?: string;
  children: React.ReactNode;
  hasDivider?: boolean;
  background?: 'white' | 'light' | 'yellow';
}

const Section: React.FC<SectionProps> = ({ 
  id, 
  className = '', 
  children, 
  hasDivider = true,
  background = 'white'
}) => {
  const bgColors = {
    white: 'bg-white',
    light: 'bg-aid-light',
    yellow: 'bg-aid-yellow'
  };

  return (
    <section id={id} className={`relative py-20 md:py-32 ${bgColors[background]} ${className}`}>
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        {children}
      </div>
      {hasDivider && (
        <div className="absolute bottom-0 left-0 w-full flex justify-center">
             <div className="w-11/12 md:w-3/4 h-px bg-aid-dark/10" />
        </div>
      )}
    </section>
  );
};

export default Section;
