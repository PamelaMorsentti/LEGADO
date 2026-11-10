import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { appClient } from "@/api/appClient";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import TimelineView from "@/components/book/TimelineView";
import ChapterCover from "@/components/book/ChapterCover";
import { resolveImageSrc } from "@/lib/media";
import { Home as HomeIcon, Plus, Loader2, Upload } from "lucide-react";

export default function Cronologia() {
  const [events, setEvents] = useState(null);
  const [year, setYear] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photoUri, setPhotoUri] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const list = await appClient.entities.TimelineEvent.list();
    const sorted = [...list].sort((a, b) =>
      (a.year || "").localeCompare(b.year || "", undefined, { numeric: true })
    );
    const withUrls = await Promise.all(
      sorted.map(async (e) => ({
        ...e,
        photoUrl: e.photo_uri ? await resolveImageSrc(e.photo_uri) : "",
      }))
    );
    setEvents(withUrls);
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
    if (!year.trim() || !title.trim()) return;
    setSaving(true);
    await appClient.entities.TimelineEvent.create({
      year: year.trim(),
      title: title.trim(),
      description: description.trim(),
      photo_uri: photoUri || null,
    });
    setYear("");
    setTitle("");
    setDescription("");
    setPhotoUri(null);
    await load();
    setSaving(false);
  };

  const handleDelete = async (event) => {
    await appClient.entities.TimelineEvent.delete(event.id);
    setEvents((prev) => prev.filter((e) => e.id !== event.id));
  };

  if (!events) {
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

        <ChapterCover title="Línea de Vida" subtitle="Los momentos clave, año por año" />

        {/* Formulario de nuevo hito */}
        <div className="rounded-[2rem] bg-white border border-rose-100 shadow-sm p-6 sm:p-8 mb-10">
          <h2 className="font-heading text-lg text-[#a67451] mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-rose-300" /> Agregar un hito
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] gap-3 mb-3">
            <Input
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="Año"
              className="border-[#e7d8c3] focus-visible:ring-rose-200"
            />
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título del momento, ej. Nos casamos"
              className="border-[#e7d8c3] focus-visible:ring-rose-200"
            />
          </div>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Cuéntanos cómo fue ese momento..."
            className="border-[#e7d8c3] rounded-lg font-body text-sm text-stone-600 placeholder:text-stone-400 focus-visible:ring-0 focus-visible:border-rose-300 resize-none min-h-[80px] mb-3"
          />
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <label className="cursor-pointer inline-flex items-center gap-2 text-xs rounded-full border border-[#d9c9a3] bg-[#fbf3e4] px-3 py-1.5 text-[#a67451] hover:bg-[#f6ead2] transition-colors">
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              {uploading ? "Subiendo..." : photoUri ? "Foto lista" : "Mini foto (opcional)"}
              <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </label>
            <Button
              onClick={handleAdd}
              disabled={!year.trim() || !title.trim() || saving}
              className="rounded-full bg-rose-400 hover:bg-rose-500 text-white text-sm"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Guardar hito
            </Button>
          </div>
        </div>

        {/* Línea de vida */}
        {events.length === 0 ? (
          <p className="text-center text-stone-400 font-body italic">
            Aún no hay hitos. Agrega el primero, por ejemplo tu año de nacimiento.
          </p>
        ) : (
          <div className="rounded-[2rem] bg-white border border-rose-100 shadow-sm p-6 sm:p-8">
            <TimelineView events={events} onDelete={handleDelete} />
          </div>
        )}
      </div>
    </div>
  );
}