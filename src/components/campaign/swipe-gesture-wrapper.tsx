'use client';

import { type ReactNode, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { SWIPE_THRESHOLD_PX, SWIPE_MAX_DISTANCE_PX } from '~/constants/donation';
import { Heart } from 'lucide-react';

interface SwipeGestureWrapperProps {
  children: ReactNode;
  onSwipeRight: () => void;
  enabled?: boolean;
}

export function SwipeGestureWrapper({
  children,
  onSwipeRight,
  enabled = true
}: SwipeGestureWrapperProps) {
  const x = useMotionValue(0);
  const [isReturning, setIsReturning] = useState(false);

  // Transform values for visual feedback
  const opacity = useTransform(x, [0, SWIPE_MAX_DISTANCE_PX], [0, 1]);
  const scale = useTransform(x, [0, SWIPE_MAX_DISTANCE_PX], [1, 1.05]);
  const bgColor = useTransform(
    x,
    [0, SWIPE_THRESHOLD_PX, SWIPE_MAX_DISTANCE_PX],
    ['transparent', 'rgba(34, 197, 94, 0.2)', 'rgba(34, 197, 94, 0.4)']
  );

  // Indicator opacity transform
  const indicatorOpacity = useTransform(x, [0, 100], [0, 1]);

  const animateBackToCenter = () => {
    setIsReturning(true);
    animate(x, 0, {
      type: 'spring',
      stiffness: 400,
      damping: 25,
      restDelta: 0.001,
      onComplete: () => {
        setIsReturning(false);
      }
    });
  };

  const handleDragEnd = (_event: unknown, _info: { offset: { x: number }; velocity: { x: number } }) => {
    if (!enabled || isReturning) return;

    const currentX = x.get();

    if (currentX >= SWIPE_THRESHOLD_PX) {
      // Threshold reached - trigger donation
      onSwipeRight();

      // Haptic feedback
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50);
      }

      // Animate back to center with spring
      animateBackToCenter();
    } else {
      // Return to center with spring animation
      animateBackToCenter();
    }
  };

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <motion.div
      style={{ x, scale }}
      drag="x"
      dragConstraints={{ left: -SWIPE_MAX_DISTANCE_PX, right: SWIPE_MAX_DISTANCE_PX }}
      dragElastic={0.7}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      className="relative cursor-grab active:cursor-grabbing w-full h-full"
    >
      {/* Green overlay during swipe */}
      <motion.div
        style={{ opacity, backgroundColor: bgColor }}
        className="absolute inset-0 rounded-xl pointer-events-none z-10"
      />

      {/* Swipe indicator */}
      <motion.div
        style={{ opacity: indicatorOpacity }}
        className="absolute left-10 top-1/2 -translate-y-1/2 pointer-events-none z-20"
      >
        <div className="flex items-center gap-3 text-white drop-shadow-lg">
          <div className="bg-aid-green p-3 rounded-full shadow-lg">
            <Heart className="w-8 h-8 fill-current" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black uppercase tracking-wider">Donate 1k</span>
            <span className="text-xs font-bold opacity-80">Swipe to help</span>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="relative h-full w-full">
        {children}
      </div>
    </motion.div>
  );
}
