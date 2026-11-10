import React, { useEffect, useState } from "react";
import { appClient } from "@/api/appClient";
import { BONUS_QUESTIONS, SORPRESA_KEY } from "@/lib/bonusQuestions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, RefreshCw, Check, Loader2 } from "lucide-react";

export default function SurpriseQuestion() {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * BONUS_QUESTIONS.length));
  const [answer, setAnswer] = useState(null);
  const [text, setText] = useState("");
  const [status, setStatus] = useState("");
  const question = BONUS_QUESTIONS[idx];

  useEffect(() => {
    let active = true;
    setAnswer(null);
    setText("");
    setStatus("");
    appClient.entities.Answer.filter({ section_key: SORPRESA_KEY, question_index: idx }).then((res) => {
      if (!active) return;
      if (res && res[0]) {
        setAnswer(res[0]);
        setText(res[0].answer_text || "");
      }
    });
    return () => {
      active = false;
    };
  }, [idx]);

  const save = async () => {
    if (!text.trim()) return;
    setStatus("saving");
    if (answer) {
      await appClient.entities.Answer.update(answer.id, { answer_text: text, question_text: question });
    } else {
      const created = await appClient.entities.Answer.create({
        section_key: SORPRESA_KEY,
        question_index: idx,
        question_text: question,
        answer_text: text,
      });
      setAnswer(created);
    }
    setStatus("saved");
  };

  const shuffle = () =>
    setIdx(() => Math.floor(Math.random() * BONUS_QUESTIONS.length));

  return (
    <div className="rounded-2xl bg-rose-50 border border-rose-200 shadow-sm p-5 mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="font-heading text-sm text-[#a67451] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-rose-300" /> Pregunta sorpresa
        </span>
        <button
          onClick={shuffle}
          aria-label="Otra pregunta"
          className="text-stone-300 hover:text-rose-400 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
      <p className="font-heading text-[#7a5c44] mb-3">{question}</p>
      <Textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setStatus("");
        }}
        placeholder="Escribe tu recuerdo cuando tengas un ratito..."
        className="bg-white/80 border-rose-100 rounded-lg font-body text-sm text-stone-600 placeholder:text-stone-400 focus-visible:ring-0 focus-visible:border-rose-300 resize-none min-h-[70px]"
      />
      <div className="flex items-center justify-end gap-2 mt-2">
        {status === "saving" && <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-300" />}
        {status === "saved" && (
          <span className="text-xs text-rose-400 flex items-center gap-1">
            <Check className="w-3 h-3" /> Guardado
          </span>
        )}
        <Button
          size="sm"
          onClick={save}
          disabled={!text.trim() || status === "saving"}
          className="rounded-full bg-rose-400 hover:bg-rose-500 text-white text-xs"
        >
          Guardar
        </Button>
      </div>
    </div>
  );
}