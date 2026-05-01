'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import WalletWrapper from '../providers/wallet-wrapper';
import { NAV_LINKS } from '~/constants';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { connected } = useWallet();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const navVariants = {
    top: {
      y: 0,
      width: "100%",
      maxWidth: "100%",
      borderRadius: "0px",
      backgroundColor: "rgba(255, 255, 255, 0)",
      paddingTop: "1.5rem",
      paddingBottom: "1.5rem",
      borderBottom: "1px solid transparent",
      boxShadow: "none"
    },
    scrolled: {
      y: 10,
      width: "90%",
      maxWidth: "1200px",
      borderRadius: "9999px",
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      backdropFilter: "blur(12px)",
      paddingTop: "0.75rem",
      paddingBottom: "0.75rem",
      borderBottom: "1px solid rgba(101, 140, 88, 0.1)",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
    }
  };

  const isLoginPage = pathname === '/sign-in';
  const isLandingPage = pathname === '/';

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <motion.nav
            variants={navVariants}
            initial="top"
            animate={isScrolled ? "scrolled" : "top"}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="pointer-events-auto relative z-50 px-6 md:px-8 flex items-center justify-between mx-auto"
        >
             {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
                <Image
                    src="/images/logo-aidbeacon.png"
                    alt="AidBeacon"
                    width={40}
                    height={40}
                    className="h-10 w-auto object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
                />
                <span className={`font-heading font-black tracking-tight text-aid-dark transition-all duration-300 ${isScrolled ? 'text-xl' : 'text-2xl'}`}>
                    AidBeacon
                </span>
            </Link>

            {/* Desktop Nav - Only show on Landing Page */}
            <div className="hidden md:flex items-center gap-6">
                {!isLoginPage && isLandingPage && NAV_LINKS.map((link) => (
                    <a 
                      key={link.label}
                      href={link.href}
                      className="relative text-sm font-bold text-aid-dark/80 hover:text-aid-green transition-colors font-body uppercase tracking-wide group"
                    >
                      {link.label}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-aid-green transition-all duration-300 group-hover:w-full"></span>
                    </a>
                ))}
            </div>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-3 ml-4">
                {isLandingPage ? (
                     <Link href="/sign-in" className="px-6 py-2.5 bg-aid-dark text-white font-bold rounded-full hover:bg-aid-green transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                       Login
                     </Link>
                ) : isLoginPage ? null : !isMounted ? (
                    <div className="h-10" />
                ) : (
                    connected ? (
                        <WalletWrapper />
                    ) : (
                        <Link href="/sign-in" className="px-6 py-2.5 bg-aid-dark text-white font-bold rounded-full hover:bg-aid-green transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                        Login
                        </Link>
                    )
                )}
            </div>

            {/* Mobile Toggle */}
            <button 
                className="md:hidden p-2 text-aid-dark hover:bg-aid-offwhite rounded-full transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                {isMobileMenuOpen ? <X /> : <Menu />}
            </button>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-aid-dark/10 overflow-hidden p-4 flex flex-col gap-4 md:hidden"
                >
                     {!isLoginPage && isLandingPage && NAV_LINKS.map((link) => (
                        <a 
                          key={link.label}
                          href={link.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="text-base font-bold text-aid-dark px-4 py-2 hover:bg-aid-offwhite rounded-lg transition-colors"
                        >
                          {link.label}
                        </a>
                    ))}
                    <div className="h-px bg-aid-dark/10 w-full my-1"></div>
                     <div className="flex flex-col gap-3 items-center">
                        {isLandingPage ? (
                             <Link href="/sign-in" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center px-6 py-3 bg-aid-dark text-white font-bold rounded-xl hover:bg-aid-green transition-all">
                                Login
                             </Link>
                        ) : isLoginPage ? null : !isMounted ? (
                            <div className="h-12 w-full" />
                        ) : (
                            connected ? (
                                <WalletWrapper className="w-full justify-center" />
                            ) : (
                                <Link href="/sign-in" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center px-6 py-3 bg-aid-dark text-white font-bold rounded-xl hover:bg-aid-green transition-all">
                                Login
                                </Link>
                            )
                        )}
                    </div>
                </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    </div>
  );
};

export default Navbar;
