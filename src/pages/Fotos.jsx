import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { appClient } from "@/api/appClient";
import { Textarea } from "@/components/ui/textarea";
import { Image } from "@/components/ui/image";
import { PhotoFrame } from "@/components/book/AlbumPage";
import PhotoVoiceNote from "@/components/book/PhotoVoiceNote";
import { resolveImageSrc, measureAspect } from "@/lib/media";
import { Home as HomeIcon, Upload, Trash2, Loader2, Check, Camera, Sparkles, X } from "lucide-react";
import ChapterCover from "@/components/book/ChapterCover";

export default function Fotos() {
  const [photos, setPhotos] = useState(null);
  const [stickers, setStickers] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadingSticker, setUploadingSticker] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const timeoutsRef = useRef({});

  useEffect(() => {
    loadPhotos();
    loadStickers();
  }, []);

  const loadPhotos = async () => {
    const list = await appClient.entities.Photo.list();
    const withUrls = await Promise.all(
      list.map(async (p) => {
        const url = await resolveImageSrc(p.photo_uri);
        const aspect = await measureAspect(url);
        return { ...p, url, aspect };
      })
    );
    setPhotos(withUrls);
  };

  const loadStickers = async () => {
    const list = await appClient.entities.Sticker.list();
    const withUrls = await Promise.all(
      list.map(async (s) => ({ ...s, url: await resolveImageSrc(s.sticker_uri) }))
    );
    setStickers(withUrls.filter((s) => s.url));
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_uri } = await appClient.integrations.Core.UploadPrivateFile({ file });
    await appClient.entities.Photo.create({ photo_uri: file_uri, caption: "" });
    await loadPhotos();
    setUploading(false);
  };

  const handleStickerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingSticker(true);
    const { file_uri } = await appClient.integrations.Core.UploadPrivateFile({ file });
    await appClient.entities.Sticker.create({ sticker_uri: file_uri });
    await loadStickers();
    setUploadingSticker(false);
  };

  const handleCaption = (photo, value) => {
    setPhotos((prev) => prev.map((p) => (p.id === photo.id ? { ...p, caption: value } : p)));
    clearTimeout(timeoutsRef.current[photo.id]);
    timeoutsRef.current[photo.id] = setTimeout(async () => {
      setSavingId(photo.id);
      await appClient.entities.Photo.update(photo.id, { caption: value });
      setSavingId(null);
    }, 800);
  };

  const handleAudio = (photo, uri) => {
    appClient.entities.Photo.update(photo.id, { audio_uri: uri });
    setPhotos((prev) => prev.map((p) => (p.id === photo.id ? { ...p, audio_uri: uri } : p)));
  };

  const handleDelete = async (photo) => {
    await appClient.entities.Photo.delete(photo.id);
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
  };

  const handleStickerDelete = async (sticker) => {
    await appClient.entities.Sticker.delete(sticker.id);
    setStickers((prev) => prev.filter((s) => s.id !== sticker.id));
  };

  if (!photos) {
    return (
      <div className="min-h-screen bg-[#fff9f6] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-rose-300" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff9f6] pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-rose-400 transition-colors mb-6"
        >
          <HomeIcon className="w-3.5 h-3.5" /> Volver al inicio
        </Link>

        <ChapterCover title="Álbum Familiar" subtitle="Fotografías y recuerdos" />

        <label className="cursor-pointer flex flex-col items-center justify-center gap-2 rounded-[2rem] border-2 border-dashed border-[#d9c9a3] bg-[#fbf3e4] p-10 mb-8 hover:bg-[#f6ead2] transition-colors">
          {uploading ? (
            <Loader2 className="w-6 h-6 animate-spin text-[#a67451]" />
          ) : (
            <Upload className="w-6 h-6 text-[#a67451]" />
          )}
          <span className="font-heading text-[#a67451]">
            {uploading ? "Subiendo foto..." : "Agregar una fotografía"}
          </span>
          <span className="text-xs text-stone-400 font-body">Se guardará en el álbum del libro</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </label>

        {photos.length === 0 ? (
          <p className="text-center text-stone-400 font-body italic">
            Todavía no hay fotos en el álbum.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-start">
            {photos.map((photo) => (
              <div key={photo.id} className="flex flex-col">
                <PhotoFrame photo={photo} />
                <Textarea
                  value={photo.caption || ""}
                  onChange={(e) => handleCaption(photo, e.target.value)}
                  placeholder="Escribe una nota o explicación sobre esta fotografía..."
                  className="mt-3 bg-[#fbf3e4] border border-[#d9c9a3] rounded-md font-heading italic text-sm text-[#7a5c44] placeholder:text-stone-400 focus-visible:ring-0 focus-visible:border-[#a67451] resize-none min-h-[70px]"
                />
                <PhotoVoiceNote
                  record={photo}
                  onSave={(uri) => handleAudio(photo, uri)}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-stone-400 flex items-center gap-1">
                    {savingId === photo.id ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" /> Guardando...
                      </>
                    ) : (
                      <>
                        <Check className="w-3 h-3 text-rose-300" /> Guardado
                      </>
                    )}
                  </span>
                  <button
                    onClick={() => handleDelete(photo)}
                    aria-label="Eliminar foto"
                    className="text-stone-300 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stickers decorativos */}
        <div className="mt-12">
          <h2 className="font-heading text-xl text-[#a67451] flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4" /> Stickers decorativos
          </h2>
          <p className="text-sm text-stone-400 font-body mb-4">
            Imágenes tipo sticker que decoran las hojas del álbum en el libro
          </p>
          <label className="cursor-pointer inline-flex items-center gap-2 rounded-full border-2 border-dashed border-[#d9c9a3] bg-[#fbf3e4] px-5 py-2.5 hover:bg-[#f6ead2] transition-colors">
            {uploadingSticker ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#a67451]" />
            ) : (
              <Camera className="w-4 h-4 text-[#a67451]" />
            )}
            <span className="font-heading text-sm text-[#a67451]">
              {uploadingSticker ? "Subiendo..." : "Agregar sticker"}
            </span>
            <input type="file" accept="image/*" className="hidden" onChange={handleStickerUpload} />
          </label>
          {stickers.length > 0 && (
            <div className="flex flex-wrap gap-4 mt-5">
              {stickers.map((sticker) => (
                <div key={sticker.id} className="relative">
                  <div className="w-20 h-20 rounded-xl bg-white border border-[#d9c9a3] shadow-sm p-1">
                    <Image src={sticker.url} alt="Sticker" className="w-full h-full" fittingType="fit" />
                  </div>
                  <button
                    onClick={() => handleStickerDelete(sticker)}
                    aria-label="Eliminar sticker"
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-400 hover:text-rose-400 hover:border-rose-200 transition-colors shadow-sm"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}