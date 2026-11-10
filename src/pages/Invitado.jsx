import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { loadGuestBook } from "@/lib/guestBook";
import buildGuestPages from "@/components/book/GuestBookPages";
import FlipBook from "@/components/book/FlipBook";
import { Heart } from "lucide-react";

export default function Invitado() {
  const { token } = useParams();
  const [book, setBook] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | missing

  useEffect(() => {
    let active = true;
    loadGuestBook(token)
      .then((data) => {
        if (!active) return;
        if (!data) {
          setStatus("missing");
          return;
        }
        setBook(data);
        setStatus("ready");
      })
      .catch(() => active && setStatus("missing"));
    return () => {
      active = false;
    };
  }, [token]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#fff9f6] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-rose-100 border-t-rose-300 rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "missing") {
    return (
      <div className="min-h-screen bg-[#fff9f6] flex items-center justify-center px-6">
        <div className="max-w-sm text-center rounded-[2rem] bg-white border border-rose-100 p-8">
          <Heart className="w-5 h-5 text-rose-300 mx-auto mb-4" />
          <h1 className="font-heading text-xl text-[#a67451] mb-2">Este enlace no está disponible</h1>
          <p className="text-sm text-stone-500">
            Pide a la familia que te comparta un enlace nuevo para leer el libro.
          </p>
        </div>
      </div>
    );
  }

  const pages = buildGuestPages(book);

  return (
    <div className="min-h-screen bg-[#fff9f6] py-10 px-4">
      <div className="max-w-2xl mx-auto text-center mb-6">
        <p className="font-heading text-xs tracking-[0.3em] text-[#c9986c] uppercase">
          Edición para la familia
        </p>
        <h1 className="font-heading text-2xl text-[#a67451] mt-2">{book.title}</h1>
        <p className="text-xs text-stone-400 mt-1">Solo lectura</p>
      </div>
      <FlipBook pages={pages} />
    </div>
  );
}