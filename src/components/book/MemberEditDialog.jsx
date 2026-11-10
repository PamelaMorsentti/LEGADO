import React, { useState, useEffect } from "react";
import { appClient } from "@/api/appClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { RELATIONS } from "@/components/book/TreeView";
import { Loader2, X, Upload } from "lucide-react";

// Modal para editar los datos y la foto de un familiar existente.
export default function MemberEditDialog({ member, onClose, onSaved }) {
  const [name, setName] = useState(member.name);
  const [relation, setRelation] = useState(member.relation);
  const [birthYear, setBirthYear] = useState(member.birth_year || "");
  const [note, setNote] = useState(member.note || "");
  const [photoUri, setPhotoUri] = useState(member.photo_uri || null);
  const [photoUrl, setPhotoUrl] = useState(member.photoUrl || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_uri } = await appClient.integrations.Core.UploadPrivateFile({ file });
    setPhotoUri(file_uri);
    setPhotoUrl(URL.createObjectURL(file));
    setUploading(false);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await appClient.entities.FamilyMember.update(member.id, {
      name: name.trim(),
      relation,
      birth_year: birthYear.trim(),
      note: note.trim(),
      photo_uri: photoUri,
    });
    onSaved({
      ...member,
      name: name.trim(),
      relation,
      birth_year: birthYear.trim(),
      note: note.trim(),
      photo_uri: photoUri,
      photoUrl: photoUrl || member.photoUrl,
    });
    setSaving(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[2rem] bg-white border border-rose-100 shadow-lg p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-heading text-lg text-[#a67451]">Editar familiar</h3>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="text-stone-300 hover:text-rose-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-[#d9c9a3] bg-rose-50 shadow-sm flex-shrink-0">
            {photoUrl ? (
              <Image src={photoUrl} alt={name} className="w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-rose-200 text-2xl font-heading">
                {(name || "?").charAt(0)}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="cursor-pointer inline-flex items-center gap-2 text-xs rounded-full border border-[#d9c9a3] bg-[#fbf3e4] px-3 py-1.5 text-[#a67451] hover:bg-[#f6ead2] transition-colors">
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              {uploading ? "Subiendo..." : photoUrl ? "Cambiar foto" : "Agregar foto"}
              <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </label>
            {photoUrl && (
              <button
                onClick={() => {
                  setPhotoUri(null);
                  setPhotoUrl("");
                }}
                className="text-xs text-stone-400 hover:text-rose-400 transition-colors"
              >
                Quitar foto
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px] gap-3 mb-3">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre"
            className="border-[#e7d8c3] focus-visible:ring-rose-200"
          />
          <select
            value={relation}
            onChange={(e) => setRelation(e.target.value)}
            className="rounded-md border border-[#e7d8c3] bg-white px-3 py-2 text-sm font-body text-stone-600 focus:outline-none focus:ring-2 focus:ring-rose-200"
          >
            {RELATIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] gap-3 mb-5">
          <Input
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
            placeholder="Año nac."
            className="border-[#e7d8c3] focus-visible:ring-rose-200"
          />
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Una nota corta (opcional)"
            className="border-[#e7d8c3] focus-visible:ring-rose-200"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button
            onClick={onClose}
            variant="ghost"
            className="rounded-full text-stone-400 hover:text-stone-600 text-sm"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="rounded-full bg-rose-400 hover:bg-rose-500 text-white text-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Guardar cambios
          </Button>
        </div>
      </div>
    </div>
  );
}