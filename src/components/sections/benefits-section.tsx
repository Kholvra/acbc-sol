'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { BENEFITS } from '~/constants';
import Section from '../ui/section';

const BenefitsSection: React.FC = () => {
  return (
    <Section id="benefits" background="yellow" className="py-24">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 md:p-16 shadow-xl shadow-aid-dark/5">
        <div className="text-center mb-12">
            <h2 className="font-heading font-black text-3xl md:text-4xl text-aid-dark mb-4">
            Why Choose AidBeacon?
            </h2>
            <p className="font-body text-lg text-aid-dark/60">
            Built for the future of humanitarian aid.
            </p>
        </div>

        <div className="grid md:grid-cols-2 gap-y-6 gap-x-12">
            {BENEFITS.map((benefit) => (
                <div key={benefit.id} className="flex items-start gap-4">
                    <CheckCircle2 className="text-aid-green w-6 h-6 flex-shrink-0 mt-1" />
                    <span className="font-heading font-bold text-lg text-aid-dark">
                        {benefit.text}
                    </span>
                </div>
            ))}
             <div className="flex items-start gap-4 opacity-50">
                    <CheckCircle2 className="text-aid-dark w-6 h-6 flex-shrink-0 mt-1" />
                    <span className="font-heading font-bold text-lg text-aid-dark">
                        Global NGO Partnerships (Coming 2025)
                    </span>
             </div>
        </div>
      </div>
    </Section>
  );
};

export default BenefitsSection;
