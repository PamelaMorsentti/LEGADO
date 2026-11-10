import React, { useEffect, useRef, useState } from "react";
import { appClient } from "@/api/appClient";
import { resolveImageSrc } from "@/lib/media";
import { Upload, Loader2, Check, X } from "lucide-react";

export default function CoverCustomizer({ sectionKey, onCoverSaved }) {
  const [hasCover, setHasCover] = useState(false);
  const [busy, setBusy] = useState(false);
  const recordIdRef = useRef(null);

  useEffect(() => {
    let active = true;
    appClient.entities.ChapterCover.filter({ section_key: sectionKey }).then(async (res) => {
      if (!active) return;
      const cover = res[0];
      if (cover) {
        recordIdRef.current = cover.id;
        setHasCover(true);
        const url = await resolveImageSrc(cover.photo_uri);
        if (active) onCoverSaved && onCoverSaved(url);
      }
    });
    return () => {
      active = false;
    };
  }, [sectionKey]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    const { file_uri } = await appClient.integrations.Core.UploadPrivateFile({ file });
    if (recordIdRef.current) {
      await appClient.entities.ChapterCover.update(recordIdRef.current, { photo_uri: file_uri });
    } else {
      const created = await appClient.entities.ChapterCover.create({
        section_key: sectionKey,
        photo_uri: file_uri,
      });
      recordIdRef.current = created.id;
    }
    setHasCover(true);
    const url = await resolveImageSrc(file_uri);
    onCoverSaved && onCoverSaved(url);
    setBusy(false);
  };

  const handleRemove = async () => {
    setBusy(true);
    if (recordIdRef.current) {
      await appClient.entities.ChapterCover.delete(recordIdRef.current);
      recordIdRef.current = null;
    }
    setHasCover(false);
    onCoverSaved && onCoverSaved(null);
    setBusy(false);
  };

  return (
    <div className="inline-flex items-center gap-2">
      <label className="cursor-pointer inline-flex items-center gap-1.5 text-sm rounded-full border border-[#d9c9a3] bg-[#fbf3e4] px-3 py-1.5 text-[#a67451] hover:bg-[#f6ead2] transition-colors">
        {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : hasCover ? <Check className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}
        {hasCover ? "Cambiar portada" : "Personalizar portada"}
        <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </label>
      {hasCover && !busy && (
        <button
          onClick={handleRemove}
          className="text-xs text-stone-400 hover:text-rose-400 transition-colors inline-flex items-center gap-1"
        >
          <X className="w-3.5 h-3.5" /> Quitar
        </button>
      )}
    </div>
  );
}