import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { appClient } from "@/api/appClient";
import { SECTIONS } from "@/lib/bookSections";
import { Sparkles, Heart, Home as HomeIcon, BookHeart, Paintbrush, Check, Camera, Clock, ChefHat, Users, MapPin, Music, Mail } from "lucide-react";
import { Image } from "@/components/ui/image";
import FlipBook from "@/components/book/FlipBook";
import BookPage from "@/components/book/BookPage";
import DecorPage from "@/components/book/DecorPage";
import AlbumPage from "@/components/book/AlbumPage";
import FloralCover from "@/components/book/FloralCover";
import AudioButton from "@/components/book/AudioButton";
import ExportPdfButton from "@/components/book/ExportPdfButton";
import DecorPresets from "@/components/book/DecorPresets";
import TimelineView from "@/components/book/TimelineView";
import RecipeCard from "@/components/book/RecipeCard";
import TreeView from "@/components/book/TreeView";
import { resolveImageSrc, measureAspect } from "@/lib/media";
import { STICKER_MIME } from "@/lib/stickerDrop";
import { getFontClass } from "@/lib/fonts";
import PlacesBook from "@/components/book/PlacesBook";
import LetterBookPage from "@/components/book/LetterBookPage";
import SongsBook from "@/components/book/SongsBook";
import FamilyMessagesBook from "@/components/book/FamilyMessagesBook";
import { ownIndex, ownSectionKey } from "@/lib/ownContent";
import BookSearch from "@/components/book/BookSearch";
import FontSizeControl from "@/components/book/FontSizeControl";
import CoverClosingEditor from "@/components/book/CoverClosingEditor";
import ShareGuestLink from "@/components/book/ShareGuestLink";

const chunk = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

export default function Lectura() {
  const [profile, setProfile] = useState(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [answers, setAnswers] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [stickers, setStickers] = useState([]);
  const [covers, setCovers] = useState({});
  const [audioUrls, setAudioUrls] = useState({});
  const [events, setEvents] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [members, setMembers] = useState([]);
  const [decorating, setDecorating] = useState(false);
  const [places, setPlaces] = useState([]);
  const [letters, setLetters] = useState([]);
  const [songs, setSongs] = useState([]);
  const [messages, setMessages] = useState([]);
  const [handSigUrl, setHandSigUrl] = useState("");
  const [ownQuestions, setOwnQuestions] = useState([]);
  const [ownChapters, setOwnChapters] = useState([]);
  const [coverUrl, setCoverUrl] = useState("");
  const [fontSize, setFontSize] = useState(
    () => localStorage.getItem("lectura-letra") || "normal"
  );

  useEffect(() => {
    appClient.entities.ProfileInfo.list().then(async (res) => {
      if (res && res[0]) {
        setProfile(res[0]);
        if (res[0].photo_url) {
          const { signed_url } = await appClient.integrations.Core.CreateFileSignedUrl({
            file_uri: res[0].photo_url,
            expires_in: 3600,
          });
          setPhotoUrl(signed_url);
        }
        if (res[0].hand_signature) {
          const u = await resolveImageSrc(res[0].hand_signature);
          setHandSigUrl(u);
        }
        if (res[0].cover_uri) setCoverUrl(await resolveImageSrc(res[0].cover_uri));
      }
    });
    appClient.entities.Answer.list().then(async (all) => {
      const map = {};
      all.forEach((a) => (map[`${a.section_key}_${a.question_index}`] = a));
      setAnswers(map);
      const urls = {};
      await Promise.all(
        all
          .filter((a) => a.audio_uri)
          .map(async (a) => {
            const url = await resolveImageSrc(a.audio_uri);
            if (url) urls[a.id] = url;
          })
      );
      setAudioUrls(urls);
    });
    appClient.entities.ChapterCover.list().then(async (list) => {
      const m = {};
      await Promise.all(
        list.map(async (c) => {
          if (c.section_key) m[c.section_key] = await resolveImageSrc(c.photo_uri);
        })
      );
      setCovers(m);
    });
    appClient.entities.Photo.list().then(async (list) => {
      const withUrls = await Promise.all(
        list.map(async (p) => {
          const url = await resolveImageSrc(p.photo_uri);
          const aspect = await measureAspect(url);
          const audioUrl = p.audio_uri ? await resolveImageSrc(p.audio_uri) : "";
          return { ...p, url, aspect, audioUrl };
        })
      );
      setPhotos(withUrls);
    });
    appClient.entities.Sticker.list().then(async (list) => {
      const withUrls = await Promise.all(
        list.map(async (s) => ({ ...s, url: await resolveImageSrc(s.sticker_uri) }))
      );
      setStickers(withUrls.filter((s) => s.url));
    });
    appClient.entities.TimelineEvent.list().then(async (list) => {
      const sorted = [...list].sort((a, b) =>
        (a.year || "").localeCompare(b.year || "", undefined, { numeric: true })
      );
      const withUrls = await Promise.all(
        sorted.map(async (e) => ({
          ...e,
          photoUrl: e.photo_uri ? await resolveImageSrc(e.photo_uri) : "",
        }))
      );
      setEvents(withUrls);
    });
    appClient.entities.Recipe.list().then((list) => setRecipes(list));
    appClient.entities.FamilyMember.list().then(async (list) => {
      const withUrls = await Promise.all(
        list.map(async (m) => ({
          ...m,
          photoUrl: m.photo_uri ? await resolveImageSrc(m.photo_uri) : "",
        }))
      );
      setMembers(withUrls);
    });
    appClient.entities.Place.list().then(async (list) => {
      const withUrls = await Promise.all(
        list.map(async (p) => ({
          ...p,
          url: p.photo_uri ? await resolveImageSrc(p.photo_uri) : "",
        }))
      );
      setPlaces(withUrls);
    });
    appClient.entities.FutureLetter.list().then(setLetters);
    appClient.entities.Song.list().then(setSongs);
    appClient.entities.FamilyMessage.list().then(async (list) => {
      const withUrls = await Promise.all(
        list.map(async (m) => ({
          ...m,
          audioUrl: m.audio_uri ? await resolveImageSrc(m.audio_uri) : "",
        }))
      );
      setMessages(withUrls);
    });
    appClient.entities.OwnQuestion.list().then(setOwnQuestions);
    appClient.entities.OwnChapter.list().then(setOwnChapters);
  }, []);

  const handleDrop = (stickerId, pageKey, x, y) => {
    const rot = Math.round(Math.random() * 16 - 8);
    appClient.entities.Sticker.update(stickerId, { page: pageKey, x, y, rot });
    setStickers((prev) =>
      prev.map((s) => (s.id === stickerId ? { ...s, page: pageKey, x, y, rot } : s))
    );
  };

  const handleUnplace = (stickerId) => {
    appClient.entities.Sticker.update(stickerId, { page: null, x: null, y: null, rot: null });
    setStickers((prev) =>
      prev.map((s) => (s.id === stickerId ? { ...s, page: null, x: null, y: null, rot: null } : s))
    );
  };

  if (!answers) {
    return (
      <div className="min-h-screen bg-[#f7ede8] flex items-center justify-center">
        <p className="text-stone-400">Cargando el libro...</p>
      </div>
    );
  }

  const stickersOn = (key) => stickers.filter((s) => s.page === key);
  const decorProps = (key) => ({
    stickerKey: key,
    placedStickers: stickersOn(key),
    editing: decorating,
    onDrop: handleDrop,
    onUnplace: handleUnplace,
  });

  const fontClass = getFontClass(profile?.font_family);

  const perfilIncluded = !!(
    profile &&
    (profile.full_name || profile.birth_info || profile.profession || photoUrl)
  );

  // Preguntas y capítulos propios agrupados por capítulo
  const ownByKey = {};
  ownQuestions.forEach((q) => {
    (ownByKey[q.section_key] = ownByKey[q.section_key] || []).push(q);
  });

  const allSections = [
    ...SECTIONS.map((s) => ({
      key: s.key,
      title: s.title,
      entries: [
        ...s.questions.map((q, idx) => ({ question: q, idx })),
        ...(ownByKey[s.key] || []).map((q) => ({
          question: q.question_text,
          idx: ownIndex(q.order),
        })),
      ],
    })),
    ...ownChapters.map((c) => ({
      key: ownSectionKey(c.id),
      title: c.title,
      entries: (ownByKey[ownSectionKey(c.id)] || []).map((q) => ({
        question: q.question_text,
        idx: ownIndex(q.order),
      })),
    })),
  ];

  // Capítulos con contenido (texto o audio)
  const sectionsWithData = allSections
    .map((section) => ({
      section,
      items: section.entries
        .map(({ question, idx }) => ({ question, idx, answer: answers[`${section.key}_${idx}`] }))
        .filter(
          (item) =>
            (item.answer?.answer_text && item.answer.answer_text.trim().length > 0) ||
            item.answer?.audio_uri
        ),
    }))
    .filter((s) => s.items.length > 0);

  // Posiciones de cada portada de capítulo (para el índice interactivo)
  const letterCount = profile?.letter_text ? 1 : 2;
  const perfilCount = perfilIncluded ? 1 : 0;
  const base = 2 + letterCount + perfilCount; // portada + índice
  const startPositions = {};
  let acc = 0;
  sectionsWithData.forEach(({ section, items }) => {
    startPositions[section.key] = base + acc;
    acc += 1 + items.length;
  });

  // Búsqueda dentro del libro: cada recuerdo con su número de hoja
  const searchEntries = sectionsWithData.flatMap(({ section, items }) =>
    items.map((item, i) => ({
      label: section.title,
      question: item.question,
      text: item.answer?.answer_text || "",
      page: startPositions[section.key] + 1 + i,
    }))
  );

  const changeFontSize = (size) => {
    setFontSize(size);
    localStorage.setItem("lectura-letra", size);
  };

  // Hojas nuevas: línea de vida, recetas y árbol
  const placeChunks = chunk(places, 3);
  const songChunks = chunk(songs, 3);
  const msgChunks = chunk(messages, 3);
  const timelineChunks = chunk(events, 4);
  const recipeChunks = chunk(recipes, 2);
  let cursor = base + sectionsWithData.reduce((a, s) => a + 1 + s.items.length, 0);
  const positions = {};
  if (timelineChunks.length) {
    positions.timeline = cursor;
    cursor += timelineChunks.length;
  }
  if (recipeChunks.length) {
    positions.recipes = cursor;
    cursor += recipeChunks.length;
  }
  if (members.length) {
    positions.tree = cursor;
    cursor += 1;
  }
  if (placeChunks.length) {
    positions.places = cursor;
    cursor += placeChunks.length;
  }
  if (letters.length) {
    positions.letters = cursor;
    cursor += letters.length;
  }
  if (songChunks.length) {
    positions.songs = cursor;
    cursor += songChunks.length;
  }
  if (msgChunks.length) {
    positions.messages = cursor;
    cursor += msgChunks.length;
  }
  if (photos.length) {
    positions.album = cursor;
    cursor += 1 + Math.ceil(photos.length / 2);
  }

  const indexRows = [
    ...sectionsWithData.map(({ section, items }) => ({
      label: section.title,
      count: `${items.length} ${items.length === 1 ? "respuesta" : "respuestas"}`,
      target: startPositions[section.key],
    })),
    ...(timelineChunks.length
      ? [{ label: "Línea de vida", count: `${events.length} ${events.length === 1 ? "hito" : "hitos"}`, target: positions.timeline }]
      : []),
    ...(recipeChunks.length
      ? [{ label: "Recetas y tradiciones", count: `${recipes.length} ${recipes.length === 1 ? "tarjeta" : "tarjetas"}`, target: positions.recipes }]
      : []),
    ...(members.length
      ? [{ label: "Árbol familiar", count: `${members.length} ${members.length === 1 ? "persona" : "personas"}`, target: positions.tree }]
      : []),
    ...(placeChunks.length
      ? [{ label: "Lugares de mi vida", count: `${places.length} ${places.length === 1 ? "lugar" : "lugares"}`, target: positions.places }]
      : []),
    ...(letters.length
      ? [{ label: "Cartas para el futuro", count: `${letters.length} ${letters.length === 1 ? "carta" : "cartas"}`, target: positions.letters }]
      : []),
    ...(songChunks.length
      ? [{ label: "Canciones de mi vida", count: `${songs.length} ${songs.length === 1 ? "canción" : "canciones"}`, target: positions.songs }]
      : []),
    ...(msgChunks.length
      ? [{ label: "Voces de la familia", count: `${messages.length} ${messages.length === 1 ? "mensaje" : "mensajes"}`, target: positions.messages }]
      : []),
    ...(photos.length
      ? [{ label: "Álbum familiar", count: `${photos.length} ${photos.length === 1 ? "foto" : "fotos"}`, target: positions.album }]
      : []),
  ];

  const pages = [];

  // Portada
  pages.push(
    <DecorPage key="cover" className="overflow-hidden" {...decorProps("cover")}>
      <FloralCover
        large
        title={profile?.cover_title || "Mamá, cuéntame tu historia"}
        backgroundUrl={coverUrl}
      >
        <Heart className="w-5 h-5 text-rose-300 mx-auto mt-6 fill-rose-200" />
        {profile?.full_name && (
          <p className="mt-4 text-stone-500 font-heading italic">{profile.full_name}</p>
        )}
      </FloralCover>
    </DecorPage>
  );

  // Índice interactivo
  pages.push(
    <DecorPage key="indice" className="p-8 sm:p-10 flex flex-col" {...decorProps("indice")}>
      <h2 className="font-heading text-2xl text-[#a67451] text-center mb-6">Índice</h2>
      <div className="space-y-3 flex-1">
        {indexRows.map((row) => (
          <button
            key={row.label}
            onClick={() =>
              window.dispatchEvent(new CustomEvent("flipbook:goto", { detail: row.target }))
            }
            className="w-full flex items-center justify-between rounded-xl border border-rose-100 bg-white/70 px-4 py-3 text-left hover:bg-rose-50 transition-colors"
          >
            <span className="font-heading text-[#a67451]">{row.label}</span>
            <span className="text-xs text-stone-400 font-body">{row.count}</span>
          </button>
        ))}
        {indexRows.length === 0 && (
          <p className="text-sm text-stone-400 text-center font-body italic mt-4">
            Aún no hay capítulos escritos.
          </p>
        )}
      </div>
    </DecorPage>
  );

  // Carta de dedicación
  if (profile?.letter_text) {
    pages.push(
      <DecorPage key="carta-custom" className="p-8 sm:p-12 flex flex-col" {...decorProps("carta")}>
        <div className="whitespace-pre-wrap font-body text-stone-600 leading-relaxed flex-1">
          {profile.letter_text}
        </div>
        {profile.letter_signature && (
          <p className="text-right text-rose-400 font-heading italic mt-6">
            {profile.letter_signature}
          </p>
        )}
        {handSigUrl && (
          <div className="self-end w-44 h-16 mt-1">
            <Image src={handSigUrl} alt="Firma" className="w-full h-full" fittingType="fit" />
          </div>
        )}
        <div className="flex justify-end mt-4">
          <ChevronHint />
        </div>
      </DecorPage>
    );
  } else {
    pages.push(
      <DecorPage key="carta1" className="p-8 sm:p-12" {...decorProps("carta1")}>
        <h2 className="font-heading text-2xl text-[#a67451] mb-6 flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> Querida Mamá
        </h2>
        <div className="text-stone-600 leading-relaxed space-y-4 font-body">
          <p>
            La vida es una historia llena de momentos mágicos, lecciones, tristezas, desafíos
            y por sobre todo amor incondicional.
          </p>
          <p>
            Hoy quiero regalarte este libro, que fue diseñado especialmente para ti, porque
            deseo que en cada hoja dejes toda tu sabiduría, recuerdos y anécdotas, para que
            las futuras generaciones de nuestra familia conozcan el ser de luz que eres.
          </p>
        </div>
        <div className="flex justify-end mt-8">
          <ChevronHint />
        </div>
      </DecorPage>
    );
    pages.push(
      <DecorPage key="carta2" className="p-8 sm:p-12" {...decorProps("carta2")}>
        <div className="text-stone-600 leading-relaxed space-y-4 font-body">
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
          <p className="text-rose-400 font-heading">Tu hija</p>
          {handSigUrl && (
            <div className="w-44 h-16">
              <Image src={handSigUrl} alt="Firma" className="w-full h-full" fittingType="fit" />
            </div>
          )}
        </div>
        <div className="flex justify-end mt-8">
          <ChevronHint />
        </div>
      </DecorPage>
    );
  }

  // Esta Soy Yo
  if (perfilIncluded) {
    pages.push(
      <DecorPage
        key="perfil"
        className="p-8 sm:p-12 flex flex-col items-center justify-center text-center"
        {...decorProps("perfil")}
      >
        {photoUrl && (
          <div className="w-40 h-52 rounded-2xl overflow-hidden border-4 border-rose-100 shadow-sm mb-8 bg-rose-50 flex-shrink-0">
            <Image src={photoUrl} alt="Foto" className="w-full h-full" fittingType="fill" />
          </div>
        )}
        {profile.full_name && (
          <h3 className="font-heading text-2xl text-[#a67451]">{profile.full_name}</h3>
        )}
        {profile.birth_info && (
          <p className="mt-2 text-stone-500 font-body">{profile.birth_info}</p>
        )}
        {profile.profession && (
          <p className="mt-1 text-stone-400 font-body italic">{profile.profession}</p>
        )}
      </DecorPage>
    );
  }

  // Capítulos
  sectionsWithData.forEach(({ section, items }) => {
    pages.push(
      <DecorPage key={`${section.key}-cover`} className="overflow-hidden" {...decorProps(`portada:${section.key}`)}>
        <FloralCover title={section.title} backgroundUrl={covers[section.key]} />
      </DecorPage>
    );

    items.forEach((item) => {
      pages.push(
        <DecorPage
          key={item.answer.id}
          className="p-8 sm:p-10 flex flex-col"
          {...decorProps(`q:${section.key}:${item.idx}`)}
        >
          <div className="flex items-start gap-2 mb-5">
            <Heart className="w-3.5 h-3.5 text-rose-200 fill-rose-100 mt-1.5 flex-shrink-0" />
            <h3 className="font-heading text-lg sm:text-xl text-[#a67451] leading-snug">
              {item.question}
            </h3>
          </div>
          {item.answer.answer_text && item.answer.answer_text.trim().length > 0 && (
            <p className={`book-answer whitespace-pre-wrap ${fontClass} text-stone-700 leading-relaxed border-l-2 border-rose-100 pl-4 flex-1`}>
              {item.answer.answer_text}
            </p>
          )}
          {audioUrls[item.answer.id] && <AudioButton url={audioUrls[item.answer.id]} />}
          {item.answer.audio_transcript && (
            <p className="mt-3 text-sm text-stone-400 font-body italic border-l-2 border-rose-100 pl-4">
              "{item.answer.audio_transcript}"
            </p>
          )}
          <div className="flex justify-end mt-4">
            <ChevronHint />
          </div>
        </DecorPage>
      );
    });
  });

  // Línea de vida
  timelineChunks.forEach((chunkEvents, ci) => {
    pages.push(
      <DecorPage key={`timeline-${ci}`} className="p-8 sm:p-10" {...decorProps(`timeline:${ci}`)}>
        {ci === 0 && (
          <div className="text-center mb-6">
            <h2 className="font-heading text-2xl text-[#a67451] flex items-center justify-center gap-2">
              <Clock className="w-5 h-5 text-rose-300" /> Línea de vida
            </h2>
            <p className="text-xs text-stone-400 mt-1 font-body">Los hitos de una vida entera</p>
          </div>
        )}
        <TimelineView events={chunkEvents} />
      </DecorPage>
    );
  });

  // Recetas y tradiciones
  recipeChunks.forEach((chunkRecipes, ci) => {
    pages.push(
      <DecorPage key={`recetas-${ci}`} className="p-8 sm:p-10" {...decorProps(`recetas:${ci}`)}>
        {ci === 0 && (
          <div className="text-center mb-6">
            <h2 className="font-heading text-2xl text-[#a67451] flex items-center justify-center gap-2">
              <ChefHat className="w-5 h-5 text-rose-300" /> Recetas y tradiciones
            </h2>
            <p className="text-xs text-stone-400 mt-1 font-body">Los sabores de nuestra familia</p>
          </div>
        )}
        <div className="grid grid-cols-1 gap-6">
          {chunkRecipes.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>
      </DecorPage>
    );
  });

  // Árbol familiar
  if (members.length) {
    pages.push(
      <DecorPage key="arbol" className="p-8 sm:p-10" {...decorProps("arbol")}>
        <div className="text-center mb-6">
          <h2 className="font-heading text-2xl text-[#a67451] flex items-center justify-center gap-2">
            <Users className="w-5 h-5 text-rose-300" /> Árbol familiar
          </h2>
          <p className="text-xs text-stone-400 mt-1 font-body">Nuestra familia, generación por generación</p>
        </div>
        <TreeView members={members} />
      </DecorPage>
    );
  }

  // Lugares de mi vida
  placeChunks.forEach((chunkPlaces, ci) => {
    pages.push(
      <DecorPage key={`lugares-${ci}`} className="p-8 sm:p-10" {...decorProps(`lugares:${ci}`)}>
        {ci === 0 && (
          <div className="text-center mb-6">
            <h2 className="font-heading text-2xl text-[#a67451] flex items-center justify-center gap-2">
              <MapPin className="w-5 h-5 text-rose-300" /> Lugares de mi vida
            </h2>
            <p className="text-xs text-stone-400 mt-1 font-body">Los sitios que cuentan mi historia</p>
          </div>
        )}
        <PlacesBook places={chunkPlaces} />
      </DecorPage>
    );
  });

  // Cartas para el futuro
  letters.forEach((letter) => {
    pages.push(
      <DecorPage
        key={`carta-f-${letter.id}`}
        className="p-8 sm:p-10"
        {...decorProps(`cartafuturo:${letter.id}`)}
      >
        <LetterBookPage letter={letter} />
      </DecorPage>
    );
  });

  // Canciones de mi vida
  songChunks.forEach((chunkSongs, ci) => {
    pages.push(
      <DecorPage key={`canciones-${ci}`} className="p-8 sm:p-10" {...decorProps(`canciones:${ci}`)}>
        {ci === 0 && (
          <div className="text-center mb-6">
            <h2 className="font-heading text-2xl text-[#a67451] flex items-center justify-center gap-2">
              <Music className="w-5 h-5 text-rose-300" /> Canciones de mi vida
            </h2>
            <p className="text-xs text-stone-400 mt-1 font-body">La banda sonora de una historia</p>
          </div>
        )}
        <SongsBook songs={chunkSongs} />
      </DecorPage>
    );
  });

  // Voces de la familia
  msgChunks.forEach((chunkMsgs, ci) => {
    pages.push(
      <DecorPage key={`voces-${ci}`} className="p-8 sm:p-10" {...decorProps(`voces:${ci}`)}>
        {ci === 0 && (
          <div className="text-center mb-6">
            <h2 className="font-heading text-2xl text-[#a67451] flex items-center justify-center gap-2">
              <Mail className="w-5 h-5 text-rose-300" /> Voces de la familia
            </h2>
            <p className="text-xs text-stone-400 mt-1 font-body">Cartas y audios de quienes más te quieren</p>
          </div>
        )}
        <FamilyMessagesBook messages={chunkMsgs} />
      </DecorPage>
    );
  });

  // Álbum de fotos familiares
  if (photos.length > 0) {
    pages.push(
      <DecorPage key="album-cover" className="overflow-hidden" {...decorProps("portada-album")}>
        <FloralCover title="Álbum Familiar" subtitle="Recuerdos en fotografías" />
      </DecorPage>
    );
    let albumPageIdx = 0;
    for (let i = 0; i < photos.length; i += 2) {
      const idx = albumPageIdx++;
      pages.push(
        <BookPage key={`album-${photos[i].id}`} className="album-sheet p-6 sm:p-8">
          <AlbumPage
            photos={photos.slice(i, i + 2)}
            pageIndex={idx}
            stickerKey={`album:${idx}`}
            placedStickers={stickersOn(`album:${idx}`)}
            editing={decorating}
            onDrop={handleDrop}
            onUnplace={handleUnplace}
          />
        </BookPage>
      );
    }
  }

  // Cierre
  pages.push(
    <DecorPage
      key="cierre"
      className="p-8 sm:p-12 flex flex-col items-center justify-center text-center"
      {...decorProps("cierre")}
    >
      <BookHeart className="w-6 h-6 text-rose-300 mb-4" />
      <p className="font-heading text-xl text-[#a67451] italic">
        {profile?.closing_title || "Fin de nuestra historia... por ahora."}
      </p>
      <p className="text-stone-400 text-sm mt-2 font-body whitespace-pre-line">
        {profile?.closing_text || "Escrito con amor, para nuestros hijos."}
      </p>
    </DecorPage>
  );

  const unplaced = stickers.filter((s) => !s.page);

  return (
    <div className={`min-h-screen bg-[#f7ede8] py-8 pb-16 book-letra-${fontSize}`}>
      <div className="max-w-2xl mx-auto px-4 mb-6 flex items-center justify-between gap-2">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-rose-400 transition-colors"
        >
          <HomeIcon className="w-3.5 h-3.5" /> Volver al inicio
        </Link>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <BookSearch
            entries={searchEntries}
            onGo={(page) =>
              window.dispatchEvent(new CustomEvent("flipbook:goto", { detail: page }))
            }
          />
          <FontSizeControl value={fontSize} onChange={changeFontSize} />
          {profile && <CoverClosingEditor profile={profile} onSaved={setProfile} />}
          <button
            onClick={() => setDecorating((d) => !d)}
            className="inline-flex items-center gap-1.5 text-sm rounded-full border border-[#d9c9a3] bg-[#fbf3e4] px-3 py-1.5 text-[#a67451] hover:bg-[#f6ead2] transition-colors"
          >
            {decorating ? <Check className="w-3.5 h-3.5" /> : <Paintbrush className="w-3.5 h-3.5" />}
            {decorating ? "Terminar de decorar" : "Decorar libro"}
          </button>
          <ShareGuestLink />
          <ExportPdfButton pages={pages} />
        </div>
      </div>
      <FlipBook pages={pages} />
      {decorating && (
        <div className="max-w-2xl mx-auto px-4 mt-6">
          <div className="rounded-[2rem] bg-white border border-[#d9c9a3] shadow-sm p-5 text-center">
            <p className="text-sm text-stone-500 font-body mb-4 flex items-center justify-center gap-2 flex-wrap">
              <Camera className="w-4 h-4 text-[#a67451]" />
              Arrastra un sticker o elemento sobre cualquier hoja del libro para pegarlo; vuelve a
              arrastrarlo para moverlo, o pulsa la X para quitarlo
            </p>
            <DecorPresets onAdded={(s) => setStickers((prev) => [...prev, s])} />
            {unplaced.length === 0 ? (
              <p className="text-xs text-stone-400 font-body italic mt-4">
                Todos los stickers están pegados en las hojas
              </p>
            ) : (
              <div className="flex flex-wrap gap-3 justify-center mt-4">
                {unplaced.map((s) => (
                  <div
                    key={s.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData(STICKER_MIME, s.id)}
                    className="w-16 h-16 rounded-xl bg-white border border-[#d9c9a3] shadow-sm p-1 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                  >
                    <Image src={s.url} alt="Sticker" className="w-full h-full" fittingType="fit" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ChevronHint() {
  return <Sparkles className="w-3 h-3 text-rose-200" />;
}