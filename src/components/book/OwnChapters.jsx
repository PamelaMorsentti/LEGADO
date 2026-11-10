import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { appClient } from "@/api/appClient";
import { Input } from "@/components/ui/input";
import { Plus, Feather, ChevronRight, X } from "lucide-react";
import { ownSectionKey } from "@/lib/ownContent";

export default function OwnChapters({ progress = {} }) {
  const [chapters, setChapters] = useState([]);
  const [counts, setCounts] = useState({});
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const [ch, questions] = await Promise.all([
      appClient.entities.OwnChapter.list(),
      appClient.entities.OwnQuestion.list(),
    ]);
    const c = {};
    questions.forEach((q) => {
      c[q.section_key] = (c[q.section_key] || 0) + 1;
    });
    setCounts(c);
    setChapters(ch);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!title.trim() || busy) return;
    setBusy(true);
    await appClient.entities.OwnChapter.create({ title: title.trim() });
    setTitle("");
    await load();
    setBusy(false);
  };

  const remove = async (chapter) => {
    const key = ownSectionKey(chapter.id);
    await appClient.entities.OwnQuestion.deleteMany({ section_key: key });
    await appClient.entities.Answer.deleteMany({ section_key: key });
    await appClient.entities.OwnChapter.delete(chapter.id);
    await load();
  };

  return (
    <div className="mt-10">
      <h2 className="font-heading text-xl text-[#a67451] mb-5 flex items-center gap-2">
        <Feather className="w-5 h-5" /> Mis capítulos
      </h2>

      <div className="rounded-2xl bg-white border border-rose-100 shadow-sm p-5">
        <p className="text-sm text-stone-500 font-body mb-3">
          Crea un capítulo con tus propias preguntas: una historia que sólo tú puedes contar.
        </p>
        <div className="flex items-center gap-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && create()}
            placeholder="Título del capítulo, ej. Mi viaje a la costa"
            className="font-body"
          />
          <button
            onClick={create}
            disabled={busy || !title.trim()}
            className="inline-flex items-center gap-1.5 text-sm rounded-full bg-[#a67451] text-white px-4 py-2 hover:bg-[#966647] transition-colors disabled:opacity-40 flex-shrink-0"
          >
            <Plus className="w-4 h-4" /> Crear
          </button>
        </div>
      </div>

      {chapters.length > 0 && (
        <div className="mt-3 space-y-3">
          {chapters.map((chapter) => {
            const key = ownSectionKey(chapter.id);
            const total = counts[key] || 0;
            const done = progress[key] || 0;
            return (
              <div
                key={chapter.id}
                className="flex items-center gap-3 rounded-2xl bg-white border border-rose-100 shadow-sm px-5 py-4 hover:shadow-md transition-shadow"
              >
                <Link to={`/mi-capitulo/${chapter.id}`} className="flex-1 flex items-center justify-between gap-3">
                  <span className="font-heading text-[#a67451]">{chapter.title}</span>
                  <span className="text-xs text-stone-400 flex items-center gap-1">
                    {done}/{total} <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
                <button
                  onClick={() => remove(chapter)}
                  className="text-stone-300 hover:text-rose-400 transition-colors"
                  aria-label="Eliminar capítulo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}