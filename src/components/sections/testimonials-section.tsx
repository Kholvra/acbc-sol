'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import Image from 'next/image';
import { TESTIMONIALS } from '~/constants';
import Section from '../ui/section';

const TestimonialsSection: React.FC = () => {
  return (
    <Section id="testimonials" background="white">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div className="flex flex-col justify-center md:sticky md:top-32">
            <h2 className="font-heading font-black text-3xl md:text-5xl text-aid-dark mb-6 leading-tight">
                Real Impact <br/>
                <span className="relative inline-block">
                    Stories
                    <span className="absolute bottom-1 left-0 w-full h-3 bg-aid-yellow/50 -z-10 -rotate-1"></span>
                </span>
            </h2>
            <p className="font-body text-lg text-aid-dark/70 mb-8 max-w-md">
                See how AidBeacon is changing the way disaster relief is funded and delivered worldwide through decentralized transparency.
            </p>
            <div className="w-24 h-1.5 bg-aid-green rounded-full"></div>
        </div>

        <div className="space-y-10">
            {TESTIMONIALS.map((testimonial, index) => (
                <motion.div 
                    key={testimonial.id}
                    initial={{ opacity: 0, x: 50, rotateY: 10 }}
                    whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                    transition={{ duration: 0.7, delay: index * 0.2, type: "spring" }}
                    viewport={{ once: true }}
                    className="group relative bg-white p-8 md:p-10 rounded-2xl border-2 border-aid-dark/10 shadow-[8px_8px_0px_0px_#BBC863] hover:shadow-[14px_14px_0px_0px_#658C58] hover:-translate-y-1 hover:-translate-x-1 transition-all duration-300 transform perspective-1000"
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-aid-light to-transparent rounded-tr-xl rounded-bl-[4rem] -z-0 opacity-50"></div>

                    <Quote className="absolute top-8 right-8 text-aid-green/20 w-16 h-16 -z-0 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
                    
                    <div className="relative z-10">
                        <p className="font-accent text-xl md:text-2xl text-aid-dark italic mb-8 leading-relaxed">
                            &ldquo;{testimonial.quote}&rdquo;
                        </p>
                        
                        <div className="flex items-center gap-5 pt-6 border-t-2 border-aid-offwhite">
                            <div className="relative">
                                <div className="absolute inset-0 bg-aid-green rounded-full blur-sm opacity-30 translate-y-1"></div>
                                <div className="relative w-14 h-14 rounded-full bg-aid-yellow ring-4 ring-white shadow-sm overflow-hidden">
                                    <Image src={`https://picsum.photos/seed/${testimonial.id}/100`} alt={testimonial.author} width={56} height={56} className="w-full h-full object-cover" />
                                </div>
                            </div>
                            <div>
                                <h4 className="font-heading font-bold text-lg text-aid-dark">{testimonial.author}</h4>
                                <p className="font-body text-xs font-bold text-aid-green uppercase tracking-wider bg-aid-green/10 px-2 py-0.5 rounded inline-block mt-1">
                                    {testimonial.role}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
      </div>
    </Section>
  );
};

export default TestimonialsSection;
