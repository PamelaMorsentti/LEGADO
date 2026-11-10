export const STICKER_MIME = "text/sticker-id";

// Drop point as a percentage of the target element, clamped to the sheet.
export function getDropPos(e, rect) {
  return {
    x: Math.min(94, Math.max(6, ((e.clientX - rect.left) / rect.width) * 100)),
    y: Math.min(94, Math.max(6, ((e.clientY - rect.top) / rect.height) * 100)),
  };
}