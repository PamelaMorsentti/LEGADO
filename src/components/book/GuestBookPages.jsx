import React from "react";
import { Sparkles, Heart } from "lucide-react";
import BookPage from "@/components/book/BookPage";
import FloralCover from "@/components/book/FloralCover";

const Title = ({ children }) => (
  <h2 className="font-heading text-2xl text-[#a67451] text-center mb-6 flex items-center justify-center gap-2">
    <Sparkles className="w-4 h-4" /> {children}
  </h2>
);

const Empty = () => (
  <p className="text-center text-sm text-stone-400 italic font-body">
    Todavía no hay recuerdos en esta sección.
  </p>
);

export default function buildGuestPages(book) {
  const pages = [];

  pages.push(
    <BookPage key="cover" className="overflow-hidden">
      <FloralCover large title={book.title} subtitle={book.author || undefined}>
        <Heart className="w-5 h-5 text-rose-300 mx-auto mt-6 fill-rose-200" />
      </FloralCover>
    </BookPage>
  );

  if (book.letter) {
    pages.push(
      <BookPage key="carta" className="p-8 sm:p-12 flex flex-col">
        <div className="whitespace-pre-wrap font-body text-stone-600 leading-relaxed flex-1">
          {book.letter}
        </div>
        {book.signature && (
          <p className="text-right text-rose-400 font-heading italic mt-6">{book.signature}</p>
        )}
      </BookPage>
    );
  }

  book.chapters.forEach((chapter, i) => {
    pages.push(
      <BookPage key={`chapter-${i}`} className="p-8 sm:p-10">
        <Title>{chapter.title}</Title>
        <div className="space-y-6">
          {chapter.entries.map((entry, j) => (
            <div key={j}>
              <h3 className="font-heading text-base text-[#a67451] mb-2 leading-snug">
                {entry.question}
              </h3>
              <p className="whitespace-pre-wrap font-body text-stone-600 leading-relaxed text-sm">
                {entry.answer}
              </p>
            </div>
          ))}
        </div>
      </BookPage>
    );
  });

  if (book.timeline.length) {
    pages.push(
      <BookPage key="vida" className="p-8 sm:p-10">
        <Title>Línea de vida</Title>
        <div className="space-y-4">
          {book.timeline.map((event, i) => (
            <div key={i} className="border-l-2 border-rose-200 pl-4">
              <p className="text-xs tracking-widest text-[#c9986c] uppercase">{event.year}</p>
              <p className="font-heading text-[#a67451]">{event.title}</p>
              {event.description && (
                <p className="text-sm text-stone-600 whitespace-pre-wrap mt-1">{event.description}</p>
              )}
            </div>
          ))}
        </div>
      </BookPage>
    );
  }

  if (book.recipes.length) {
    pages.push(
      <BookPage key="recetas" className="p-8 sm:p-10">
        <Title>Recetas y tradiciones</Title>
        <div className="space-y-5">
          {book.recipes.map((recipe, i) => (
            <div key={i} className="rounded-xl bg-[#fbf3e4] border border-[#d9c9a3] p-4">
              <p className="font-heading text-[#a67451]">{recipe.title}</p>
              {recipe.learned_from && (
                <p className="text-xs text-stone-400 italic">De {recipe.learned_from}</p>
              )}
              <p className="text-sm text-stone-600 whitespace-pre-wrap mt-2">{recipe.content}</p>
              {recipe.notes && (
                <p className="text-xs text-stone-500 italic mt-2">{recipe.notes}</p>
              )}
            </div>
          ))}
        </div>
      </BookPage>
    );
  }

  if (book.members.length) {
    pages.push(
      <BookPage key="familia" className="p-8 sm:p-10">
        <Title>La familia</Title>
        <div className="space-y-3">
          {book.members.map((member, i) => (
            <div key={i} className="rounded-xl border border-rose-100 bg-white/70 p-3">
              <p className="font-heading text-[#a67451]">
                {member.name} <span className="text-xs text-stone-400">· {member.relation}</span>
              </p>
              {member.note && <p className="text-sm text-stone-600 mt-1">{member.note}</p>}
            </div>
          ))}
        </div>
      </BookPage>
    );
  }

  if (book.places.length) {
    pages.push(
      <BookPage key="lugares" className="p-8 sm:p-10">
        <Title>Lugares de mi vida</Title>
        <div className="space-y-4">
          {book.places.map((place, i) => (
            <div key={i}>
              <p className="font-heading text-[#a67451]">{place.title}</p>
              <p className="text-xs text-stone-400">
                {[place.place_name, place.date_range].filter(Boolean).join(" · ")}
              </p>
              {place.story && (
                <p className="text-sm text-stone-600 whitespace-pre-wrap mt-1">{place.story}</p>
              )}
            </div>
          ))}
        </div>
      </BookPage>
    );
  }

  if (book.songs.length) {
    pages.push(
      <BookPage key="canciones" className="p-8 sm:p-10">
        <Title>Canciones de mi vida</Title>
        <div className="space-y-4">
          {book.songs.map((song, i) => (
            <div key={i}>
              <p className="font-heading text-[#a67451]">{song.title}</p>
              <p className="text-xs text-stone-400">
                {[song.artist, song.era].filter(Boolean).join(" · ")}
              </p>
              {song.story && (
                <p className="text-sm text-stone-600 whitespace-pre-wrap mt-1">{song.story}</p>
              )}
            </div>
          ))}
        </div>
      </BookPage>
    );
  }

  if (book.messages.length) {
    pages.push(
      <BookPage key="voces" className="p-8 sm:p-10">
        <Title>Voces de la familia</Title>
        <div className="space-y-4">
          {book.messages.map((msg, i) => (
            <div key={i} className="rounded-xl bg-rose-50 border border-rose-100 p-4">
              <p className="text-xs tracking-widest text-rose-400 uppercase mb-1">
                {msg.sender_name}
              </p>
              {msg.message ? (
                <p className="text-sm text-stone-600 whitespace-pre-wrap">{msg.message}</p>
              ) : (
                <p className="text-sm text-stone-400 italic">Mensaje de voz</p>
              )}
            </div>
          ))}
        </div>
      </BookPage>
    );
  }

  pages.push(
    <BookPage key="cierre" className="p-8 sm:p-12 flex flex-col items-center justify-center text-center">
      <Sparkles className="w-5 h-5 text-[#c9986c] mb-4" />
      <h2 className="font-heading text-2xl text-[#a67451] mb-4">
        {book.closing_title || "Con todo mi amor"}
      </h2>
      <p className="whitespace-pre-wrap font-body text-stone-600 leading-relaxed max-w-md">
        {book.closing_text || "Gracias por guardar esta historia en tu corazón."}
      </p>
      {book.author && <p className="mt-8 text-rose-400 font-heading italic">{book.author}</p>}
    </BookPage>
  );

  return pages.length > 1 ? pages : [...pages, <BookPage key="vacio" className="p-10"><Empty /></BookPage>];
}