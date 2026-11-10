import React from "react";
import AudioButton from "@/components/book/AudioButton";
import { Mail } from "lucide-react";

export default function FamilyMessagesBook({ messages }) {
  return (
    <div className="space-y-5">
      {messages.map((m) => (
        <div key={m.id} className="rounded-2xl bg-white/80 border border-rose-100 p-4 shadow-sm">
          <p className="font-heading text-sm text-rose-400 mb-2 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" /> De: {m.sender_name}
          </p>
          {m.message && (
            <p className="whitespace-pre-wrap font-body text-sm text-stone-600 leading-relaxed">
              {m.message}
            </p>
          )}
          {m.audioUrl && <AudioButton url={m.audioUrl} />}
        </div>
      ))}
    </div>
  );
}