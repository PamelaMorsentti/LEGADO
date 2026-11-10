import React, { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function BookSearch({ entries, onGo }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const needle = query.trim().toLowerCase();
  const results =
    needle.length < 2
      ? []
      : entries
          .filter(
            (e) =>
              e.question.toLowerCase().includes(needle) ||
              (e.text || "").toLowerCase().includes(needle)
          )
          .slice(0, 8);

  const go = (page) => {
    onGo(page);
    setOpen(false);
    setQuery("");
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm rounded-full border border-[#d9c9a3] bg-[#fbf3e4] px-3 py-1.5 text-[#a67451] hover:bg-[#f6ead2] transition-colors"
      >
        <Search className="w-3.5 h-3.5" /> Buscar
      </button>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-1.5">
        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar en el libro..."
          className="h-9 w-52 bg-white font-body text-sm"
        />
        <button
          onClick={() => {
            setOpen(false);
            setQuery("");
          }}
          className="text-stone-400 hover:text-rose-400 transition-colors"
          aria-label="Cerrar búsqueda"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {needle.length >= 2 && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-rose-100 shadow-lg p-2 z-30">
          {results.length === 0 ? (
            <p className="text-xs text-stone-400 font-body px-3 py-2">
              No encontramos ese recuerdo.
            </p>
          ) : (
            results.map((r, i) => (
              <button
                key={i}
                onClick={() => go(r.page)}
                className="w-full text-left rounded-xl px-3 py-2 hover:bg-rose-50 transition-colors"
              >
                <p className="text-[11px] uppercase tracking-wide text-stone-400 font-body">
                  {r.label}
                </p>
                <p className="text-sm text-[#a67451] font-heading leading-snug line-clamp-2">
                  {r.question}
                </p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}