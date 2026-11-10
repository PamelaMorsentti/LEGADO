import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { appClient } from "@/api/appClient";
import { SECTIONS } from "@/lib/bookSections";
import SurpriseQuestion from "@/components/book/SurpriseQuestion";
import OwnChapters from "@/components/book/OwnChapters";
import BackupButton from "@/components/book/BackupButton";
import { Heart, Sparkles, User, BookHeart, Camera, Mail, Clock, ChefHat, Users, MapPin, Music, MessagesSquare } from "lucide-react";

export default function Home() {
  const [progress, setProgress] = useState({});
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    appClient.entities.Answer.list().then((all) => {
      const counts = {};
      all.forEach((a) => {
        if (a.answer_text && a.answer_text.trim().length > 0) {
          counts[a.section_key] = (counts[a.section_key] || 0) + 1;
        }
      });
      setProgress(counts);
    });
    appClient.entities.ProfileInfo.list().then((res) => setProfile(res?.[0] || null));
  }, []);

  const totalQuestions = SECTIONS.reduce((sum, s) => sum + s.questions.length, 0);
  const answeredTotal = SECTIONS.reduce((sum, s) => sum + (progress[s.key] || 0), 0);

  return (
    <div className="min-h-screen bg-[#fff9f6]">
      {/* Hero */}
      <div
        className="relative overflow-hidden"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(236,160,185,0.25) 0px, rgba(236,160,185,0.25) 2px, transparent 2px, transparent 28px), repeating-linear-gradient(90deg, rgba(236,160,185,0.25) 0px, rgba(236,160,185,0.25) 2px, transparent 2px, transparent 28px)",
          backgroundColor: "#fde9ef",
        }}
      >
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-20 sm:py-28">
          <div className="bg-white/90 backdrop-blur-sm rounded-[3rem] px-8 py-14 sm:px-20 sm:py-20 shadow-sm max-w-xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-[#c9986c] mb-4">
              <Sparkles className="w-4 h-4" />
              <Sparkles className="w-5 h-5" />
            </div>
            <p className="font-heading text-sm tracking-[0.3em] text-[#c9986c] uppercase mb-3">
              Bienvenida
            </p>
            <h1 className="font-heading text-3xl sm:text-5xl text-[#a67451] leading-tight">
              Esta es tu historia
            </h1>
            <Heart className="w-5 h-5 text-rose-300 mx-auto mt-6 fill-rose-200" />
          </div>
        </div>
      </div>

      {/* Letter */}
      <div className="max-w-2xl mx-auto px-6 -mt-10 relative z-10">
        <div className="rounded-[2rem] bg-white border border-rose-100 shadow-[0_8px_30px_rgba(0,0,0,0.05)] p-8 sm:p-12 text-center">
          <h2 className="font-heading text-2xl text-[#a67451] mb-6 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" /> Querida Mamá <Sparkles className="w-4 h-4" />
          </h2>
          {profile?.letter_text ? (
            <div className="text-stone-600 leading-relaxed text-left whitespace-pre-wrap font-body">
              {profile.letter_text}
            </div>
          ) : (
            <div className="text-stone-600 leading-relaxed space-y-4 text-left sm:text-center font-body">
              <p>
                La vida es una historia llena de momentos mágicos, lecciones, tristezas, desafíos
                y por sobre todo amor incondicional.
              </p>
              <p>
                Hoy quiero regalarte este libro, que fue diseñado especialmente para ti, porque
                deseo que en cada hoja dejes toda tu sabiduría, recuerdos y anécdotas, para que
                las futuras generaciones de nuestra familia conozcan el ser de luz que eres.
              </p>
              <p>
                Ahora comienza este emotivo viaje al pasado para que dejes plasmados tus recuerdos
                entrañables que atesoraremos con mucho amor en nuestras vidas, porque sin duda
                dejaste una huella gigante que jamás será olvidada.
              </p>
              <p>
                Gracias mamá por compartir tu vida con nosotros y enseñarme que siempre se puede
                entregar más amor del que se recibe.
              </p>
              <p className="italic">Te amo por siempre.</p>
            </div>
          )}
          {profile?.letter_signature ? (
            <p className="mt-6 text-sm text-rose-400 font-heading italic">{profile.letter_signature}</p>
          ) : (
            <p className="mt-6 text-sm text-rose-400 font-heading">Tu hija</p>
          )}
          <Link
            to="/carta"
            className="mt-6 inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-500 transition-colors"
          >
            <Mail className="w-3.5 h-3.5" /> Editar esta carta
          </Link>
        </div>
      </div>

      {/* Esta soy yo */}
      <div className="max-w-2xl mx-auto px-6 mt-10">
        <Link
          to="/esta-soy-yo"
          className="flex items-center gap-4 rounded-[2rem] bg-white border border-rose-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-rose-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-heading text-lg text-[#a67451]">Esta Soy Yo</h3>
            <p className="text-sm text-stone-400">Tu foto, nombre y datos personales</p>
          </div>
          {profile?.full_name && <span className="text-xs text-rose-400">Completado</span>}
        </Link>

        <Link
          to="/fotos"
          className="mt-3 flex items-center gap-4 rounded-[2rem] bg-[#fbf3e4] border border-[#d9c9a3] shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0">
            <Camera className="w-5 h-5 text-[#a67451]" />
          </div>
          <div className="flex-1">
            <h3 className="font-heading text-lg text-[#a67451]">Álbum Familiar</h3>
            <p className="text-sm text-stone-400">Sube fotografías y agrega notas para el álbum del libro</p>
          </div>
        </Link>

        <Link
          to="/cronologia"
          className="mt-3 flex items-center gap-4 rounded-[2rem] bg-white border border-rose-100 shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-rose-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-heading text-lg text-[#a67451]">Línea de Vida</h3>
            <p className="text-sm text-stone-400">Los momentos clave de tu historia, año por año</p>
          </div>
        </Link>

        <Link
          to="/recetas"
          className="mt-3 flex items-center gap-4 rounded-[2rem] bg-[#fbf3e4] border border-[#d9c9a3] shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0">
            <ChefHat className="w-5 h-5 text-[#a67451]" />
          </div>
          <div className="flex-1">
            <h3 className="font-heading text-lg text-[#a67451]">Recetas y Tradiciones</h3>
            <p className="text-sm text-stone-400">Recetas, remedios y costumbres de la familia</p>
          </div>
        </Link>

        <Link
          to="/arbol"
          className="mt-3 flex items-center gap-4 rounded-[2rem] bg-white border border-rose-100 shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-rose-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-heading text-lg text-[#a67451]">Árbol Genealógico</h3>
            <p className="text-sm text-stone-400">Tu familia, con nombres, fotos y generaciones</p>
          </div>
        </Link>

        <Link
          to="/lugares"
          className="mt-3 flex items-center gap-4 rounded-[2rem] bg-[#fbf3e4] border border-[#d9c9a3] shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-[#a67451]" />
          </div>
          <div className="flex-1">
            <h3 className="font-heading text-lg text-[#a67451]">Lugares de mi vida</h3>
            <p className="text-sm text-stone-400">El mapa de los sitios que cuentan tu historia</p>
          </div>
        </Link>

        <Link
          to="/cartas-futuras"
          className="mt-3 flex items-center gap-4 rounded-[2rem] bg-white border border-rose-100 shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
            <Mail className="w-5 h-5 text-rose-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-heading text-lg text-[#a67451]">Cartas para el futuro</h3>
            <p className="text-sm text-stone-400">Mensajes sellados que se abren en su día</p>
          </div>
        </Link>

        <Link
          to="/canciones"
          className="mt-3 flex items-center gap-4 rounded-[2rem] bg-[#fbf3e4] border border-[#d9c9a3] shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0">
            <Music className="w-5 h-5 text-[#a67451]" />
          </div>
          <div className="flex-1">
            <h3 className="font-heading text-lg text-[#a67451]">Canciones de mi vida</h3>
            <p className="text-sm text-stone-400">Las canciones que marcaron cada época</p>
          </div>
        </Link>

        <Link
          to="/familia"
          className="mt-3 flex items-center gap-4 rounded-[2rem] bg-white border border-rose-100 shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
            <MessagesSquare className="w-5 h-5 text-rose-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-heading text-lg text-[#a67451]">Voces de la familia</h3>
            <p className="text-sm text-stone-400">Cartas y audios que deja tu familia</p>
          </div>
        </Link>

        <Link
          to="/lectura"
          className="mt-3 flex items-center gap-4 rounded-[2rem] bg-rose-50 border border-rose-200 shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0">
            <BookHeart className="w-5 h-5 text-rose-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-heading text-lg text-[#a67451]">Modo lectura</h3>
            <p className="text-sm text-stone-400">Mira tu libro completo, tal como lo recibirán tus hijos</p>
          </div>
        </Link>
      </div>

      {/* Table of contents */}
      <div className="max-w-2xl mx-auto px-6 mt-10 pb-24">
        <SurpriseQuestion />
        <div className="rounded-2xl bg-white border border-rose-100 shadow-sm p-5 mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="font-heading text-sm text-[#a67451]">Tu progreso</span>
            <span className="text-xs text-stone-400 font-body">
              {answeredTotal} de {totalQuestions} preguntas respondidas
            </span>
          </div>
          <div className="h-2 rounded-full bg-rose-100 overflow-hidden">
            <div
              className="h-full bg-rose-300 rounded-full transition-all"
              style={{ width: `${totalQuestions ? (answeredTotal / totalQuestions) * 100 : 0}%` }}
            />
          </div>
        </div>
        <h2 className="font-heading text-xl text-[#a67451] mb-5 flex items-center gap-2">
          <BookHeart className="w-5 h-5" /> Secciones de tu historia
        </h2>
        <div className="space-y-3">
          {SECTIONS.map((section) => {
            const done = progress[section.key] || 0;
            const total = section.questions.length;
            return (
              <Link
                key={section.key}
                to={`/seccion/${section.key}`}
                className="flex items-center justify-between rounded-2xl bg-white border border-rose-100 shadow-sm px-5 py-4 hover:shadow-md transition-shadow"
              >
                <span className="font-heading text-[#a67451]">{section.title}</span>
                <span className="text-xs text-stone-400">
                  {done}/{total}
                </span>
              </Link>
            );
          })}
        </div>
        <OwnChapters progress={progress} />
        <BackupButton />
      </div>
    </div>
  );
}