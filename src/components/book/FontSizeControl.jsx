import React from "react";

export const FONT_SIZES = [
  { key: "normal", label: "A", className: "text-xs", title: "Letra normal" },
  { key: "grande", label: "A", className: "text-sm", title: "Letra grande" },
  { key: "enorme", label: "A", className: "text-base", title: "Letra muy grande" },
];

export default function FontSizeControl({ value, onChange }) {
  return (
    <div className="inline-flex items-center rounded-full border border-[#d9c9a3] bg-[#fbf3e4] p-0.5">
      {FONT_SIZES.map((size) => (
        <button
          key={size.key}
          onClick={() => onChange(size.key)}
          title={size.title}
          className={`w-8 h-7 rounded-full flex items-center justify-center font-heading transition-colors ${
            value === size.key
              ? "bg-[#a67451] text-white"
              : "text-[#a67451] hover:bg-[#f6ead2]"
          } ${size.className}`}
        >
          {size.label}
        </button>
      ))}
    </div>
  );
}