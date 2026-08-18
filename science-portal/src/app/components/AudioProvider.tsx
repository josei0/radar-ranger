"use client";

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { sfx } from "@/lib/audio";

type BGMTrack = 'dashboard' | 'quiz' | 'game' | null;

interface AudioContextType {
  isMuted: boolean;
  toggleMute: () => void;
  playBGM: (track: BGMTrack) => void;
}

const AudioContext = createContext<AudioContextType>({
  isMuted: false,
  toggleMute: () => {},
  playBGM: () => {},
});

export const useAudio = () => useContext(AudioContext);

export default function AudioProvider({ children }: { children: ReactNode }) {
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<BGMTrack>('dashboard');
  
  // We use a ref so the event listener always sees the latest mute state
  const isMutedRef = useRef(isMuted);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    // This runs once when the app shell mounts
    sfx.init();

    const handleGlobalInteraction = () => {
      // Ensure audio context and BGM are initialized and playing
      sfx.init();
      if (!isMutedRef.current) {
        sfx.ensureBGMPlaying();
      }
    };

    document.addEventListener('click', handleGlobalInteraction, { capture: true });
    document.addEventListener('keydown', handleGlobalInteraction, { capture: true });
    document.addEventListener('touchstart', handleGlobalInteraction, { capture: true });

    return () => {
      document.removeEventListener('click', handleGlobalInteraction, { capture: true });
      document.removeEventListener('keydown', handleGlobalInteraction, { capture: true });
      document.removeEventListener('touchstart', handleGlobalInteraction, { capture: true });
    };
  }, []);

  const toggleMute = () => {
    const newMute = !isMuted;
    setIsMuted(newMute);
    sfx.setMute(newMute);
  };

  const playBGM = (track: BGMTrack) => {
    setCurrentTrack(track);
  };

  return (
    <AudioContext.Provider value={{ isMuted, toggleMute, playBGM }}>
      {children}
      <button
        onClick={toggleMute}
        onMouseEnter={() => sfx.playHover()}
        className="fixed bottom-6 right-6 z-[9999] p-4 bg-white/30 dark:bg-black/30 backdrop-blur-xl border border-white/20 rounded-full text-foreground hover:bg-white/50 dark:hover:bg-black/50 transition-all shadow-2xl"
        title={isMuted ? "Unmute Music & SFX" : "Mute Music & SFX"}
      >
        {isMuted ? <VolumeX className="w-6 h-6 text-red-500" /> : <Volume2 className="w-6 h-6 text-primary" />}
      </button>
    </AudioContext.Provider>
  );
}
