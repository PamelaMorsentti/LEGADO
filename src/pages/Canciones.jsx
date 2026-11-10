import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { appClient } from "@/api/appClient";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ChapterCover from "@/components/book/ChapterCover";
import {
  Home as HomeIcon,
  Loader2,
  Trash2,
  Music,
  Plus,
} from "lucide-react";

export default function Canciones() {
  const [songs, setSongs] = useState(null);
  const [form, setForm] = useState({ title: "", artist: "", era: "", story: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    appClient.entities.Song.list().then(setSongs);
  }, []);

  const submit = async () => {
    if (!form.title.trim() || saving) return;
    setSaving(true);
    await appClient.entities.Song.create({
      title: form.title.trim(),
      artist: form.artist.trim() || null,
      era: form.era.trim() || null,
      story: form.story,
    });
    setForm({ title: "", artist: "", era: "", story: "" });
    setSongs(await appClient.entities.Song.list());
    setSaving(false);
  };

  const handleDelete = async (song) => {
    await appClient.entities.Song.delete(song.id);
    setSongs(await appClient.entities.Song.list());
  };

  if (!songs) {
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

        <ChapterCover
          title="Canciones de mi vida"
          subtitle="La banda sonora de una historia"
        />

        {/* Formulario */}
        <div className="rounded-[2rem] bg-white border border-rose-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6 sm:p-8 mb-10">
          <h2 className="font-heading text-xl text-[#a67451] mb-5 flex items-center gap-2">
            <Plus className="w-4 h-4 text-rose-300" /> Agregar una canción
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Label className="font-heading text-[#a67451]">Canción</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ej: Volare"
                  className="mt-1.5 border-rose-200 focus-visible:border-rose-400"
                />
              </div>
              <div>
                <Label className="font-heading text-[#a67451]">Época</Label>
                <Input
                  value={form.era}
                  onChange={(e) => setForm({ ...form, era: e.target.value })}
                  placeholder="Ej: Los años 80"
                  className="mt-1.5 border-rose-200 focus-visible:border-rose-400"
                />
              </div>
            </div>
            <div>
              <Label className="font-heading text-[#a67451]">Intérprete (opcional)</Label>
              <Input
                value={form.artist}
                onChange={(e) => setForm({ ...form, artist: e.target.value })}
                placeholder="Ej: Gipsy Kings"
                className="mt-1.5 border-rose-200 focus-visible:border-rose-400"
              />
            </div>
            <div>
              <Label className="font-heading text-[#a67451]">La historia detrás</Label>
              <Textarea
                value={form.story}
                onChange={(e) => setForm({ ...form, story: e.target.value })}
                placeholder="¿Por qué esta canción te marca? ¿Qué recuerdos trae?"
                className="mt-1.5 min-h-[110px] border-rose-200 rounded-xl focus-visible:ring-0 focus-visible:border-rose-400 bg-transparent resize-none font-body text-stone-700 p-3"
              />
            </div>
          </div>
          <div className="flex justify-end mt-5">
            <button
              onClick={submit}
              disabled={!form.title.trim() || saving}
              className="inline-flex items-center gap-2 rounded-full bg-rose-400 px-5 py-2 text-sm text-white hover:bg-rose-500 transition-colors disabled:opacity-40 font-body"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Agregar a la playlist
            </button>
          </div>
        </div>

        {/* Playlist */}
        {songs.length === 0 ? (
          <p className="text-center text-stone-400 font-body italic">
            Tu playlist está vacía. Agrega la primera canción.
          </p>
        ) : (
          <div className="space-y-4">
            {songs.map((s) => (
              <div
                key={s.id}
                className="rounded-[2rem] bg-white border border-rose-100 shadow-sm p-5 flex gap-4"
              >
                <div className="w-11 h-11 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                  <Music className="w-5 h-5 text-rose-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading text-lg text-[#a67451] leading-snug">
                    {s.title}
                    {s.artist ? <span className="text-stone-400 text-sm"> — {s.artist}</span> : null}
                  </h3>
                  {s.era && <p className="text-xs text-stone-400 font-body">{s.era}</p>}
                  {s.story && (
                    <p className="whitespace-pre-wrap font-body text-sm text-stone-600 leading-relaxed mt-2">
                      {s.story}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(s)}
                  aria-label={`Eliminar ${s.title}`}
                  className="text-stone-300 hover:text-rose-400 transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}