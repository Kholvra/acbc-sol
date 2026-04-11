'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { STEPS } from '~/constants';
import Section from '../ui/section';

const HowItWorksSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 80%", "end 50%"]
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <Section id="how-it-works" background="light">
      <div className="text-center mb-20">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
        >
            <h2 className="font-heading font-black text-3xl md:text-5xl text-aid-dark mb-4">
              How AidBeacon Works
            </h2>
            <p className="font-body text-lg text-aid-dark/60 max-w-2xl mx-auto">
              Start making a difference in minutes. A streamlined process for both helping and receiving help.
            </p>
        </motion.div>
      </div>

      <div ref={containerRef} className="relative max-w-5xl mx-auto">
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1.5 bg-aid-dark/10 -translate-x-1/2 rounded-full overflow-hidden">
             <motion.div 
                style={{ scaleY, transformOrigin: "top" }}
                className="w-full h-full bg-gradient-to-b from-aid-green via-aid-yellow to-aid-green"
             />
        </div>

        <div className="space-y-20 relative">
          {STEPS.map((step, index) => (
            <StepItem key={step.id} step={step} index={index} />
          ))}
        </div>
      </div>
    </Section>
  );
};

const StepItem = ({ step, index }: { step: { id: number; title: string; description: string }, index: number }) => {
    const isEven = index % 2 === 0;

    return (
        <motion.div 
            initial={{ opacity: 0, x: isEven ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
            viewport={{ once: true, margin: "-100px" }}
            className={`flex flex-col md:flex-row items-center gap-8 ${
                !isEven ? 'md:flex-row-reverse' : ''
            }`}
        >
            <div className="flex-shrink-0 relative z-10 group cursor-default">
                <div className="absolute -inset-4 bg-aid-green/20 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-aid-light flex items-center justify-center border-4 border-white shadow-[0_0_0_4px_rgba(187,200,99,1)] relative z-10 transform transition-transform duration-300 group-hover:scale-110">
                    <span className="font-heading font-black text-2xl md:text-3xl text-aid-dark">
                        {step.id}
                    </span>
                </div>
            </div>

            <div className={`flex-1 text-center ${isEven ? 'md:text-right' : 'md:text-left'}`}>
                <motion.div 
                    whileHover={{ y: -5 }}
                    className={`inline-block p-6 md:p-8 bg-white rounded-2xl shadow-lg shadow-aid-dark/5 border border-aid-dark/5 relative
                        ${isEven 
                            ? 'md:rounded-tr-none md:mr-4' 
                            : 'md:rounded-tl-none md:ml-4'
                        }
                    `}
                >
                    <div className={`hidden md:block absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-b border-l border-aid-dark/5 transform rotate-45
                        ${isEven 
                            ? '-right-2 border-l-0 border-t border-r border-b-0' 
                            : '-left-2'
                        }
                    `}></div>

                    <h3 className="font-heading font-bold text-xl md:text-2xl text-aid-dark mb-3">
                        {step.title}
                    </h3>
                    <p className="font-body text-aid-dark/70 text-base md:text-lg leading-relaxed">
                        {step.description}
                    </p>
                </motion.div>
            </div>

            <div className="hidden md:block flex-1" />
        </motion.div>
    )
}

export default HowItWorksSection;
