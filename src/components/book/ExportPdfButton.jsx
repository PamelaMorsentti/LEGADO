import React, { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { FileDown, Loader2 } from "lucide-react";

const PAGE_W = 794; // A4 at 96 dpi
const PAGE_H = 1123;

export default function ExportPdfButton({ pages, fileName = "mi-historia.pdf" }) {
  const stageRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");

  const handleExport = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const stage = stageRef.current;
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const W = pdf.internal.pageSize.getWidth();
      const H = pdf.internal.pageSize.getHeight();
      for (let i = 0; i < pages.length; i++) {
        setProgress(`página ${i + 1} de ${pages.length}`);
        stage.innerHTML = "";
        const holder = document.createElement("div");
        holder.style.width = `${PAGE_W}px`;
        holder.style.height = `${PAGE_H}px`;
        holder.style.position = "relative";
        holder.style.overflow = "hidden";
        stage.appendChild(holder);
        const root = createRoot(holder);
        root.render(pages[i]);
        await new Promise((r) => setTimeout(r, 450));
        const canvas = await html2canvas(holder, {
          useCORS: true,
          scale: 1.5,
          backgroundColor: "#fffdf8",
          logging: false,
        });
        if (i > 0) pdf.addPage();
        pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, W, H);
        root.unmount();
      }
      stage.innerHTML = "";
      pdf.save(fileName);
    } finally {
      setBusy(false);
      setProgress("");
    }
  };

  return (
    <>
      <button
        onClick={handleExport}
        disabled={busy}
        className="inline-flex items-center gap-1.5 text-sm rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-[#a67451] hover:bg-rose-100 transition-colors disabled:opacity-60"
      >
        {busy ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Generando {progress}...
          </>
        ) : (
          <>
            <FileDown className="w-3.5 h-3.5" />
            Descargar PDF
          </>
        )}
      </button>
      <div
        ref={stageRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          left: -20000,
          top: 0,
          width: PAGE_W,
          height: PAGE_H,
          overflow: "hidden",
          zIndex: -1,
        }}
      />
    </>
  );
}