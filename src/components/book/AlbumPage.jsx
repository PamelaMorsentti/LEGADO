import React from "react";
import { Image } from "@/components/ui/image";
import AudioButton from "@/components/book/AudioButton";
import StickerItem from "@/components/book/StickerItem";
import { STICKER_MIME, getDropPos } from "@/lib/stickerDrop";

const GOLD = "#c9a227";
const TILTS = ["-rotate-2", "rotate-1", "rotate-2", "-rotate-1"];

function GoldCorner({ className }) {
  return (
    <div
      className={`absolute w-0 h-0 z-10 ${className}`}
      style={{
        borderTop: `20px solid ${GOLD}`,
        borderRight: "20px solid transparent",
        filter: "drop-shadow(0 1px 1px rgba(90, 60, 40, 0.3))",
      }}
    />
  );
}

export function PhotoFrame({ photo, tilt = "" }) {
  const aspect = photo.aspect || 4 / 3;
  return (
    <figure className={`relative ${tilt} transition-transform`}>
      <div
        className="relative bg-white p-2 rounded-sm shadow-[0_8px_20px_rgba(90,60,40,0.28)] border"
        style={{ borderColor: "#b99a72" }}
      >
        <GoldCorner className="-top-1.5 -left-1.5" />
        <GoldCorner className="-top-1.5 -right-1.5 rotate-90" />
        <GoldCorner className="-bottom-1.5 -right-1.5 rotate-180" />
        <GoldCorner className="-bottom-1.5 -left-1.5 -rotate-90" />
        <div
          className="overflow-hidden rounded-sm bg-white mx-auto"
          style={{
            width: `min(100%, calc(320px * ${aspect}))`,
            filter: "sepia(0.22) contrast(0.96) saturate(0.92)",
          }}
        >
          <Image src={photo.url} alt="Foto familiar" className="w-full h-full object-cover" fittingType="fill" />
        </div>
      </div>
      {photo.caption?.trim() ? (
        <figcaption className="mt-3 mx-1 bg-[#fbf3e4] border border-[#d9c9a3] rounded-md px-3 py-2 text-center shadow-sm">
          <p className="font-heading italic text-sm text-[#7a5c44] leading-snug">{photo.caption}</p>
        </figcaption>
      ) : null}
      {photo.audioUrl ? <AudioButton url={photo.audioUrl} /> : null}
      {photo.audio_transcript ? (
        <p className="mt-2 font-body italic text-xs text-[#7a5c44] text-center px-1">
          "{photo.audio_transcript}"
        </p>
      ) : null}
    </figure>
  );
}

export default function AlbumPage({
  photos,
  pageIndex = 0,
  stickerKey,
  placedStickers = [],
  editing = false,
  onDrop,
  onUnplace,
}) {
  const handleDrop = (e) => {
    if (!editing || !onDrop) return;
    e.preventDefault();
    const id = e.dataTransfer.getData(STICKER_MIME);
    if (!id) return;
    const { x, y } = getDropPos(e, e.currentTarget.getBoundingClientRect());
    onDrop(id, stickerKey, x, y);
  };

  return (
    <div className="relative h-full">
      <div
        className="h-full grid grid-cols-1 sm:grid-cols-2 gap-8 content-center items-center px-2"
        onDragOver={editing ? (e) => e.preventDefault() : undefined}
        onDrop={editing ? handleDrop : undefined}
      >
        {photos.map((p, i) => (
          <PhotoFrame key={p.id} photo={p} tilt={TILTS[(i + pageIndex) % TILTS.length]} />
        ))}
      </div>

      {editing && (
        <div className="absolute inset-2 border-2 border-dashed border-[#c9a227]/50 rounded-xl pointer-events-none" />
      )}

      {placedStickers.map((s) => (
        <StickerItem key={s.id} sticker={s} editing={editing} onUnplace={onUnplace} />
      ))}
    </div>
  );
}