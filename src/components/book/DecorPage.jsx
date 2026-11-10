import React from "react";
import BookPage from "@/components/book/BookPage";
import StickerItem from "@/components/book/StickerItem";
import { STICKER_MIME, getDropPos } from "@/lib/stickerDrop";

// A book page that accepts dragged stickers in decorating mode.
export default function DecorPage({
  stickerKey,
  className = "",
  placedStickers = [],
  editing = false,
  onDrop,
  onUnplace,
  children,
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
    <BookPage className={className}>
      <div
        className="relative h-full"
        onDragOver={editing ? (e) => e.preventDefault() : undefined}
        onDrop={handleDrop}
      >
        {children}
        {editing && (
          <div className="absolute inset-2 border-2 border-dashed border-[#c9a227]/50 rounded-xl pointer-events-none" />
        )}
        {placedStickers.map((s) => (
          <StickerItem key={s.id} sticker={s} editing={editing} onUnplace={onUnplace} />
        ))}
      </div>
    </BookPage>
  );
}