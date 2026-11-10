import React, { useEffect, useState } from "react";
import { appClient } from "@/api/appClient";
import QuestionCard from "@/components/book/QuestionCard";
import { Input } from "@/components/ui/input";
import { Plus, X, Sparkles } from "lucide-react";
import { ownIndex, sortByOrder } from "@/lib/ownContent";

export default function OwnQuestions({ sectionKey, answers, fontClass, onAnswerCreated }) {
  const [list, setList] = useState([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    appClient.entities.OwnQuestion.filter({ section_key: sectionKey }).then((res) => {
      if (active) setList(sortByOrder(res));
    });
    return () => {
      active = false;
    };
  }, [sectionKey]);

  const add = async () => {
    if (!text.trim() || busy) return;
    setBusy(true);
    const created = await appClient.entities.OwnQuestion.create({
      section_key: sectionKey,
      question_text: text.trim(),
      order: list.length,
    });
    setList((prev) => [...prev, created]);
    setText("");
    setBusy(false);
  };

  const remove = async (id) => {
    await appClient.entities.OwnQuestion.delete(id);
    setList((prev) => prev.filter((q) => q.id !== id));
  };

  return (
    <div className="mt-10">
      <div className="rounded-[2rem] border border-[#d9c9a3] bg-[#fbf3e4] p-6 sm:p-7 mb-6">
        <h3 className="font-heading text-lg text-[#a67451] flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4" /> Tus propias preguntas
        </h3>
        <p className="text-sm text-stone-500 font-body mb-4">
          ¿Hay algo más que quieras contar en este capítulo? Escríbelo como una pregunta tuya.
        </p>
        <div className="flex items-center gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Escribe una pregunta para ti misma..."
            className="bg-white border-[#e5d8bd] font-body"
          />
          <button
            onClick={add}
            disabled={busy || !text.trim()}
            className="inline-flex items-center gap-1.5 text-sm rounded-full bg-[#a67451] text-white px-4 py-2 hover:bg-[#966647] transition-colors disabled:opacity-40 flex-shrink-0"
          >
            <Plus className="w-4 h-4" /> Añadir
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {list.map((q) => (
          <div key={q.id} className="relative">
            <button
              onClick={() => remove(q.id)}
              className="absolute -top-2 -right-2 z-10 w-7 h-7 rounded-full bg-white border border-rose-200 text-stone-300 hover:text-rose-400 flex items-center justify-center shadow-sm"
              aria-label="Quitar pregunta"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <QuestionCard
              index={ownIndex(q.order)}
              questionText={q.question_text}
              answer={answers?.[ownIndex(q.order)] || { section_key: sectionKey }}
              fontClass={fontClass}
              onSaved={(created) => onAnswerCreated(ownIndex(q.order), created)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}