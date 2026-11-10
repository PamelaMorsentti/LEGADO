import React, { useRef, useState } from "react";
import { appClient } from "@/api/appClient";
import { Mic, Square, Loader2, Trash2 } from "lucide-react";

export default function FamilyVoiceNote({ audioUri, onChange }) {
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const recRef = useRef(null);
  const chunksRef = useRef([]);

  const start = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setBusy(true);
        try {
          const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
          const file = new File([blob], "mensaje-de-voz.webm", { type: blob.type });
          const { file_uri } = await appClient.integrations.Core.UploadPrivateFile({ file });
          onChange(file_uri);
        } finally {
          setBusy(false);
        }
      };
      rec.start();
      recRef.current = rec;
      setRecording(true);
    } catch {
      setError("No se pudo acceder al micrófono");
    }
  };

  const stop = () => {
    recRef.current?.stop();
    setRecording(false);
  };

  return (
    <div className="flex items-center gap-2 text-sm font-body">
      {busy && <Loader2 className="w-4 h-4 animate-spin text-rose-300" />}
      {!audioUri && !busy && !recording && (
        <button
          onClick={start}
          className="inline-flex items-center gap-1.5 text-xs rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-rose-400 hover:bg-rose-100 transition-colors"
        >
          <Mic className="w-3.5 h-3.5" /> Grabar audio
        </button>
      )}
      {recording && (
        <button
          onClick={stop}
          className="inline-flex items-center gap-1.5 text-xs rounded-full bg-rose-500 px-3 py-1.5 text-white animate-pulse"
        >
          <Square className="w-3.5 h-3.5 fill-white" /> Detener
        </button>
      )}
      {audioUri && !busy && (
        <button
          onClick={() => onChange(null)}
          className="inline-flex items-center gap-1.5 text-xs rounded-full border border-stone-200 px-3 py-1.5 text-stone-400 hover:text-rose-400 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" /> Quitar audio
        </button>
      )}
      {error && <span className="text-xs text-rose-400">{error}</span>}
    </div>
  );
}