import React from "react";
import { Music } from "lucide-react";

export default function SongsBook({ songs }) {
  return (
    <div className="space-y-4">
      {songs.map((s) => (
        <div key={s.id} className="rounded-2xl bg-white/80 border border-rose-100 p-4 shadow-sm flex gap-4">
          <div className="w-11 h-11 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
            <Music className="w-5 h-5 text-rose-400" />
          </div>
          <div className="min-w-0">
            <h3 className="font-heading text-lg text-[#a67451] leading-snug">
              {s.title}
              {s.artist ? <span className="text-stone-400 text-sm"> — {s.artist}</span> : null}
            </h3>
            {s.era && <p className="text-xs text-stone-400 font-body mb-1">{s.era}</p>}
            {s.story && (
              <p className="whitespace-pre-wrap font-body text-sm text-stone-600 leading-relaxed mt-1">
                {s.story}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}