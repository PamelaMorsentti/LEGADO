import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { appClient } from "@/api/appClient";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image } from "@/components/ui/image";
import { Home, Upload, Check, Loader2 } from "lucide-react";
import ChapterCover from "@/components/book/ChapterCover";

export default function EstaSoyYo() {
  const [profile, setProfile] = useState({
    full_name: "",
    birth_info: "",
    profession: "",
    photo_url: "",
  });
  const [photoDisplayUrl, setPhotoDisplayUrl] = useState("");
  const [recordId, setRecordId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("idle");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    appClient.entities.ProfileInfo.list().then(async (res) => {
      if (res && res[0]) {
        setProfile(res[0]);
        setRecordId(res[0].id);
        if (res[0].photo_url) {
          const { signed_url } = await appClient.integrations.Core.CreateFileSignedUrl({
            file_uri: res[0].photo_url,
            expires_in: 3600,
          });
          setPhotoDisplayUrl(signed_url);
        }
      }
      setLoading(false);
    });
  }, []);

  const save = async (next) => {
    setStatus("saving");
    if (recordId) {
      await appClient.entities.ProfileInfo.update(recordId, next);
    } else {
      const created = await appClient.entities.ProfileInfo.create(next);
      setRecordId(created.id);
    }
    setStatus("saved");
  };

  const handleChange = (field) => (e) => {
    const next = { ...profile, [field]: e.target.value };
    setProfile(next);
    clearTimeout(window.__profileSaveTimeout);
    window.__profileSaveTimeout = setTimeout(() => save(next), 800);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_uri } = await appClient.integrations.Core.UploadPrivateFile({ file });
    const next = { ...profile, photo_url: file_uri };
    setProfile(next);
    await save(next);
    const { signed_url } = await appClient.integrations.Core.CreateFileSignedUrl({
      file_uri,
      expires_in: 3600,
    });
    setPhotoDisplayUrl(signed_url);
    setUploading(false);
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

        <ChapterCover title="Esta Soy Yo" />

        <div className="rounded-[2rem] bg-white border border-rose-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6 sm:p-10">
          <div className="flex flex-col items-center mb-8">
            <div className="w-40 h-32 rounded-2xl border-2 border-dashed border-rose-200 overflow-hidden flex items-center justify-center bg-rose-50/50 mb-3">
              {photoDisplayUrl ? (
                <Image src={photoDisplayUrl} alt="Foto" className="w-full h-full" fittingType="fill" />
              ) : (
                <span className="text-xs text-stone-400 px-4 text-center">Foto 5,6 x 7,9 cm</span>
              )}
            </div>
            <label className="cursor-pointer inline-flex items-center gap-2 text-sm text-rose-400 hover:text-rose-500 transition-colors">
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {profile.photo_url ? "Cambiar foto" : "Subir foto"}
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </label>
          </div>

          <div className="space-y-6">
            <div>
              <Label className="font-heading text-[#a67451]">Nombre completo</Label>
              <Input
                value={profile.full_name}
                onChange={handleChange("full_name")}
                placeholder="Tu nombre completo"
                className="mt-2 border-0 border-b border-rose-200 rounded-none focus-visible:ring-0 focus-visible:border-rose-400 px-0"
              />
            </div>
            <div>
              <Label className="font-heading text-[#a67451]">Fecha y lugar de nacimiento</Label>
              <Input
                value={profile.birth_info}
                onChange={handleChange("birth_info")}
                placeholder="Ej: 12 de marzo de 1975, en Santiago"
                className="mt-2 border-0 border-b border-rose-200 rounded-none focus-visible:ring-0 focus-visible:border-rose-400 px-0"
              />
            </div>
            <div>
              <Label className="font-heading text-[#a67451]">Profesión u oficio</Label>
              <Input
                value={profile.profession}
                onChange={handleChange("profession")}
                placeholder="Tu profesión u oficio"
                className="mt-2 border-0 border-b border-rose-200 rounded-none focus-visible:ring-0 focus-visible:border-rose-400 px-0"
              />
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