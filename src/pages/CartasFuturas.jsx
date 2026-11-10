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
  Lock,
  MailOpen,
  Plus,
} from "lucide-react";

const isSealed = (openDate) => new Date(`${openDate}T23:59:59`) > new Date();

export default function CartasFuturas() {
  const [letters, setLetters] = useState(null);
  const [form, setForm] = useState({ title: "", message: "", open_date: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    appClient.entities.FutureLetter.list().then(setLetters);
  }, []);

  const submit = async () => {
    if (!form.message.trim() || !form.open_date || saving) return;
    setSaving(true);
    await appClient.entities.FutureLetter.create({
      title: form.title.trim() || "Carta para el futuro",
      message: form.message,
      open_date: form.open_date,
    });
    setForm({ title: "", message: "", open_date: "" });
    setLetters(await appClient.entities.FutureLetter.list());
    setSaving(false);
  };

  const handleDelete = async (letter) => {
    await appClient.entities.FutureLetter.delete(letter.id);
    setLetters(await appClient.entities.FutureLetter.list());
  };

  if (!letters) {
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
          title="Cartas para el futuro"
          subtitle="Mensajes sellados que se abren en su día"
        />

        {/* Formulario */}
        <div className="rounded-[2rem] bg-white border border-rose-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6 sm:p-8 mb-10">
          <h2 className="font-heading text-xl text-[#a67451] mb-5 flex items-center gap-2">
            <Plus className="w-4 h-4 text-rose-300" /> Sellar una carta
          </h2>
          <div className="space-y-4">
            <div>
              <Label className="font-heading text-[#a67451]">Ocasión (opcional)</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ej: Para tu cumpleaños 30, Para tu boda"
                className="mt-1.5 border-rose-200 focus-visible:border-rose-400"
              />
            </div>
            <div>
              <Label className="font-heading text-[#a67451]">Tu mensaje</Label>
              <Textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Escribe lo que quieres decirle ese día..."
                className="mt-1.5 min-h-[140px] border-rose-200 rounded-xl focus-visible:ring-0 focus-visible:border-rose-400 bg-transparent resize-none font-body text-stone-700 p-3"
              />
            </div>
            <div className="sm:max-w-xs">
              <Label className="font-heading text-[#a67451]">Se abre el</Label>
              <Input
                type="date"
                value={form.open_date}
                onChange={(e) => setForm({ ...form, open_date: e.target.value })}
                className="mt-1.5 border-rose-200 focus-visible:border-rose-400"
              />
            </div>
          </div>
          <div className="flex justify-end mt-5">
            <button
              onClick={submit}
              disabled={!form.message.trim() || !form.open_date || saving}
              className="inline-flex items-center gap-2 rounded-full bg-rose-400 px-5 py-2 text-sm text-white hover:bg-rose-500 transition-colors disabled:opacity-40 font-body"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Sellar carta
            </button>
          </div>
        </div>

        {/* Cartas */}
        {letters.length === 0 ? (
          <p className="text-center text-stone-400 font-body italic">
            Aún no hay cartas selladas. Escribe la primera.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {letters.map((letter) => {
              const sealed = isSealed(letter.open_date);
              return (
                <div
                  key={letter.id}
                  className="rounded-[2rem] bg-white border border-rose-100 shadow-sm p-6 flex flex-col"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-heading text-lg text-[#a67451]">{letter.title}</h3>
                    <button
                      onClick={() => handleDelete(letter)}
                      aria-label="Eliminar carta"
                      className="text-stone-300 hover:text-rose-400 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {sealed ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                      <div className="w-20 h-14 rounded-lg bg-[#fbf3e4] border-2 border-[#d9c9a3] shadow-sm flex items-center justify-center rotate-3">
                        <Lock className="w-5 h-5 text-[#c9986c]" />
                      </div>
                      <p className="mt-3 text-sm font-heading text-[#a67451]">Carta sellada</p>
                      <p className="text-xs text-stone-400 font-body mt-1">
                        Se abre el {letter.open_date}
                      </p>
                    </div>
                  ) : (
                    <div className="flex-1 mt-3">
                      <p className="text-xs text-rose-400 font-body flex items-center gap-1.5 mb-2">
                        <MailOpen className="w-3.5 h-3.5" /> Abierta desde el {letter.open_date}
                      </p>
                      <p className="whitespace-pre-wrap font-body text-sm text-stone-600 leading-relaxed">
                        {letter.message}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}