import { useEffect, useRef } from 'react';
import { RepeatMode } from '@/types/music';

interface VideoPlayerProps {
  src: string;
  isPlaying: boolean;
  currentTime: number;
  repeat: RepeatMode;
}

export function VideoPlayer({ src, isPlaying, currentTime, repeat }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasInitialized = useRef(false);

  // Sync Play/Pause only
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying && video.paused) {
      video.play().catch(() => { });
    } else if (!isPlaying && !video.paused) {
      video.pause();
    }
  }, [isPlaying]);

  // Initial setup - seek to start position ONCE when video loads
  useEffect(() => {
    const video = videoRef.current;
    if (!video || hasInitialized.current) return;

    const handleLoadedMetadata = () => {
      if (currentTime > 0) {
        video.currentTime = currentTime;
      }
      hasInitialized.current = true;
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.volume = 0; // Muted - audio handled by main player

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [currentTime]);

  return (
    <video
      ref={videoRef}
      src={src}
      className="w-full h-full object-contain"
      loop={repeat === 'one'}
      playsInline
      muted
    />
  );
}
