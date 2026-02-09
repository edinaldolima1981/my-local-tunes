import { useEffect, useRef } from 'react';
import { RepeatMode } from '@/types/music';

interface VideoPlayerProps {
  src: string;
  isPlaying: boolean;
  currentTime: number;
  repeat: RepeatMode;
}

export function VideoPlayer({ src, isPlaying, repeat }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sync Play/Pause only - no time sync to avoid audio stuttering
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying && video.paused) {
      video.play().catch(() => {});
    } else if (!isPlaying && !video.paused) {
      video.pause();
    }
  }, [isPlaying]);

  // Set video properties on load
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = 0; // Muted - audio handled by main player
  }, []);

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
