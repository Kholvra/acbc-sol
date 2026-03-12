import React from 'react';

interface Step {
  number: number;
  label: string;
  id: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className = '' }: StepperProps) {
  return (
    <div className={`relative mb-16 max-w-[320px] md:max-w-[440px] mx-auto px-6 ${className}`}>
      {/* Background track */}
      <div className="absolute top-6 left-[calc(24px+1.5rem)] right-[calc(24px+1.5rem)] h-1 bg-aid-dark/10 rounded-full" />

      {/* Progress fill line */}
      <div
        className="absolute top-6 left-[calc(24px+1.5rem)] h-1 bg-aid-dark transition-all duration-500 ease-out rounded-full origin-left"
        style={{
          width: `calc(100% - 3rem)`,
          transform: `scaleX(${(currentStep - 1) / (steps.length - 1)})`,
        }}
      />

      <div className="flex justify-between items-center relative z-10">
        {steps.map((step) => (
          <div key={step.id} className="flex flex-col items-center group">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-heading font-black text-lg transition-all duration-500 transform
                ${
                  currentStep >= step.number
                    ? 'bg-aid-dark text-white shadow-[0_10px_20px_rgba(0,0,0,0.15)] scale-110'
                    : 'bg-white text-aid-dark/40 border-2 border-aid-dark/20 backdrop-blur-sm'
                }`}
            >
              {step.number}
            </div>
            <span
              className={`mt-3 text-[10px] md:text-xs font-heading font-black uppercase tracking-widest transition-colors duration-500 whitespace-nowrap
                ${
                  currentStep >= step.number ? 'text-aid-dark' : 'text-aid-dark/30'
                }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Stepper;
