import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { appClient } from "@/api/appClient";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Home, Check, Loader2, Mail, PenLine } from "lucide-react";
import SignaturePad from "@/components/book/SignaturePad";
import { Image } from "@/components/ui/image";
import { resolveImageSrc } from "@/lib/media";

export default function Carta() {
  const [letterText, setLetterText] = useState("");
  const [signature, setSignature] = useState("");
  const [handSig, setHandSig] = useState("");
  const [handSigUrl, setHandSigUrl] = useState("");
  const [recordId, setRecordId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("idle");
  const [sigError, setSigError] = useState("");
  const timeoutRef = useRef(null);

  useEffect(() => {
    appClient.entities.ProfileInfo.list().then(async (res) => {
      if (res && res[0]) {
        setRecordId(res[0].id);
        setLetterText(res[0].letter_text || "");
        setSignature(res[0].letter_signature || "");
        if (res[0].hand_signature) {
          setHandSig(res[0].hand_signature);
          try {
            const u = await resolveImageSrc(res[0].hand_signature);
            setHandSigUrl(u);
          } catch {}
        }
      }
      setLoading(false);
    });
  }, []);

  const save = async (next) => {
    setStatus("saving");
    let record;
    if (recordId) {
      record = await appClient.entities.ProfileInfo.update(recordId, next);
    } else {
      record = await appClient.entities.ProfileInfo.create(next);
    }
    if (record?.id) setRecordId(record.id);
    setStatus("saved");
    return record;
  };

  const scheduleSave = (next) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => save(next), 900);
  };

  const handleLetter = (e) => {
    setLetterText(e.target.value);
    scheduleSave({ letter_text: e.target.value, letter_signature: signature });
  };

  const handleSignature = (e) => {
    setSignature(e.target.value);
    scheduleSave({ letter_text: letterText, letter_signature: e.target.value });
  };

  const saveHand = async (uri) => {
    setSigError("");
    setHandSig(uri);
    try {
      const saved = await save({
        letter_text: letterText,
        letter_signature: signature,
        hand_signature: uri,
      });
      const fresh = await appClient.entities.ProfileInfo.get(saved?.id || recordId);
      if (fresh?.hand_signature !== uri) {
        setSigError("La firma no quedó guardada. Inténtalo otra vez.");
        return;
      }
      const u = await resolveImageSrc(uri);
      setHandSigUrl(u);
    } catch {
      setSigError("La firma no quedó guardada. Inténtalo otra vez.");
    }
  };

  const clearHand = () => {
    setHandSig("");
    setHandSigUrl("");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff9f6]">
        <Loader2 className="w-6 h-6 animate-spin text-rose-300" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff9f6] pb-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-rose-400 transition-colors mb-6"
        >
          <Home className="w-3.5 h-3.5" /> Volver al inicio
        </Link>

        <div className="rounded-[2rem] bg-white border border-rose-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6 sm:p-10">
          <h1 className="font-heading text-2xl text-[#a67451] mb-2 flex items-center gap-2">
            <Mail className="w-5 h-5 text-rose-300" /> Carta de dedicación
          </h1>
          <p className="text-sm text-stone-400 font-body mb-8">
            Escribe tu propia carta para el libro; aparecerá al inicio del modo lectura en
            lugar de la carta de ejemplo. Se guarda automáticamente.
          </p>

          <div className="space-y-6">
            <div>
              <Label className="font-heading text-[#a67451]">Tu carta</Label>
              <Textarea
                value={letterText}
                onChange={handleLetter}
                placeholder={"Querida Mamá:\n\nEscribe aquí tu carta..."}
                className="mt-2 min-h-[280px] border border-rose-200 rounded-2xl focus-visible:ring-0 focus-visible:border-rose-400 bg-transparent resize-none font-body text-stone-700 p-4"
              />
            </div>
            <div>
              <Label className="font-heading text-[#a67451]">Firma</Label>
              <Input
                value={signature}
                onChange={handleSignature}
                placeholder="Ej: Tu hija, con amor"
                className="mt-2 border-0 border-b border-rose-200 rounded-none focus-visible:ring-0 focus-visible:border-rose-400 px-0 font-heading italic text-[#a67451]"
              />
            </div>
            <div>
              <Label className="font-heading text-[#a67451]">Firma manuscrita</Label>
              <p className="text-xs text-stone-400 font-body mt-1">
                Dibuja tu firma con el dedo o el mouse para cerrar la carta en el libro.
              </p>
              {handSigUrl ? (
                <div className="mt-3 flex items-center gap-3 flex-wrap">
                  <div className="w-48 h-20 rounded-xl bg-rose-50/60 border border-rose-100 p-1">
                    <Image
                      src={handSigUrl}
                      alt="Firma manuscrita"
                      className="w-full h-full"
                      fittingType="fit"
                    />
                  </div>
                  <button
                    onClick={clearHand}
                    className="inline-flex items-center gap-1.5 text-xs rounded-full border border-stone-200 px-3 py-1.5 text-stone-400 hover:text-rose-400 hover:border-rose-200 transition-colors font-body"
                  >
                    <PenLine className="w-3.5 h-3.5" /> Dibujar de nuevo
                  </button>
                </div>
              ) : (
                <div className="mt-3">
                  <SignaturePad onSave={saveHand} />
                </div>
              )}
              {sigError && <p className="mt-2 text-xs text-rose-400 font-body">{sigError}</p>}
            </div>
          </div>

          <div className="h-5 flex items-center justify-end mt-4 text-xs text-stone-400">
            {status === "saving" && (
              <span className="flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Guardando...
              </span>
            )}
            {status === "saved" && (
              <span className="flex items-center gap-1 text-rose-400">
                <Check className="w-3 h-3" /> Guardado
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}