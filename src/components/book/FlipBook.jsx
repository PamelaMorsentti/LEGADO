import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function FlipBook({ pages }) {
  const [index, setIndex] = useState(0);
  const [flip, setFlip] = useState(null); // { dir: 'next' | 'prev' } while animating

  useEffect(() => {
    const handler = (e) => {
      const target = e.detail;
      if (typeof target === "number" && target >= 0 && target < pages.length) {
        setFlip(null);
        setIndex(target);
      }
    };
    window.addEventListener("flipbook:goto", handler);
    return () => window.removeEventListener("flipbook:goto", handler);
  }, [pages.length]);

  const goNext = () => {
    if (!flip && index < pages.length - 1) setFlip({ dir: "next" });
  };
  const goPrev = () => {
    if (!flip && index > 0) setFlip({ dir: "prev" });
  };

  const handleAnimEnd = () => {
    if (!flip) return;
    const nextIndex = flip.dir === "next" ? index + 1 : index - 1;
    setFlip(null);
    setIndex(nextIndex);
  };

  let staticPage;
  if (flip?.dir === "next") staticPage = pages[index + 1];
  else if (flip?.dir === "prev") staticPage = pages[index - 1];
  else staticPage = pages[index];

  let flipFront = null;
  if (flip?.dir === "next") flipFront = pages[index];
  else if (flip?.dir === "prev") flipFront = pages[index - 1];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="book-3d relative h-[70vh] max-h-[640px] min-h-[440px]">
        {/* Página estática visible debajo */}
        <div className="absolute inset-0 z-10">{staticPage}</div>

        {/* Capa que se voltea */}
        {flip && (
          <div
            className="flip-layer"
            style={{
              animation:
                flip.dir === "next"
                  ? "flip-next 0.9s ease-in-out forwards"
                  : "flip-prev 0.9s ease-in-out forwards",
            }}
            onAnimationEnd={handleAnimEnd}
          >
            <div className="flip-face flip-front">{flipFront}</div>
            <div className="flip-face flip-back" />
          </div>
        )}

        {/* Zonas de clic: borde izquierdo / derecho */}
        <button
          onClick={goPrev}
          disabled={index === 0}
          aria-label="Página anterior"
          className={`group absolute left-0 top-0 bottom-0 w-[14%] z-30 flex items-center justify-start pl-1 ${
            index === 0 ? "cursor-default" : "cursor-pointer"
          }`}
        >
          <ChevronLeft
            className={`w-6 h-6 text-rose-300 transition-opacity ${
              index === 0 ? "opacity-0" : "opacity-30 group-hover:opacity-100"
            }`}
          />
        </button>
        <button
          onClick={goNext}
          disabled={index === pages.length - 1}
          aria-label="Página siguiente"
          className={`group absolute right-0 top-0 bottom-0 w-[14%] z-30 flex items-center justify-end pr-1 ${
            index === pages.length - 1 ? "cursor-default" : "cursor-pointer"
          }`}
        >
          <ChevronRight
            className={`w-6 h-6 text-rose-300 transition-opacity ${
              index === pages.length - 1 ? "opacity-0" : "opacity-30 group-hover:opacity-100"
            }`}
          />
        </button>
      </div>

      <p className="text-center text-xs text-stone-400 mt-4 font-body">
        Página {index + 1} de {pages.length}
      </p>
    </div>
  );
}