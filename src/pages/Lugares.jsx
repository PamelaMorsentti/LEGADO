import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { appClient } from "@/api/appClient";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Image } from "@/components/ui/image";
import PlaceMap from "@/components/map/PlaceMap";
import ChapterCover from "@/components/book/ChapterCover";
import { resolveImageSrc } from "@/lib/media";
import {
  Home as HomeIcon,
  MapPin,
  Loader2,
  Trash2,
  Pencil,
  Upload,
  X,
} from "lucide-react";

const EMPTY = { title: "", place_name: "", date_range: "", story: "", lat: null, lng: null };

export default function Lugares() {
  const [places, setPlaces] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [photoUri, setPhotoUri] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const list = await appClient.entities.Place.list();
    const withUrls = await Promise.all(
      list.map(async (p) => ({
        ...p,
        url: p.photo_uri ? await resolveImageSrc(p.photo_uri) : "",
      }))
    );
    setPlaces(withUrls);
  };

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_uri } = await appClient.integrations.Core.UploadPrivateFile({ file });
    setPhotoUri(file_uri);
  };

  const reset = () => {
    setForm(EMPTY);
    setPhotoUri("");
    setEditingId(null);
  };

  const submit = async () => {
    if (!form.title.trim() || saving) return;
    setSaving(true);
    const data = { ...form, photo_uri: photoUri || null };
    if (editingId) {
      await appClient.entities.Place.update(editingId, data);
    } else {
      await appClient.entities.Place.create(data);
    }
    reset();
    await load();
    setSaving(false);
  };

  const handleEdit = (p) => {
    setForm({
      title: p.title || "",
      place_name: p.place_name || "",
      date_range: p.date_range || "",
      story: p.story || "",
      lat: p.lat ?? null,
      lng: p.lng ?? null,
    });
    setPhotoUri(p.photo_uri || "");
    setEditingId(p.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (p) => {
    await appClient.entities.Place.delete(p.id);
    await load();
  };

  if (!places) {
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

        <ChapterCover title="Lugares de mi vida" subtitle="Los sitios que cuentan mi historia" />

        {/* Mapa */}
        <div className="rounded-[2rem] bg-white border border-rose-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-5 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-rose-300" />
            <h2 className="font-heading text-lg text-[#a67451]">
              {editingId ? "Lugar del recuerdo" : "Marca el punto en el mapa"}
            </h2>
          </div>
          <p className="text-sm text-stone-400 font-body mb-4">
            Toca el mapa para marcar dónde está el lugar; el punto rosa se coloca ahí.
          </p>
          <PlaceMap
            lat={form.lat}
            lng={form.lng}
            onPick={(lat, lng) => setForm((f) => ({ ...f, lat, lng }))}
          />
        </div>

        {/* Formulario */}
        <div className="rounded-[2rem] bg-white border border-rose-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6 sm:p-8 mb-10">
          <h2 className="font-heading text-xl text-[#a67451] mb-5 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-300" />
            {editingId ? "Editar lugar" : "Agregar un lugar"}
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Label className="font-heading text-[#a67451]">Nombre del hito</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ej: Donde nací, La casa de la infancia"
                  className="mt-1.5 border-rose-200 focus-visible:border-rose-400"
                />
              </div>
              <div>
                <Label className="font-heading text-[#a67451]">Época</Label>
                <Input
                  value={form.date_range}
                  onChange={(e) => setForm({ ...form, date_range: e.target.value })}
                  placeholder="Ej: 1962-1970"
                  className="mt-1.5 border-rose-200 focus-visible:border-rose-400"
                />
              </div>
            </div>
            <div>
              <Label className="font-heading text-[#a67451]">Ciudad o dirección</Label>
              <Input
                value={form.place_name}
                onChange={(e) => setForm({ ...form, place_name: e.target.value })}
                placeholder="Ej: Valparaíso, calle Los Almendros 25"
                className="mt-1.5 border-rose-200 focus-visible:border-rose-400"
              />
            </div>
            <div>
              <Label className="font-heading text-[#a67451]">La anécdota</Label>
              <Textarea
                value={form.story}
                onChange={(e) => setForm({ ...form, story: e.target.value })}
                placeholder="Cuenta lo que viviste, viste o sentiste en este lugar..."
                className="mt-1.5 min-h-[110px] border-rose-200 rounded-xl focus-visible:ring-0 focus-visible:border-rose-400 bg-transparent resize-none font-body text-stone-700 p-3"
              />
            </div>
            <div className="flex items-center flex-wrap gap-3">
              <label className="cursor-pointer inline-flex items-center gap-2 rounded-full border border-[#d9c9a3] bg-[#fbf3e4] px-4 py-2 hover:bg-[#f6ead2] transition-colors">
                <Upload className="w-3.5 h-3.5 text-[#a67451]" />
                <span className="font-heading text-sm text-[#a67451]">
                  {photoUri ? "Foto lista" : "Foto del lugar (opcional)"}
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
              </label>
              {photoUri && (
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-rose-100">
                    <Image src={photoUri} alt="Foto del lugar" className="w-full h-full" fittingType="fill" />
                  </div>
                  <button
                    onClick={() => setPhotoUri("")}
                    aria-label="Quitar foto"
                    className="text-stone-300 hover:text-rose-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 mt-5">
            {editingId && (
              <button
                onClick={reset}
                className="text-sm text-stone-400 hover:text-rose-400 transition-colors font-body"
              >
                Cancelar
              </button>
            )}
            <button
              onClick={submit}
              disabled={!form.title.trim() || saving}
              className="inline-flex items-center gap-2 rounded-full bg-rose-400 px-5 py-2 text-sm text-white hover:bg-rose-500 transition-colors disabled:opacity-40 font-body"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingId ? "Guardar cambios" : "Agregar al mapa"}
            </button>
          </div>
        </div>

        {/* Lista */}
        {places.length === 0 ? (
          <p className="text-center text-stone-400 font-body italic">
            Todavía no hay lugares. Marca el primero en el mapa.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {places.map((p) => (
              <div
                key={p.id}
                className="rounded-[2rem] bg-white border border-rose-100 shadow-sm p-5 flex flex-col"
              >
                {p.url && (
                  <div className="h-40 rounded-2xl overflow-hidden border border-rose-100 mb-4">
                    <Image src={p.url} alt={p.title} className="w-full h-full" fittingType="fill" />
                  </div>
                )}
                <h3 className="font-heading text-lg text-[#a67451] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-300 flex-shrink-0" /> {p.title}
                </h3>
                {(p.place_name || p.date_range) && (
                  <p className="text-xs text-stone-400 font-body mt-1">
                    {[p.place_name, p.date_range].filter(Boolean).join(" · ")}
                  </p>
                )}
                {p.story && (
                  <p className="whitespace-pre-wrap font-body text-sm text-stone-600 leading-relaxed mt-3 flex-1">
                    {p.story}
                  </p>
                )}
                <div className="flex items-center justify-end gap-3 mt-4">
                  <button
                    onClick={() => handleEdit(p)}
                    aria-label={`Editar ${p.title}`}
                    className="text-stone-300 hover:text-rose-400 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(p)}
                    aria-label={`Eliminar ${p.title}`}
                    className="text-stone-300 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}