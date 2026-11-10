import React from "react";
import { Image } from "@/components/ui/image";
import { Trash2 } from "lucide-react";

// Línea de vida vertical con hitos por año.
export default function TimelineView({ events, onDelete }) {
  return (
    <div className="relative pl-7">
      <div className="absolute left-[10px] top-2 bottom-2 w-px bg-rose-200" />
      <div className="space-y-6">
        {events.map((e) => (
          <div key={e.id} className="relative">
            <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-rose-300 border-2 border-white shadow-sm" />
            <div className="flex items-start gap-3">
              <span className="font-heading text-xs text-rose-400 bg-rose-50 border border-rose-100 rounded-full px-2.5 py-0.5 flex-shrink-0">
                {e.year}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-heading text-[#a67451] leading-snug">{e.title}</p>
                {e.description && (
                  <p className="text-sm text-stone-500 font-body mt-1 whitespace-pre-wrap">
                    {e.description}
                  </p>
                )}
              </div>
              {e.photoUrl && (
                <div className="w-14 h-14 rounded-lg overflow-hidden border-2 border-white shadow-sm bg-rose-50 flex-shrink-0 rotate-1">
                  <Image src={e.photoUrl} alt="" className="w-full h-full" />
                </div>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(e)}
                  aria-label="Eliminar hito"
                  className="text-stone-300 hover:text-rose-400 transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}