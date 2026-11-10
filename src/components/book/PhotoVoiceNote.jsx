import React, { useEffect, useRef, useState } from "react";
import { Mic, Square, Play, Pause, Trash2, Loader2 } from "lucide-react";
import { appClient } from "@/api/appClient";
import { resolveImageSrc } from "@/lib/media";
import TranscribeButton from "@/components/book/TranscribeButton";

// Grabadora y reproductor de audio genérico para un registro cualquiera
// (por ejemplo, una foto del álbum). La persistencia la hace el padre vía onSave.
export default function PhotoVoiceNote({ record, field = "audio_uri", onSave }) {
  const [uri, setUri] = useState(record?.[field] || null);
  const [url, setUrl] = useState("");
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [transcript, setTranscript] = useState(record?.audio_transcript || "");
  const [error, setError] = useState("");
  const recRef = useRef(null);
  const chunksRef = useRef([]);
  const audioRef = useRef(null);

  useEffect(() => {
    let active = true;
    const current = record?.[field] || null;
    setUri(current);
    if (current) {
      resolveImageSrc(current).then((u) => active && setUrl(u));
    } else {
      setUrl("");
    }
    return () => {
      active = false;
    };
  }, [record?.id, record?.[field]]);

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
          const file = new File([blob], "nota-de-voz.webm", { type: blob.type });
          const { file_uri } = await appClient.integrations.Core.UploadPrivateFile({ file });
          onSave && onSave(file_uri);
          setUri(file_uri);
          const u = await resolveImageSrc(file_uri);
          if (u) setUrl(u);
          try {
            const text = await appClient.integrations.Core.TranscribeAudio({ audio_url: u });
            if (text && record?.id) {
              await appClient.entities.Photo.update(record.id, { audio_transcript: text });
              setTranscript(text);
            }
          } catch {}
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

  const remove = () => {
    onSave && onSave(null);
    if (record?.id) {
      appClient.entities.Photo.update(record.id, { audio_transcript: null });
    }
    setUri(null);
    setUrl("");
    setTranscript("");
    setPlaying(false);
  };

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-2 text-sm font-body">
      {busy && <Loader2 className="w-4 h-4 animate-spin text-rose-300" />}
      {!uri && !busy && !recording && (
        <button
          onClick={start}
          className="inline-flex items-center gap-1.5 text-xs rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-rose-400 hover:bg-rose-100 transition-colors"
        >
          <Mic className="w-3.5 h-3.5" /> Grabar historia
        </button>
      )}
      {recording && (
        <button
          onClick={stop}
          className="inline-flex items-center gap-1.5 text-xs rounded-full bg-rose-500 px-3 py-1.5 text-white animate-pulse"
        >
          <Square className="w-3 h-3 fill-white" /> Detener
        </button>
      )}
      {uri && !busy && (
        <>
          <button
            onClick={toggle}
            className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-400 hover:bg-rose-200 transition-colors flex-shrink-0"
            aria-label={playing ? "Pausar audio" : "Reproducir audio"}
          >
            {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <audio ref={audioRef} src={url} onEnded={() => setPlaying(false)} className="hidden" />
          <span className="text-xs text-stone-400">Historia contada</span>
          <button
            onClick={remove}
            className="text-stone-300 hover:text-rose-400 transition-colors"
            aria-label="Eliminar audio"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </>
      )}
      {uri && !busy && !transcript && record?.id && (
        <TranscribeButton
          entityName="Photo"
          record={{ id: record.id, audio_uri: uri }}
          onDone={(u) => u?.audio_transcript && setTranscript(u.audio_transcript)}
        />
      )}
      {transcript && (
        <p className="w-full text-xs text-[#7a5c44] italic font-body">"{transcript}"</p>
      )}
      {error && <span className="text-xs text-rose-400">{error}</span>}
    </div>
  );
}