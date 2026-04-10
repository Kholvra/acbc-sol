'use client';

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { PlayCircle, ArrowRight, Heart, MapPin, Shield } from 'lucide-react';
import Button from '../ui/button';
import Section from '../ui/section';

const HeroSection: React.FC = () => {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    
    const floatingAnimation = {
        y: [0, -15, 0],
        rotate: [0, 2, -2, 0],
        transition: {
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut" as const
        }
    };

    const floatingAnimationDelayed = {
        y: [0, -20, 0],
        rotate: [0, -2, 2, 0],
        transition: {
            duration: 6,
            delay: 1,
            repeat: Infinity,
            ease: "easeInOut" as const
        }
    };

  return (
    <Section id="home" background="yellow" className="pt-32 md:pt-48 pb-24 md:pb-32 overflow-hidden relative">
      <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
        
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8 md:pr-8"
        >
            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-md border border-aid-dark/10 text-aid-dark font-bold text-xs uppercase tracking-wider shadow-sm"
            >
                <span className="w-2 h-2 rounded-full bg-aid-green animate-pulse"></span>
                Global Relief Network
            </motion.div>
            
          <h1 className="font-heading font-black text-5xl md:text-7xl leading-[1.0] text-aid-dark tracking-tight">
            Empower <span className="text-[#658C58] drop-shadow-sm">Real-Time</span> Aid
          </h1>
          
          <p className="font-body text-xl md:text-2xl text-aid-dark/70 leading-relaxed max-w-lg">
            Transparent crowdfunding on Base. Post reels, go live, and track relief efforts on interactive maps.
          </p>
          
          <div className="flex flex-col sm:row gap-4 pt-4">
            <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />} className="group shadow-xl shadow-aid-green/20 hover:shadow-aid-green/40 transition-shadow">
              Start a Campaign
            </Button>
            <Button variant="outline" size="lg" leftIcon={<PlayCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />} className="group bg-white/50 backdrop-blur-sm hover:bg-white/80">
              Watch Demo
            </Button>
          </div>
          
          <div className="flex items-center gap-4 text-sm font-bold text-aid-dark/50 pt-4">
              <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] overflow-hidden">
                          <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                      </div>
                  ))}
              </div>
              <p>Trusted by 10,000+ donors</p>
          </div>
        </motion.div>

        <motion.div 
           style={{ y: y1 }}
           className="relative h-[650px] hidden md:flex items-center justify-center"
        >
             <motion.div
                initial={{ rotateY: 15, rotateX: 5 }}
                animate={{ rotateY: [15, -10, 15], rotateX: [5, -5, 5] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" as const }}
                style={{ transformStyle: "preserve-3d" }}
                className="relative w-[320px] h-[640px]"
             >
                <div className="absolute inset-0 bg-gray-900 rounded-[3rem] border-[10px] border-[#658C58] shadow-2xl flex flex-col overflow-hidden z-10" 
                     style={{ transform: "translateZ(0px)", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}>
                    
                    <div className="absolute -right-[12px] top-32 w-[12px] h-20 bg-[#557848] rounded-r-md"></div>
                    <div className="absolute -left-[12px] top-32 w-[12px] h-10 bg-[#557848] rounded-l-md"></div>
                    <div className="absolute -left-[12px] top-44 w-[12px] h-10 bg-[#557848] rounded-l-md"></div>

                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-black rounded-full z-30 flex items-center justify-center gap-3">
                        <div className="w-16 h-4 bg-gray-800 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                    </div>

                    <div className="flex-1 relative bg-gray-800">
                         <img 
                            src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80" 
                            alt="Disaster Relief" 
                            className="w-full h-full object-cover opacity-80"
                         />
                         <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80"></div>
                         
                         <div className="absolute top-24 right-4 flex flex-col gap-3">
                             <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center">
                                 <Heart size={20} className="text-red-500 fill-red-500" />
                             </div>
                             <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center">
                                 <MapPin size={20} className="text-aid-green" />
                             </div>
                         </div>

                         <div className="absolute top-24 left-4 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded animate-pulse">
                            LIVE
                         </div>
                    </div>
                    
                    <div className="h-[220px] bg-white/10 backdrop-blur-xl border-t border-white/10 p-5 space-y-4 absolute bottom-0 w-full z-20">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-yellow-400 border-2 border-white shadow-lg overflow-hidden">
                                <img src="https://i.pravatar.cc/100?img=33" alt="Host" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm">Emergency Relief Fund</h3>
                                <p className="text-white/60 text-xs">@RedCrossBase</p>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                             <div className="flex justify-between text-xs font-bold text-white/80">
                                 <span>Raised</span>
                                 <span>Goal: 200M IDRX</span>
                             </div>
                             <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                                 <div className="h-full w-2/3 bg-aid-green shadow-[0_0_10px_rgba(187,200,99,0.5)]"></div>
                             </div>
                             <div className="font-mono text-xl font-black text-aid-green">125,450,000 IDRX</div>
                        </div>
                        
                        <Button size="sm" className="w-full bg-white text-aid-dark hover:bg-aid-green hover:text-white border-none shadow-lg mt-2">
                            Donate Now
                        </Button>
                    </div>
                </div>

                <motion.div 
                    animate={floatingAnimation}
                    style={{ transform: "translateZ(80px)" }}
                    className="absolute -right-8 top-32 bg-white rounded-2xl p-3 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-aid-dark/5 flex items-center gap-3 w-52 z-30"
                >
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 shadow-sm flex-shrink-0">
                        <Shield size={18} fill="currentColor" className="text-green-500 opacity-20 absolute" />
                        <Shield size={18} className="relative z-10" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Just Donated</p>
                        <p className="font-bold text-aid-dark text-sm">+250,000 IDRX</p>
                    </div>
                </motion.div>

                <motion.div 
                    animate={floatingAnimationDelayed}
                    style={{ transform: "translateZ(60px)" }}
                    className="absolute -left-12 bottom-48 bg-white rounded-2xl p-3 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-aid-dark/5 flex items-center gap-3 w-48 z-30"
                >
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm flex-shrink-0">
                        <MapPin size={18} fill="currentColor" className="text-blue-500 opacity-20 absolute" />
                        <MapPin size={18} className="relative z-10" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Verified Location</p>
                        <p className="font-bold text-aid-dark text-sm">Semarang, ID</p>
                    </div>
                </motion.div>
                
             </motion.div>
             
             <div className="absolute inset-0 bg-aid-green/20 blur-[100px] -z-10 rounded-full opacity-60"></div>
        </motion.div>
      </div>
    </Section>
  );
};

export default HeroSection;
