import React from "react";
import { Lock, MailOpen } from "lucide-react";

export default function LetterBookPage({ letter }) {
  const isOpen = new Date(`${letter.open_date}T23:59:59`) <= new Date();

  return (
    <div className="flex flex-col h-full">
      <div className="text-center mb-6">
        <h3 className="font-heading text-xl text-[#a67451]">
          {letter.title || "Carta para el futuro"}
        </h3>
      </div>
      {isOpen ? (
        <div className="flex-1">
          <p className="text-xs text-stone-400 text-center mb-4 font-body flex items-center justify-center gap-1.5">
            <MailOpen className="w-3.5 h-3.5 text-rose-300" /> Abierta desde el {letter.open_date}
          </p>
          <p className="whitespace-pre-wrap font-body text-stone-700 leading-relaxed border-l-2 border-rose-100 pl-4">
            {letter.message}
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-16 rounded-lg bg-[#fbf3e4] border-2 border-[#d9c9a3] shadow-sm flex items-center justify-center rotate-3">
            <Lock className="w-6 h-6 text-[#c9986c]" />
          </div>
          <p className="mt-4 font-heading text-[#a67451]">Carta sellada</p>
          <p className="text-xs text-stone-400 font-body mt-1">Se abre el {letter.open_date}</p>
        </div>
      )}
    </div>
  );
}