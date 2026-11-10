import React from "react";
import { Trash2 } from "lucide-react";

// Tarjeta estilo manuscrito para recetas, remedios y tradiciones.
export default function RecipeCard({ recipe, onDelete }) {
  const kindLabel =
    { receta: "Receta", remedio: "Remedio", tradicion: "Tradición" }[recipe.kind] || "Receta";
  return (
    <div className="relative rounded-lg bg-[#fffdf8] border border-[#d9c9a3] shadow-sm overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(169,138,88,0.12) 0px, rgba(169,138,88,0.12) 1px, transparent 1px, transparent 26px)",
        }}
      />
      <div className="relative p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-widest text-rose-400 bg-rose-50 border border-rose-100 rounded-full px-2.5 py-0.5">
            {kindLabel}
          </span>
          {onDelete && (
            <button
              onClick={() => onDelete(recipe)}
              aria-label="Eliminar"
              className="text-stone-300 hover:text-rose-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
        <h3 className="font-heading text-lg text-[#a67451] leading-snug">{recipe.title}</h3>
        {recipe.learned_from && (
          <p className="text-xs italic text-stone-400 mt-0.5">
            Aprendida de {recipe.learned_from}
          </p>
        )}
        <p className="font-manuscrita text-stone-700 whitespace-pre-wrap mt-3 leading-relaxed">
          {recipe.content}
        </p>
        {recipe.notes && (
          <p className="text-xs text-stone-400 mt-3 border-t border-dashed border-[#d9c9a3] pt-2 whitespace-pre-wrap font-body">
            {recipe.notes}
          </p>
        )}
      </div>
    </div>
  );
}