'use client';

import React from 'react';
import Section from '../ui/section';

const PartnersSection: React.FC = () => {
  return (
    <Section id="partners" background="white" hasDivider={false} className="py-16">
      <div className="text-center">
        <p className="font-body font-bold text-aid-dark/40 uppercase tracking-widest text-sm mb-8">
            Trusted By & Built On
        </p>
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <h3 className="text-2xl font-heading font-black text-aid-dark flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-blue-500"></span> BASE
            </h3>
            <h3 className="text-2xl font-heading font-black text-aid-dark flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-indigo-600"></span> COINBASE
            </h3>
             <h3 className="text-2xl font-heading font-black text-aid-dark flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-green-600"></span> RED CROSS
            </h3>
             <h3 className="text-2xl font-heading font-black text-aid-dark flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-purple-600"></span> UNISWAP
            </h3>
        </div>
      </div>
    </Section>
  );
};

export default PartnersSection;
