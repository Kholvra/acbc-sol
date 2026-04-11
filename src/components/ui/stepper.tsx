import React from 'react';
import { Check } from 'lucide-react';

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
    <div className={`relative mb-12 max-w-md mx-auto ${className}`}>
      <div className="absolute top-5 left-8 right-8 h-0.5 bg-gray-200 rounded-full" />

      <div
        className="absolute top-5 left-8 h-0.5 bg-aid-green transition-all duration-500 ease-out rounded-full"
        style={{
          width: `calc(${((currentStep - 1) / (steps.length - 1)) * 100}% - 4rem)`,
          maxWidth: 'calc(100% - 4rem)',
        }}
      />

      <div className="flex justify-between items-start relative z-10">
        {steps.map((step) => {
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;

          return (
            <div key={step.id} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-heading font-bold text-sm transition-all duration-300
                  ${isCompleted 
                    ? 'bg-aid-green text-white' 
                    : isActive 
                      ? 'bg-aid-dark text-white ring-4 ring-aid-dark/20' 
                      : 'bg-white text-gray-400 border-2 border-gray-200'
                  }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={`mt-2 text-xs font-heading font-bold transition-colors duration-300
                  ${isCompleted || isActive ? 'text-aid-dark' : 'text-gray-400'}`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Stepper;
