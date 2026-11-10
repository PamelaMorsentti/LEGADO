import React, { useState } from "react";
import { appClient } from "@/api/appClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Sparkles, Upload, X } from "lucide-react";
import { resolveImageSrc } from "@/lib/media";
import { Image } from "@/components/ui/image";

export default function CoverClosingEditor({ profile, onSaved }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(profile?.cover_title || "");
  const [closingTitle, setClosingTitle] = useState(profile?.closing_title || "");
  const [closingText, setClosingText] = useState(profile?.closing_text || "");
  const [coverUri, setCoverUri] = useState(profile?.cover_uri || "");
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);

  const openDialog = async () => {
    setTitle(profile?.cover_title || "");
    setClosingTitle(profile?.closing_title || "");
    setClosingText(profile?.closing_text || "");
    setCoverUri(profile?.cover_uri || "");
    setPreview(profile?.cover_uri ? await resolveImageSrc(profile.cover_uri) : "");
    setOpen(true);
  };

  const pickPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    const upFile = new File([file], file.name, { type: file.type });
    const { file_uri } = await appClient.integrations.Core.UploadPrivateFile({ file: upFile });
    setCoverUri(file_uri);
    setPreview(await resolveImageSrc(file_uri));
    setBusy(false);
  };

  const save = async () => {
    if (!profile?.id) return;
    setBusy(true);
    const updated = await appClient.entities.ProfileInfo.update(profile.id, {
      cover_title: title.trim(),
      cover_uri: coverUri || null,
      closing_title: closingTitle.trim(),
      closing_text: closingText,
    });
    setBusy(false);
    setOpen(false);
    onSaved({ ...profile, ...updated });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          onClick={openDialog}
          className="inline-flex items-center gap-1.5 text-sm rounded-full border border-[#d9c9a3] bg-[#fbf3e4] px-3 py-1.5 text-[#a67451] hover:bg-[#f6ead2] transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" /> Portada y cierre
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-[#a67451]">Portada y cierre del libro</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 font-body">
          <div>
            <label className="text-xs text-stone-500">Título de la portada</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Mamá, cuéntame tu historia"
              className="mt-1"
            />
            <div className="mt-3 flex items-center gap-3">
              <div className="w-24 h-16 rounded-lg overflow-hidden bg-rose-50 border border-rose-100 flex items-center justify-center flex-shrink-0">
                {preview ? (
                  <Image src={preview} alt="Portada" className="w-full h-full" fittingType="fill" />
                ) : (
                  <span className="text-[10px] text-stone-400 text-center px-1">Diseño floral</span>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="inline-flex items-center gap-1.5 text-xs rounded-full border border-[#d9c9a3] bg-[#fbf3e4] px-3 py-1.5 text-[#a67451] cursor-pointer hover:bg-[#f6ead2]">
                  <Upload className="w-3.5 h-3.5" /> Foto de portada
                  <input type="file" accept="image/*" className="hidden" onChange={pickPhoto} />
                </label>
                {preview && (
                  <button
                    onClick={() => {
                      setCoverUri("");
                      setPreview("");
                    }}
                    className="inline-flex items-center gap-1 text-[11px] text-stone-400 hover:text-rose-400"
                  >
                    <X className="w-3 h-3" /> Quitar foto
                  </button>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-stone-500">Frase del cierre</label>
            <Input
              value={closingTitle}
              onChange={(e) => setClosingTitle(e.target.value)}
              placeholder="Fin de nuestra historia... por ahora."
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-xs text-stone-500">Texto del cierre</label>
            <Textarea
              value={closingText}
              onChange={(e) => setClosingText(e.target.value)}
              placeholder="Escrito con amor, para nuestros hijos."
              className="mt-1 min-h-[80px]"
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={save} disabled={busy} className="bg-[#a67451] hover:bg-[#966647]">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}