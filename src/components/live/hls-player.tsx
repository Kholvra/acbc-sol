'use client';

import React, { useEffect, useRef } from "react";
import Hls from "hls.js";

interface HLSPlayerProps {
  url: string;
}

const HLSPlayer: React.FC<HLSPlayerProps> = ({ url }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (Hls.isSupported() && videoRef.current) {
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current?.play().catch(() => {});
      });
      return () => {
          hls.destroy();
      }
    } else if (
      videoRef.current?.canPlayType("application/vnd.apple.mpegurl")
    ) {
      videoRef.current.src = url;
      videoRef.current.addEventListener("loadedmetadata", () => {
        videoRef.current?.play().catch(() => {});
      });
    }
  }, [url]);

  return (
    <video
      ref={videoRef}
      autoPlay
      controls
      muted
      playsInline
      className="w-full h-full object-cover"
    />
  );
};

export default HLSPlayer;
