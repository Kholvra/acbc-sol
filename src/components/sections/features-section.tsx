'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Video, Film, MapPin, ShieldCheck } from 'lucide-react';
import { FEATURES } from '~/constants';
import Section from '../ui/section';

const iconMap: Record<string, React.ReactNode> = {
  'live-streaming': <Video size={32} />,
  'video-reels': <Film size={32} />,
  'location-tracking': <MapPin size={32} />,
  'transparent-funding': <ShieldCheck size={32} />,
};

const FeaturesSection: React.FC = () => {
  return (
    <Section id="features" background="white">
      <div className="max-w-3xl mb-16">
        <h2 className="font-heading font-black text-3xl md:text-5xl text-aid-dark mb-6">
           Transparency meets <span className="text-aid-green">Urgency</span>.
        </h2>
        <p className="font-body text-lg text-aid-dark/70">
          Traditional aid is slow and opaque. AidBeacon brings the speed of social media and the trust of blockchain to disaster relief.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {FEATURES.map((feature, index) => (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl bg-aid-offwhite hover:bg-aid-yellow/20 transition-colors border border-transparent hover:border-aid-yellow/50 group"
          >
            <div className="mb-6 text-aid-green group-hover:text-aid-dark transition-colors">
              {iconMap[feature.id]}
            </div>
            <h3 className="font-heading font-bold text-xl mb-3 text-aid-dark">
              {feature.title}
            </h3>
            <p className="font-body text-aid-dark/70 leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
};

export default FeaturesSection;
