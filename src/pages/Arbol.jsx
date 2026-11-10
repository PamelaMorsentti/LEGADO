import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { appClient } from "@/api/appClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import TreeView, { RELATIONS } from "@/components/book/TreeView";
import MemberEditDialog from "@/components/book/MemberEditDialog";
import ChapterCover from "@/components/book/ChapterCover";
import { resolveImageSrc } from "@/lib/media";
import { Home as HomeIcon, Plus, Loader2, Upload } from "lucide-react";

export default function Arbol() {
  const [members, setMembers] = useState(null);
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("Abuela materna");
  const [birthYear, setBirthYear] = useState("");
  const [note, setNote] = useState("");
  const [photoUri, setPhotoUri] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const list = await appClient.entities.FamilyMember.list();
    const withUrls = await Promise.all(
      list.map(async (m) => ({
        ...m,
        photoUrl: m.photo_uri ? await resolveImageSrc(m.photo_uri) : "",
      }))
    );
    setMembers(withUrls);
  };

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_uri } = await appClient.integrations.Core.UploadPrivateFile({ file });
    setPhotoUri(file_uri);
    setUploading(false);
  };

  const handleAdd = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await appClient.entities.FamilyMember.create({
      name: name.trim(),
      relation,
      birth_year: birthYear.trim(),
      note: note.trim(),
      photo_uri: photoUri || null,
    });
    setName("");
    setBirthYear("");
    setNote("");
    setPhotoUri(null);
    await load();
    setSaving(false);
  };

  const handleEdited = (updated) => {
    setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    setEditing(null);
  };

  const handleDelete = async (member) => {
    await appClient.entities.FamilyMember.delete(member.id);
    setMembers((prev) => prev.filter((m) => m.id !== member.id));
  };

  if (!members) {
    return (
      <div className="min-h-screen bg-[#fff9f6] flex items-center justify-center">
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
          <HomeIcon className="w-3.5 h-3.5" /> Volver al inicio
        </Link>

        <ChapterCover title="Árbol Genealógico" subtitle="Nuestra familia, rama por rama" />

        {/* Formulario */}
        <div className="rounded-[2rem] bg-white border border-rose-100 shadow-sm p-6 sm:p-8 mb-10">
          <h2 className="font-heading text-lg text-[#a67451] mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-rose-300" /> Agregar un familiar
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px] gap-3 mb-3">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre, ej. Rosa Elena"
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
          <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] gap-3 mb-3">
            <Input
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              placeholder="Año nac."
              className="border-[#e7d8c3] focus-visible:ring-rose-200"
            />
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Una nota corta sobre esta persona (opcional)"
              className="border-[#e7d8c3] focus-visible:ring-rose-200"
            />
          </div>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <label className="cursor-pointer inline-flex items-center gap-2 text-xs rounded-full border border-[#d9c9a3] bg-[#fbf3e4] px-3 py-1.5 text-[#a67451] hover:bg-[#f6ead2] transition-colors">
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              {uploading ? "Subiendo..." : photoUri ? "Foto lista" : "Foto pequeña (opcional)"}
              <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </label>
            <Button
              onClick={handleAdd}
              disabled={!name.trim() || saving}
              className="rounded-full bg-rose-400 hover:bg-rose-500 text-white text-sm"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Agregar al árbol
            </Button>
          </div>
        </div>

        {/* Árbol */}
        <div className="rounded-[2rem] bg-white border border-rose-100 shadow-sm p-6 sm:p-8">
          <TreeView members={members} onDelete={handleDelete} onEdit={setEditing} />
        </div>
      </div>
      {editing && (
        <MemberEditDialog member={editing} onClose={() => setEditing(null)} onSaved={handleEdited} />
      )}
    </div>
  );
}