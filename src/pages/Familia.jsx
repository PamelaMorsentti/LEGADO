import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { appClient } from "@/api/appClient";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ChapterCover from "@/components/book/ChapterCover";
import AudioButton from "@/components/book/AudioButton";
import FamilyVoiceNote from "@/components/book/FamilyVoiceNote";
import { resolveImageSrc } from "@/lib/media";
import {
  Home as HomeIcon,
  Loader2,
  Trash2,
  Mail,
  Users,
  UserPlus,
} from "lucide-react";

export default function Familia() {
  const [messages, setMessages] = useState(null);
  const [myName, setMyName] = useState("");
  const [form, setForm] = useState({ sender_name: "", message: "", audio_uri: "" });
  const [kind, setKind] = useState("carta");
  const [saving, setSaving] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteState, setInviteState] = useState(""); // idle | busy | done | error

  useEffect(() => {
    load();
    appClient.auth.me().then((me) => {
      setMyName(me?.full_name || "");
      setForm((f) => ({ ...f, sender_name: f.sender_name || me?.full_name || "" }));
    });
  }, []);

  const load = async () => {
    const list = await appClient.entities.FamilyMessage.list();
    const withUrls = await Promise.all(
      list.map(async (m) => ({
        ...m,
        audioUrl: m.audio_uri ? await resolveImageSrc(m.audio_uri) : "",
      }))
    );
    setMessages(withUrls);
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || inviteState === "busy") return;
    setInviteState("busy");
    try {
      await appClient.users.inviteUser(inviteEmail.trim(), "user");
      setInviteState("done");
      setInviteEmail("");
    } catch {
      setInviteState("error");
    }
  };

  const submit = async () => {
    if (!form.sender_name.trim() || saving) return;
    if (kind === "carta" && !form.message.trim()) return;
    if (kind === "audio" && !form.audio_uri) return;
    setSaving(true);
    await appClient.entities.FamilyMessage.create({
      sender_name: form.sender_name.trim(),
      kind,
      message: kind === "carta" ? form.message : "",
      audio_uri: kind === "audio" ? form.audio_uri : null,
    });
    setForm((f) => ({ ...f, message: "", audio_uri: "" }));
    await load();
    setSaving(false);
  };

  const handleDelete = async (m) => {
    await appClient.entities.FamilyMessage.delete(m.id);
    await load();
  };

  if (!messages) {
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
          title="Voces de la familia"
          subtitle="Cartas y audios de quienes más te quieren"
        />

        {/* Invitar */}
        <div className="rounded-[2rem] bg-white border border-rose-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6 mb-8">
          <h2 className="font-heading text-lg text-[#a67451] mb-2 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-rose-300" /> Invitar a la familia
          </h2>
          <p className="text-sm text-stone-400 font-body mb-4">
            Envía una invitación para que hijos o nietos entren y dejen su mensaje aquí.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="border-rose-200 focus-visible:border-rose-400 flex-1"
            />
            <button
              onClick={handleInvite}
              disabled={!inviteEmail.trim() || inviteState === "busy"}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-400 px-5 py-2 text-sm text-white hover:bg-rose-500 transition-colors disabled:opacity-40 font-body flex-shrink-0"
            >
              {inviteState === "busy" && <Loader2 className="w-4 h-4 animate-spin" />}
              Invitar
            </button>
          </div>
          {inviteState === "done" && (
            <p className="text-xs text-rose-400 font-body mt-3">Invitación enviada con amor.</p>
          )}
          {inviteState === "error" && (
            <p className="text-xs text-rose-400 font-body mt-3">
              No se pudo enviar la invitación; revisa el correo e inténtalo otra vez.
            </p>
          )}
        </div>

        {/* Formulario de mensaje */}
        <div className="rounded-[2rem] bg-white border border-rose-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6 sm:p-8 mb-10">
          <h2 className="font-heading text-xl text-[#a67451] mb-5 flex items-center gap-2">
            <Mail className="w-4 h-4 text-rose-300" /> Dejar mi mensaje
          </h2>
          <div className="space-y-4">
            <div className="sm:max-w-xs">
              <Label className="font-heading text-[#a67451]">Tu nombre</Label>
              <Input
                value={form.sender_name}
                onChange={(e) => setForm({ ...form, sender_name: e.target.value })}
                placeholder="Ej: Cristian"
                className="mt-1.5 border-rose-200 focus-visible:border-rose-400"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setKind("carta")}
                className={`rounded-full px-4 py-1.5 text-sm font-body transition-colors ${
                  kind === "carta"
                    ? "bg-rose-400 text-white"
                    : "border border-rose-200 text-rose-400 hover:bg-rose-50"
                }`}
              >
                Carta escrita
              </button>
              <button
                onClick={() => setKind("audio")}
                className={`rounded-full px-4 py-1.5 text-sm font-body transition-colors ${
                  kind === "audio"
                    ? "bg-rose-400 text-white"
                    : "border border-rose-200 text-rose-400 hover:bg-rose-50"
                }`}
              >
                Audio
              </button>
            </div>
            {kind === "carta" ? (
              <Textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Escribe tu carta para la mamá..."
                className="min-h-[140px] border-rose-200 rounded-xl focus-visible:ring-0 focus-visible:border-rose-400 bg-transparent resize-none font-body text-stone-700 p-3"
              />
            ) : (
              <FamilyVoiceNote
                audioUri={form.audio_uri}
                onChange={(uri) => setForm({ ...form, audio_uri: uri })}
              />
            )}
          </div>
          <div className="flex justify-end mt-5">
            <button
              onClick={submit}
              disabled={
                saving ||
                !form.sender_name.trim() ||
                (kind === "carta" ? !form.message.trim() : !form.audio_uri)
              }
              className="inline-flex items-center gap-2 rounded-full bg-rose-400 px-5 py-2 text-sm text-white hover:bg-rose-500 transition-colors disabled:opacity-40 font-body"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Dejar en el libro
            </button>
          </div>
        </div>

        {/* Mensajes */}
        <h2 className="font-heading text-xl text-[#a67451] mb-5 flex items-center gap-2">
          <Users className="w-5 h-5 text-rose-300" /> Mensajes de la familia
        </h2>
        {messages.length === 0 ? (
          <p className="text-center text-stone-400 font-body italic">
            Todavía no hay mensajes. Invita a la familia a dejar el primero.
          </p>
        ) : (
          <div className="space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className="rounded-[2rem] bg-white border border-rose-100 shadow-sm p-5"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-heading text-sm text-rose-400 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> {m.sender_name}
                    <span className="text-stone-300 font-body text-xs">
                      · {m.kind === "audio" ? "audio" : "carta"}
                    </span>
                  </p>
                  <button
                    onClick={() => handleDelete(m)}
                    aria-label={`Eliminar mensaje de ${m.sender_name}`}
                    className="text-stone-300 hover:text-rose-400 transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {m.message && (
                  <p className="whitespace-pre-wrap font-body text-sm text-stone-600 leading-relaxed mt-2">
                    {m.message}
                  </p>
                )}
                {m.audioUrl && <AudioButton url={m.audioUrl} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}