import React from "react";
import { Sparkles } from "lucide-react";
import { Image } from "@/components/ui/image";

export const FLORAL_URL =
  "https://media.appClient.com/images/public/6ac41f55c6bedfaa19ccdb12/12da32bf0_generated_image.png";

export default function FloralCover({ title, subtitle, large = false, children, backgroundUrl = "" }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center px-8 overflow-hidden">
      <Image src={backgroundUrl || FLORAL_URL} alt="" className="absolute inset-0 w-full h-full" fittingType="fill" />
      <div className="relative z-10 bg-white/90 backdrop-blur-sm rounded-[2rem] px-10 py-12 shadow-sm max-w-md text-center border border-rose-100">
        <div className="flex items-center justify-center gap-2 text-[#c9986c] mb-3">
          <Sparkles className="w-4 h-4" />
          <Sparkles className="w-5 h-5" />
        </div>
        {title && (
          <h2
            className={`font-heading text-[#a67451] leading-tight ${
              large ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"
            }`}
          >
            {title}
          </h2>
        )}
        {subtitle && <p className="mt-2 text-stone-400 font-body text-sm">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}