import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { appClient } from "@/api/appClient";
import { getSectionByKey, getSectionIndex, SECTIONS } from "@/lib/bookSections";
import ChapterCover from "@/components/book/ChapterCover";
import QuestionCard from "@/components/book/QuestionCard";
import OwnQuestions from "@/components/book/OwnQuestions";
import FontPicker from "@/components/book/FontPicker";
import CoverCustomizer from "@/components/book/CoverCustomizer";
import { getFontClass } from "@/lib/fonts";
import { ArrowLeft, ArrowRight, Home } from "lucide-react";

export default function Seccion() {
  const { sectionKey } = useParams();
  const section = getSectionByKey(sectionKey);
  const sectionIdx = getSectionIndex(sectionKey);
  const prevSection = SECTIONS[sectionIdx - 1];
  const nextSection = SECTIONS[sectionIdx + 1];

  const [answers, setAnswers] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    appClient.entities.ProfileInfo.list().then((res) => setProfile(res && res[0] ? res[0] : null));
  }, []);

  useEffect(() => {
    let active = true;
    setAnswers(null);
    appClient.entities.Answer.filter({ section_key: sectionKey }).then((res) => {
      if (!active) return;
      const map = {};
      res.forEach((a) => (map[a.question_index] = a));
      setAnswers(map);
    });
    return () => (active = false);
  }, [sectionKey]);

  const [coverUrl, setCoverUrl] = useState(null);

  const handleAnswerCreated = (idx, created) => {
    setAnswers((prev) => ({ ...prev, [idx]: { ...(prev?.[idx] || {}), ...created } }));
  };

  if (!section) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff9f6]">
        <p className="text-stone-500">Sección no encontrada.</p>
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

        <ChapterCover title={section.title} subtitle={`Capítulo ${sectionIdx + 1} de ${SECTIONS.length}`} backgroundUrl={coverUrl} />

        <div className="flex justify-end items-center gap-3 mb-6 -mt-4 relative z-10 flex-wrap">
          <CoverCustomizer sectionKey={sectionKey} onCoverSaved={setCoverUrl} />
          <FontPicker profile={profile} onFontSaved={setProfile} />
        </div>

        {answers === null ? (
          <div className="text-center text-stone-400 py-10">Cargando...</div>
        ) : (
          <>
            <div className="space-y-6">
              {section.questions.map((q, idx) => (
                <QuestionCard
                  key={idx}
                  index={idx}
                  questionText={q}
                  answer={answers[idx] || { section_key: sectionKey }}
                  fontClass={getFontClass(profile?.font_family)}
                  onSaved={(created) => handleAnswerCreated(idx, created)}
                />
              ))}
            </div>
            <OwnQuestions
              sectionKey={sectionKey}
              answers={answers}
              fontClass={getFontClass(profile?.font_family)}
              onAnswerCreated={handleAnswerCreated}
            />
          </>
        )}

        <div className="flex items-center justify-between mt-12 gap-4">
          {prevSection ? (
            <Link
              to={`/seccion/${prevSection.key}`}
              className="flex items-center gap-1.5 text-sm text-[#a67451] hover:text-rose-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> {prevSection.title}
            </Link>
          ) : (
            <span />
          )}
          {nextSection ? (
            <Link
              to={`/seccion/${nextSection.key}`}
              className="flex items-center gap-1.5 text-sm text-[#a67451] hover:text-rose-400 transition-colors ml-auto"
            >
              {nextSection.title} <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <span />
          )}
        </div>
      </div>
    </div>
  );
}