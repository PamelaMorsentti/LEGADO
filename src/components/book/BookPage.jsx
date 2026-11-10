import React from "react";

export default function BookPage({ children, className = "" }) {
  return (
    <div
      className={`page-sheet h-full w-full rounded-2xl border border-rose-100 shadow-[0_10px_40px_rgba(0,0,0,0.08)] bg-[#fffdf8] overflow-y-auto ${className}`}
    >
      {children}
    </div>
  );
}