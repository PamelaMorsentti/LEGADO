import React, { useEffect, useState, useRef, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Check, Loader2 } from "lucide-react";
import { appClient } from "@/api/appClient";
import VoiceNote from "@/components/book/VoiceNote";
import DictateButton from "@/components/book/DictateButton";

export default function QuestionCard({ index, questionText, answer, fontClass = "", onSaved }) {
  const [value, setValue] = useState(answer?.answer_text || "");
  const [status, setStatus] = useState("idle"); // idle | saving | saved
  const timeoutRef = useRef(null);
  const answerIdRef = useRef(answer?.id || null);

  useEffect(() => {
    if (answer?.id) answerIdRef.current = answer.id;
  }, [answer?.id]);

  const save = useCallback(
    async (text) => {
      setStatus("saving");
      if (answerIdRef.current) {
        await appClient.entities.Answer.update(answerIdRef.current, { answer_text: text });
      } else {
        const created = await appClient.entities.Answer.create({
          section_key: answer.section_key,
          question_index: index,
          question_text: questionText,
          answer_text: text,
        });
        answerIdRef.current = created.id;
        onSaved && onSaved(created);
      }
      setStatus("saved");
    },
    [answer, index, questionText, onSaved]
  );

  const handleChange = (e) => {
    const text = e.target.value;
    setValue(text);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => save(text), 900);
  };

  const handleDictation = (text) => {
    const next = value.trim() ? `${value.trim()}\n\n${text}` : text;
    setValue(next);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    save(next);
  };

  return (
    <div className="relative rounded-[2rem] bg-white border border-rose-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6 sm:p-8">
      <h3 className="font-heading text-lg sm:text-xl text-[#a67451] mb-4 leading-snug">
        {questionText}
      </h3>
      <Textarea
        value={value}
        onChange={handleChange}
        placeholder="Escribe aquí tu recuerdo..."
        className={`min-h-[140px] border-0 border-b border-rose-200 rounded-none focus-visible:ring-0 focus-visible:border-rose-400 bg-transparent resize-none ${
          fontClass || "font-body"
        } text-stone-700 px-0`}
      />
      <div className="flex items-center justify-between gap-3 flex-wrap mt-3">
        <DictateButton onText={handleDictation} />
        <VoiceNote answer={answer} index={index} questionText={questionText} onSaved={onSaved} />
      </div>
      <div className="h-5 flex items-center justify-end mt-2 text-xs text-stone-400">
        {status === "saving" && (
          <span className="flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" /> Guardando...
          </span>
        )}
        {status === "saved" && (
          <span className="flex items-center gap-1 text-rose-400">
            <Check className="w-3 h-3" /> Guardado
          </span>
        )}
      </div>
    </div>
  );
}