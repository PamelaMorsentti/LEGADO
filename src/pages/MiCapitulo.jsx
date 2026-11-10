import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { appClient } from "@/api/appClient";
import ChapterCover from "@/components/book/ChapterCover";
import OwnQuestions from "@/components/book/OwnQuestions";
import FontPicker from "@/components/book/FontPicker";
import { getFontClass } from "@/lib/fonts";
import { ownSectionKey } from "@/lib/ownContent";
import { Home } from "lucide-react";

export default function MiCapitulo() {
  const { chapterId } = useParams();
  const sectionKey = ownSectionKey(chapterId);

  const [chapter, setChapter] = useState(null);
  const [answers, setAnswers] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    appClient.entities.OwnChapter.list().then((list) => {
      setChapter((list || []).find((c) => c.id === chapterId) || null);
    });
    appClient.entities.ProfileInfo.list().then((res) => setProfile(res?.[0] || null));
  }, [chapterId]);

  useEffect(() => {
    let active = true;
    setAnswers(null);
    appClient.entities.Answer.filter({ section_key: sectionKey }).then((res) => {
      if (!active) return;
      const map = {};
      res.forEach((a) => {
        map[a.question_index] = a;
      });
      setAnswers(map);
    });
    return () => {
      active = false;
    };
  }, [sectionKey]);

  const handleAnswerCreated = (idx, created) => {
    setAnswers((prev) => ({ ...prev, [idx]: { ...(prev?.[idx] || {}), ...created } }));
  };

  if (answers && !chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff9f6]">
        <p className="text-stone-500">Este capítulo ya no existe.</p>
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
          <Home className="w-3.5 h-3.5" /> Volver al inicio
        </Link>

        <ChapterCover title={chapter?.title || "Mi capítulo"} subtitle="Un capítulo escrito por ti" />

        <div className="flex justify-end items-center gap-3 mb-6 -mt-4 relative z-10 flex-wrap">
          <FontPicker profile={profile} onFontSaved={setProfile} />
        </div>

        {answers === null || !chapter ? (
          <div className="text-center text-stone-400 py-10">Cargando...</div>
        ) : (
          <OwnQuestions
            sectionKey={sectionKey}
            answers={answers}
            fontClass={getFontClass(profile?.font_family)}
            onAnswerCreated={handleAnswerCreated}
          />
        )}
      </div>
    </div>
  );
}