import React, { useState } from "react";
import { appClient } from "@/api/appClient";
import { Image } from "@/components/ui/image";
import { DECOR_PRESETS } from "@/lib/decorPresets";
import { Plus, Loader2 } from "lucide-react";

export default function DecorPresets({ onAdded }) {
  const [addingId, setAddingId] = useState(null);

  const add = async (preset) => {
    setAddingId(preset.id);
    const created = await appClient.entities.Sticker.create({ sticker_uri: preset.url });
    onAdded && onAdded({ ...created, url: preset.url });
    setAddingId(null);
  };

  return (
    <div>
      <p className="text-xs font-heading text-[#a67451] mb-2">Elementos de recortes</p>
      <p className="text-[11px] text-stone-400 font-body mb-3">
        Pulsa uno y aparecerá en la bandeja de stickers para arrastrarlo a cualquier hoja
      </p>
      <div className="flex flex-wrap gap-3">
        {DECOR_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => add(preset)}
            disabled={addingId === preset.id}
            title={preset.label}
            className="relative w-16 h-16 rounded-xl bg-white border border-[#d9c9a3] shadow-sm p-1 hover:shadow-md transition-shadow group"
          >
            <Image src={preset.url} alt={preset.label} className="w-full h-full" fittingType="fit" />
            <span className="absolute inset-0 rounded-xl bg-white/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {addingId === preset.id ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#a67451]" />
              ) : (
                <Plus className="w-4 h-4 text-[#a67451]" />
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}