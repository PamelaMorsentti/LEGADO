import React from "react";
import { Image } from "@/components/ui/image";
import { Trash2, Pencil } from "lucide-react";

export const GENERATIONS = [
  {
    title: "Abuelos",
    relations: ["Abuela materna", "Abuelo materno", "Abuela paterna", "Abuelo paterno"],
  },
  { title: "Papá y tíos", relations: ["Papá", "Tío/a"] },
  { title: "Hermanos y primos", relations: ["Hermano/a", "Primo/a"] },
  { title: "Hijos", relations: ["Hijo/a", "Nuera/Yerno"] },
  { title: "Nietos", relations: ["Nieto/a"] },
  { title: "Otros", relations: ["Otro"] },
];

export const RELATIONS = [
  "Abuela materna",
  "Abuelo materno",
  "Abuela paterna",
  "Abuelo paterno",
  "Papá",
  "Tío/a",
  "Hermano/a",
  "Primo/a",
  "Hijo/a",
  "Nuera/Yerno",
  "Nieto/a",
  "Otro",
];

// Árbol genealógico agrupado por generaciones.
export default function TreeView({ members, onDelete, onEdit }) {
  const rows = GENERATIONS.map((g) => ({
    ...g,
    people: members.filter((m) => g.relations.includes(m.relation)),
  })).filter((g) => g.people.length > 0);

  if (rows.length === 0) {
    return (
      <p className="text-sm text-stone-400 font-body italic text-center">
        Todavía no hay familiares en el árbol.
      </p>
    );
  }

  return (
    <div>
      {rows.map((row, i) => (
        <div key={row.title}>
          {i > 0 && <div className="w-px h-5 bg-rose-200 mx-auto" />}
          <p className="text-center text-[10px] uppercase tracking-widest text-rose-300 font-body mb-2">
            {row.title}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {row.people.map((m) => (
              <div
                key={m.id}
                className="relative rounded-xl bg-white border border-[#e7d8c3] shadow-sm p-3 w-36 text-center"
              >
                {onEdit && (
                  <button
                    onClick={() => onEdit(m)}
                    aria-label="Editar familiar"
                    className="absolute top-1 right-6 text-stone-300 hover:text-[#a67451] transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(m)}
                    aria-label="Eliminar familiar"
                    className="absolute top-1 right-1 text-stone-300 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <div className="w-16 h-16 mx-auto rounded-lg overflow-hidden border-2 border-[#d9c9a3] bg-rose-50 shadow-sm">
                  {m.photoUrl ? (
                    <Image src={m.photoUrl} alt={m.name} className="w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-rose-200 text-xl font-heading">
                      {m.name.charAt(0)}
                    </div>
                  )}
                </div>
                <p className="mt-2 font-heading text-sm text-[#a67451] leading-tight break-words">
                  {m.name}
                </p>
                <p className="text-[10px] text-stone-400 font-body">{m.relation}</p>
                {m.birth_year && (
                  <p className="text-[10px] text-stone-300 font-body">n. {m.birth_year}</p>
                )}
                {m.note && (
                  <p className="mt-1 text-[10px] text-stone-400 font-body italic leading-snug">
                    {m.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}