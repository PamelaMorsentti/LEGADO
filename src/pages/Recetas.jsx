import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { appClient } from "@/api/appClient";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import RecipeCard from "@/components/book/RecipeCard";
import ChapterCover from "@/components/book/ChapterCover";
import { Home as HomeIcon, Plus, Loader2 } from "lucide-react";

const KINDS = [
  { value: "receta", label: "Receta" },
  { value: "remedio", label: "Remedio" },
  { value: "tradicion", label: "Tradición" },
];

export default function Recetas() {
  const [recipes, setRecipes] = useState(null);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState("receta");
  const [learnedFrom, setLearnedFrom] = useState("");
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    appClient.entities.Recipe.list().then((list) => setRecipes(list));
  }, []);

  const handleAdd = async () => {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    await appClient.entities.Recipe.create({
      title: title.trim(),
      kind,
      learned_from: learnedFrom.trim(),
      content: content.trim(),
      notes: notes.trim(),
    });
    setTitle("");
    setLearnedFrom("");
    setContent("");
    setNotes("");
    setKind("receta");
    const list = await appClient.entities.Recipe.list();
    setRecipes(list);
    setSaving(false);
  };

  const handleDelete = async (recipe) => {
    await appClient.entities.Recipe.delete(recipe.id);
    setRecipes((prev) => prev.filter((r) => r.id !== recipe.id));
  };

  if (!recipes) {
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

        <ChapterCover title="Recetas y Tradiciones" subtitle="Los sabores de nuestra familia" />

        {/* Formulario */}
        <div className="rounded-[2rem] bg-white border border-rose-100 shadow-sm p-6 sm:p-8 mb-10">
          <h2 className="font-heading text-lg text-[#a67451] mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-rose-300" /> Nueva tarjeta
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_150px] gap-3 mb-3">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título, ej. Sopaipillas de la abuela"
              className="border-[#e7d8c3] focus-visible:ring-rose-200"
            />
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              className="rounded-md border border-[#e7d8c3] bg-white px-3 py-2 text-sm font-body text-stone-600 focus:outline-none focus:ring-2 focus:ring-rose-200"
            >
              {KINDS.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </select>
          </div>
          <Input
            value={learnedFrom}
            onChange={(e) => setLearnedFrom(e.target.value)}
            placeholder="¿De quién la aprendiste? (opcional)"
            className="border-[#e7d8c3] focus-visible:ring-rose-200 mb-3"
          />
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Ingredientes y pasos, o describe la tradición..."
            className="border-[#e7d8c3] rounded-lg font-body text-sm text-stone-600 placeholder:text-stone-400 focus-visible:ring-0 focus-visible:border-rose-300 resize-none min-h-[120px] mb-3"
          />
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notas y secretos (opcional)"
            className="border-[#e7d8c3] rounded-lg font-body text-sm text-stone-600 placeholder:text-stone-400 focus-visible:ring-0 focus-visible:border-rose-300 resize-none min-h-[60px] mb-4"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleAdd}
              disabled={!title.trim() || !content.trim() || saving}
              className="rounded-full bg-rose-400 hover:bg-rose-500 text-white text-sm"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Guardar tarjeta
            </Button>
          </div>
        </div>

        {/* Tarjetas */}
        {recipes.length === 0 ? (
          <p className="text-center text-stone-400 font-body italic">
            Aún no hay tarjetas. Agrega la primera receta o tradición de la familia.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            {recipes.map((r) => (
              <RecipeCard key={r.id} recipe={r} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}