import React, { useState } from "react";
import { Share2, Loader2, Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createGuestLink } from "@/lib/guestBook";

export default function ShareGuestLink() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const handleOpen = async (next) => {
    setOpen(next);
    if (!next || url) return;

    setBusy(true);
    try {
      const link = await createGuestLink();
      setUrl(link);
    } catch {
      setUrl("");
    } finally {
      setBusy(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <button
        onClick={() => handleOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm rounded-full border border-[#d9c9a3] bg-[#fbf3e4] px-3 py-1.5 text-[#a67451] hover:bg-[#f6ead2] transition-colors"
      >
        <Share2 className="w-3.5 h-3.5" /> Enlace para la familia
      </button>

      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-[#a67451]">Enlace para la familia</DialogTitle>
            <DialogDescription className="text-sm text-stone-500">
              Quien tenga este enlace podrá leer el libro completo, sin poder editar nada.
            </DialogDescription>
          </DialogHeader>

          {busy ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-stone-500">
              <Loader2 className="w-4 h-4 animate-spin" /> Preparando el enlace...
            </div>
          ) : url ? (
            <div className="space-y-3">
              <div className="rounded-xl border border-rose-100 bg-[#fff9f6] p-3 text-xs text-stone-600 break-all">
                {url}
              </div>
              <button
                onClick={handleCopy}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-rose-300 px-4 py-2 text-sm text-white hover:bg-rose-400 transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Enlace copiado" : "Copiar enlace"}
              </button>
              <p className="text-xs text-stone-400 leading-relaxed">
                Las fotos y los audios no se incluyen en este enlace, por privacidad. Cada vez que
                lo abras de nuevo se actualiza con tus últimos recuerdos.
              </p>
            </div>
          ) : (
            <p className="text-sm text-stone-500 py-6 text-center">
              No se pudo preparar el enlace. Inténtalo otra vez.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}