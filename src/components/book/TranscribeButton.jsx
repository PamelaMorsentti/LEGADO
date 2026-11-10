import React, { useState } from "react";
import { Loader2, FileText } from "lucide-react";
import { appClient } from "@/api/appClient";
import { resolveImageSrc } from "@/lib/media";

export default function TranscribeButton({ entityName, record, onDone }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!record.audio_uri || record.audio_transcript) return null;

  const run = async () => {
    setBusy(true);
    setError("");
    try {
      const url = await resolveImageSrc(record.audio_uri);
      const text = await appClient.integrations.Core.TranscribeAudio({ audio_url: url });
      const updated = await appClient.entities[entityName].update(record.id, {
        audio_transcript: text || "",
      });
      onDone && onDone(updated);
    } catch {
      setError("No se pudo transcribir");
    }
    setBusy(false);
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      <button
        onClick={run}
        disabled={busy}
        className="inline-flex items-center gap-1.5 text-xs rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-rose-400 hover:bg-rose-100 transition-colors font-body"
      >
        {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
        {busy ? "Transcribiendo..." : "Transcribir audio"}
      </button>
      {error && <span className="text-xs text-rose-400">{error}</span>}
    </div>
  );
}