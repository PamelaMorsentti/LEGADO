import React, { useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

export default function AudioButton({ url }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  if (!url) return null;

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-4">
      <button
        onClick={toggle}
        className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-400 hover:bg-rose-200 transition-colors flex-shrink-0"
        aria-label={playing ? "Pausar audio" : "Reproducir audio"}
      >
        {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
      </button>
      <audio ref={audioRef} src={url} onEnded={() => setPlaying(false)} className="hidden" />
      <span className="text-xs text-stone-400 font-body">Mensaje de voz</span>
    </div>
  );
}