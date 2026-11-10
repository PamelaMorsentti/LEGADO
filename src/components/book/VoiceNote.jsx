import React, { useEffect, useRef, useState } from "react";
import { Mic, Square, Play, Pause, Trash2, Loader2 } from "lucide-react";
import { appClient } from "@/api/appClient";
import { resolveImageSrc } from "@/lib/media";
import TranscribeButton from "@/components/book/TranscribeButton";

export default function VoiceNote({ answer, index, questionText, onSaved }) {
  const [audioUri, setAudioUri] = useState(answer?.audio_uri || null);
  const [audioUrl, setAudioUrl] = useState("");
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [transcript, setTranscript] = useState(answer?.audio_transcript || "");
  const [error, setError] = useState("");
  const recRef = useRef(null);
  const chunksRef = useRef([]);
  const audioRef = useRef(null);
  const answerIdRef = useRef(answer?.id || null);

  useEffect(() => {
    let active = true;
    if (answer?.id) answerIdRef.current = answer.id;
    setAudioUri(answer?.audio_uri || null);
    if (answer?.audio_uri) {
      resolveImageSrc(answer.audio_uri).then((url) => active && setAudioUrl(url));
    } else {
      setAudioUrl("");
    }
    return () => {
      active = false;
    };
  }, [answer?.id, answer?.audio_uri]);

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
          if (answerIdRef.current) {
            await appClient.entities.Answer.update(answerIdRef.current, { audio_uri: file_uri });
          } else {
            const created = await appClient.entities.Answer.create({
              section_key: answer.section_key,
              question_index: index,
              question_text: questionText,
              answer_text: "",
              audio_uri: file_uri,
            });
            answerIdRef.current = created.id;
            onSaved && onSaved(created);
          }
          setAudioUri(file_uri);
          const url = await resolveImageSrc(file_uri);
          if (url) setAudioUrl(url);
          try {
            const text = await appClient.integrations.Core.TranscribeAudio({ audio_url: url });
            if (text) {
              await appClient.entities.Answer.update(answerIdRef.current, { audio_transcript: text });
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

  const remove = async () => {
    setBusy(true);
    if (answerIdRef.current) {
      await appClient.entities.Answer.update(answerIdRef.current, { audio_uri: null });
    }
    setAudioUri(null);
    setAudioUrl("");
    setTranscript("");
    setPlaying(false);
    setBusy(false);
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
    <div className="flex items-center gap-2 mt-3 text-sm font-body">
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
          <Square className="w-3 h-3 fill-white" /> Detener
        </button>
      )}
      {audioUri && !busy && (
        <>
          <button
            onClick={toggle}
            className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-400 hover:bg-rose-200 transition-colors flex-shrink-0"
            aria-label={playing ? "Pausar audio" : "Reproducir audio"}
          >
            {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <audio ref={audioRef} src={audioUrl} onEnded={() => setPlaying(false)} className="hidden" />
          <span className="text-xs text-stone-400">Mensaje de voz</span>
          <button
            onClick={remove}
            className="text-stone-300 hover:text-rose-400 transition-colors"
            aria-label="Eliminar audio"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </>
      )}
      {audioUri && !busy && !transcript && answerIdRef.current && (
        <TranscribeButton
          entityName="Answer"
          record={{ id: answerIdRef.current, audio_uri: audioUri }}
          onDone={(u) => u?.audio_transcript && setTranscript(u.audio_transcript)}
        />
      )}
      {transcript && (
        <p className="w-full text-xs text-stone-400 italic font-body">"{transcript}"</p>
      )}
      {error && <span className="text-xs text-rose-400">{error}</span>}
    </div>
  );
}