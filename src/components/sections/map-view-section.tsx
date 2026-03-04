'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Users, Activity } from 'lucide-react';
import Section from '~/components/ui/section';
import Button from '~/components/ui/button';
import Link from 'next/link';

const ACTIVE_MISSIONS = [
  { id: 1, title: "Flood Relief Padang", type: "Urgent", viewers: 1240, raised: "4.2M IDRX", top: "45%", left: "20%", color: "bg-red-500" },
  { id: 2, title: "Infrastructure Jakarta", type: "Infrastructure", viewers: 856, raised: "12.5M IDRX", top: "75%", left: "38%", color: "bg-aid-green" },
  { id: 3, title: "Medical Supply Palu", type: "Medical", viewers: 2300, raised: "8.1M IDRX", top: "45%", left: "55%", color: "bg-blue-500" },
];

const MapViewSection: React.FC = () => {
  return (
    <Section id="live-map" background="light">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-600 font-bold text-xs uppercase tracking-wider mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            Live Activity
        </div>
        <h2 className="font-heading font-black text-3xl md:text-5xl text-aid-dark mb-4">
          Global Aid Coordination
        </h2>
        <p className="font-body text-lg text-aid-dark/60 max-w-2xl mx-auto">
          Track verified disasters across the archipelago, view live streams from the ground, and see donations flow to specific coordinates in real-time.
        </p>
      </div>

      <div className="relative w-full aspect-[16/9] md:aspect-[2/1] bg-blue-50/50 rounded-3xl border border-aid-dark/5 shadow-2xl overflow-hidden group">
        
        <div className="absolute inset-0 flex items-center justify-center p-4 md:p-12 opacity-60">
            <svg viewBox="0 0 800 300" className="w-full h-full fill-aid-dark/20 stroke-aid-dark/10 stroke-1">
                <path d="M160,50 L200,80 L220,130 L200,160 L180,180 L140,150 L120,100 Z" className="hover:fill-aid-green/30 transition-colors duration-300" />
                <path d="M260,80 L320,60 L360,70 L350,130 L310,150 L270,140 Z" className="hover:fill-aid-green/30 transition-colors duration-300" />
                <path d="M190,190 L340,180 L380,190 L370,210 L200,220 Z" className="hover:fill-aid-green/30 transition-colors duration-300" />
                <path d="M400,100 L420,80 L440,100 L430,130 L460,120 L450,160 L420,150 L410,120 Z" className="hover:fill-aid-green/30 transition-colors duration-300" />
                <path d="M550,120 L650,110 L700,130 L720,180 L600,190 L560,160 Z" className="hover:fill-aid-green/30 transition-colors duration-300" />
                <path d="M390,210 L450,205 L480,215 L390,220 Z" className="hover:fill-aid-green/30 transition-colors duration-300" />
                <path d="M480,110 L500,100 L510,130 L490,140 Z" className="hover:fill-aid-green/30 transition-colors duration-300" />
            </svg>
             <div className="absolute inset-0 bg-[linear-gradient(rgba(101,140,88,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(101,140,88,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
        </div>

        <div className="absolute top-6 left-6 z-20 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-aid-dark/10 hidden md:block">
             <div className="flex items-center gap-3 mb-3">
                <Activity className="text-aid-green w-5 h-5" />
                <span className="font-heading font-bold text-aid-dark">Platform Activity</span>
             </div>
             <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-8">
                    <span className="text-aid-dark/60">Active Missions</span>
                    <span className="font-bold text-aid-dark">24</span>
                </div>
                <div className="flex justify-between gap-8">
                    <span className="text-aid-dark/60">Donations (24h)</span>
                    <span className="font-bold text-aid-dark">145M IDRX</span>
                </div>
             </div>
        </div>

        {ACTIVE_MISSIONS.map((mission) => (
            <motion.div
                key={mission.id}
                className="absolute z-10 cursor-pointer"
                style={{ top: mission.top, left: mission.left }}
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", delay: 0.2 * mission.id }}
            >
                <div className="relative group/pin">
                    <div className={`absolute -inset-4 rounded-full opacity-30 animate-pulse ${mission.color}`}></div>
                    <div className={`relative w-8 h-8 rounded-full ${mission.color} border-4 border-white shadow-lg flex items-center justify-center text-white transform transition-transform group-hover/pin:scale-110`}>
                        <MapPin size={14} fill="currentColor" />
                    </div>
                    
                    <div className="absolute left-1/2 bottom-full mb-3 -translate-x-1/2 w-48 bg-white p-3 rounded-lg shadow-xl border border-aid-dark/5 opacity-0 group-hover/pin:opacity-100 transition-opacity pointer-events-none z-30 transform translate-y-2 group-hover/pin:translate-y-0">
                        <div className="text-xs font-bold text-aid-dark/40 uppercase mb-1">{mission.type}</div>
                        <div className="font-heading font-bold text-aid-dark text-sm mb-2">{mission.title}</div>
                        <div className="flex items-center justify-between text-xs text-aid-dark/70 bg-aid-offwhite p-2 rounded">
                            <span className="flex items-center gap-1"><Users size={10} /> {mission.viewers}</span>
                            <span className="font-bold text-aid-green">{mission.raised}</span>
                        </div>
                        <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white transform rotate-45 border-b border-r border-aid-dark/5"></div>
                    </div>
                </div>
            </motion.div>
        ))}

        <div className="absolute bottom-6 right-6 flex flex-col gap-2">
            <button className="p-2 bg-white rounded-lg shadow-md hover:bg-aid-offwhite text-aid-dark transition-colors">
                <Navigation size={20} />
            </button>
        </div>
      </div>

      <div className="mt-12 text-center">
        <Link href="/explore">
          <Button variant="primary" size="lg">
              View Live Map
          </Button>
        </Link>
      </div>
    </Section>
  );
};

export default MapViewSection;
