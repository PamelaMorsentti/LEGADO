import React from "react";
import { Sparkles } from "lucide-react";
import { Image } from "@/components/ui/image";
import { FLORAL_URL } from "@/components/book/FloralCover";

export default function ChapterCover({ title, subtitle, backgroundUrl = "" }) {
  return (
    <div className="relative overflow-hidden rounded-[2.5rem] mb-10">
      <Image src={backgroundUrl || FLORAL_URL} alt="" className="absolute inset-0 w-full h-full" fittingType="fill" />
      <div className="relative z-10 flex flex-col items-center justify-center text-center py-16 sm:py-24 px-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-[3rem] px-8 py-12 sm:px-16 sm:py-16 shadow-sm max-w-xl mx-auto">
          <div className="flex items-center justify-center gap-2 text-[#c9986c] mb-3">
            <Sparkles className="w-4 h-4" />
            <Sparkles className="w-5 h-5" />
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl text-[#a67451] leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-3 text-stone-500 font-body">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}