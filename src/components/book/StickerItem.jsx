import React from "react";
import { Image } from "@/components/ui/image";
import { X } from "lucide-react";
import { STICKER_MIME } from "@/lib/stickerDrop";

export default function StickerItem({ sticker, editing = false, onUnplace }) {
  return (
    <div
      className={`absolute z-20 drop-shadow-[0_4px_6px_rgba(90,60,40,0.25)] ${
        editing ? "cursor-grab active:cursor-grabbing" : "pointer-events-none"
      }`}
      style={{
        left: `${sticker.x ?? 50}%`,
        top: `${sticker.y ?? 50}%`,
        transform: `translate(-50%, -50%) rotate(${sticker.rot ?? 0}deg)`,
        width: "clamp(3.5rem, 12vw, 5.5rem)",
      }}
      draggable={editing}
      onDragStart={(e) => e.dataTransfer.setData(STICKER_MIME, sticker.id)}
    >
      <div className="aspect-square w-full">
        <Image src={sticker.url} alt="Sticker decorativo" className="w-full h-full" fittingType="fit" />
      </div>
      {editing && (
        <button
          onClick={() => onUnplace && onUnplace(sticker.id)}
          aria-label="Quitar sticker"
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-400 hover:text-rose-400 shadow-sm z-10"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}