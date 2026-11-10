import React, { useRef, useState } from "react";
import { Mic, Square, Loader2, PenLine } from "lucide-react";
import { appClient } from "@/api/appClient";
import { resolveImageSrc } from "@/lib/media";

// Dictation: speaks the answer out loud and turns it into written text.
export default function DictateButton({ onText }) {
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
          const file = new File([blob], "dictado.webm", { type: blob.type });
          const { file_uri } = await appClient.integrations.Core.UploadPrivateFile({ file });
          const url = await resolveImageSrc(file_uri);
          const text = await appClient.integrations.Core.TranscribeAudio({ audio_url: url });
          if (text && text.trim()) {
            onText(text.trim());
          } else {
            setError("No se entendió el audio, prueba otra vez");
          }
        } catch {
          setError("No se pudo convertir el audio en texto");
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
    <div className="flex items-center gap-2 flex-wrap">
      {busy ? (
        <span className="inline-flex items-center gap-1.5 text-xs rounded-full border border-rose-200 bg-white px-3 py-1.5 text-rose-400 font-body">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Escribiendo lo que dijiste...
        </span>
      ) : recording ? (
        <button
          onClick={stop}
          className="inline-flex items-center gap-1.5 text-xs rounded-full bg-rose-500 px-3 py-1.5 text-white animate-pulse font-body"
        >
          <Square className="w-3 h-3 fill-white" /> Terminar y escribir
        </button>
      ) : (
        <button
          onClick={start}
          className="inline-flex items-center gap-1.5 text-xs rounded-full border border-[#d9c9a3] bg-[#fbf3e4] px-3 py-1.5 text-[#a67451] hover:bg-[#f6ead2] transition-colors font-body"
        >
          <Mic className="w-3.5 h-3.5" /> Dictar mi respuesta
        </button>
      )}
      {recording && (
        <span className="text-xs text-stone-400 font-body flex items-center gap-1">
          <PenLine className="w-3 h-3" /> Habla con calma, lo paso a texto
        </span>
      )}
      {error && <span className="text-xs text-rose-400 font-body">{error}</span>}
    </div>
  );
}