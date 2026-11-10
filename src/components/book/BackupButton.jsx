import React, { useState } from "react";
import { appClient } from "@/api/appClient";
import { Download, Loader2 } from "lucide-react";

const COLLECTIONS = [
  ["answers", "Answer"],
  ["profile", "ProfileInfo"],
  ["photos", "Photo"],
  ["stickers", "Sticker"],
  ["timeline", "TimelineEvent"],
  ["recipes", "Recipe"],
  ["family", "FamilyMember"],
  ["places", "Place"],
  ["future_letters", "FutureLetter"],
  ["songs", "Song"],
  ["family_messages", "FamilyMessage"],
  ["own_chapters", "OwnChapter"],
  ["own_questions", "OwnQuestion"],
  ["chapter_covers", "ChapterCover"],
];

export default function BackupButton() {
  const [busy, setBusy] = useState(false);

  const handleDownload = async () => {
    setBusy(true);
    try {
      const lists = await Promise.all(
        COLLECTIONS.map(([, entity]) => appClient.entities[entity].list())
      );

      const data = { generado: new Date().toISOString() };
      COLLECTIONS.forEach(([key], i) => {
        data[key] = lists[i];
      });

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `respaldo-recuerdos-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-10 rounded-2xl bg-[#fbf3e4] border border-[#d9c9a3] p-5 text-center">
      <p className="font-heading text-sm text-[#a67451] mb-1">Respaldo de tus recuerdos</p>
      <p className="text-xs text-stone-500 mb-4">
        Descarga una copia de todos tus textos e historias. Las fotos y audios quedan guardados
        dentro de la app.
      </p>
      <button
        onClick={handleDownload}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-full bg-white border border-[#d9c9a3] px-5 py-2 text-sm text-[#a67451] hover:bg-[#fdf8ec] transition-colors disabled:opacity-60"
      >
        {busy ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        {busy ? "Preparando respaldo..." : "Descargar respaldo"}
      </button>
    </div>
  );
}