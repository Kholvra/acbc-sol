'use client';

import React from 'react';
import { Twitter, Github, Linkedin, Radio } from 'lucide-react';
import Button from '../ui/button';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="bg-aid-dark text-white pt-20 pb-10">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Newsletter / CTA Area */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-20 pb-16 border-b border-white/10">
            <div className="max-w-xl">
                <h2 className="font-heading font-black text-3xl md:text-4xl mb-4 text-aid-yellow">
                    Ready to make a difference?
                </h2>
                <p className="font-body text-white/80 text-lg">
                    Join the AidBeacon community today. Stay updated on urgent relief missions and platform updates.
                </p>
            </div>
            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-aid-yellow w-full md:w-64"
                />
                <Button variant="secondary">
                    Subscribe
                </Button>
            </div>
        </div>

        {/* Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 md:col-span-1">
                <Link href="/" className="flex items-center gap-2 mb-6">
                    <div className="p-1.5 bg-aid-yellow rounded text-aid-dark">
                        <Radio size={20} />
                    </div>
                    <span className="font-heading font-bold text-xl tracking-tight text-white">
                        AidBeacon
                    </span>
                </Link>
                <p className="font-body text-sm text-white/60 leading-relaxed">
                    Decentralized disaster relief for a transparent and responsive world. Built on Base.
                </p>
            </div>
            
            <div>
                <h4 className="font-heading font-bold text-lg mb-4 text-aid-yellow">Platform</h4>
                <ul className="space-y-3 font-body text-sm text-white/70">
                    <li><Link href="/dashboard" className="hover:text-white transition-colors">Browse Campaigns</Link></li>
                    <li><button className="hover:text-white transition-colors">Start Fundraising</button></li>
                    <li><Link href="/explore" className="hover:text-white transition-colors">Map View</Link></li>
                    <li><button className="hover:text-white transition-colors">Transparency Report</button></li>
                </ul>
            </div>

            <div>
                <h4 className="font-heading font-bold text-lg mb-4 text-aid-yellow">Company</h4>
                <ul className="space-y-3 font-body text-sm text-white/70">
                    <li><button className="hover:text-white transition-colors">About Us</button></li>
                    <li><button className="hover:text-white transition-colors">Careers</button></li>
                    <li><button className="hover:text-white transition-colors">Press</button></li>
                    <li><button className="hover:text-white transition-colors">Contact</button></li>
                </ul>
            </div>

            <div>
                <h4 className="font-heading font-bold text-lg mb-4 text-aid-yellow">Legal</h4>
                <ul className="space-y-3 font-body text-sm text-white/70">
                    <li><button className="hover:text-white transition-colors">Privacy Policy</button></li>
                    <li><button className="hover:text-white transition-colors">Terms of Service</button></li>
                    <li><button className="hover:text-white transition-colors">Cookie Policy</button></li>
                </ul>
            </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-white/10">
            <p className="font-body text-xs text-white/40">
                © {new Date().getFullYear()} AidBeacon. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
                <button className="text-white/60 hover:text-aid-yellow transition-colors"><Twitter size={20} /></button>
                <button className="text-white/60 hover:text-aid-yellow transition-colors"><Github size={20} /></button>
                <button className="text-white/60 hover:text-aid-yellow transition-colors"><Linkedin size={20} /></button>
            </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
