import React from "react";
import { Image } from "@/components/ui/image";
import { MapPin } from "lucide-react";

export default function PlacesBook({ places }) {
  return (
    <div className="space-y-5">
      {places.map((p) => (
        <div key={p.id} className="rounded-2xl bg-white/80 border border-rose-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-rose-300 flex-shrink-0" />
            <h3 className="font-heading text-lg text-[#a67451]">{p.title}</h3>
          </div>
          {(p.place_name || p.date_range) && (
            <p className="text-xs text-stone-400 font-body mb-2">
              {[p.place_name, p.date_range].filter(Boolean).join(" · ")}
            </p>
          )}
          {p.url && (
            <div className="w-44 rounded-xl overflow-hidden border-2 border-[#b99a72] bg-white p-1 shadow-sm mb-3">
              <Image src={p.url} alt={p.title} className="w-full h-32" fittingType="fill" />
            </div>
          )}
          {p.story && (
            <p className="whitespace-pre-wrap font-body text-sm text-stone-600 leading-relaxed">
              {p.story}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}