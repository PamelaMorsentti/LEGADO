import React, { useRef, useState } from "react";
import { appClient } from "@/api/appClient";
import { Eraser, Loader2, Check, PenLine } from "lucide-react";

export default function SignaturePad({ onSave }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const pointFrom = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return [
      ((e.clientX - rect.left) / rect.width) * canvas.width,
      ((e.clientY - rect.top) / rect.height) * canvas.height,
    ];
  };

  const startDraw = (e) => {
    e.preventDefault();
    canvasRef.current.setPointerCapture?.(e.pointerId);
    drawingRef.current = true;
    const ctx = canvasRef.current.getContext("2d");
    const [x, y] = pointFrom(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 0.1, y + 0.1);
    ctx.stroke();
    setDirty(true);
  };

  const draw = (e) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    const [x, y] = pointFrom(e);
    ctx.strokeStyle = "#a67451";
    ctx.lineWidth = 3.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDraw = () => {
    drawingRef.current = false;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    setDirty(false);
  };

  const save = async () => {
    setSaving(true);
    const blob = await new Promise((res) => canvasRef.current.toBlob(res, "image/png"));
    const file = new File([blob], "firma.png", { type: "image/png" });
    const { file_uri } = await appClient.integrations.Core.UploadPrivateFile({ file });
    await onSave(file_uri);
    setSaving(false);
  };

  return (
    <div>
      <div className="rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/40 p-2">
        <canvas
          ref={canvasRef}
          width={640}
          height={200}
          onPointerDown={startDraw}
          onPointerMove={draw}
          onPointerUp={endDraw}
          onPointerLeave={endDraw}
          className="w-full touch-none cursor-crosshair"
        />
        <p className="text-center text-xs text-stone-400 font-body pb-1 flex items-center justify-center gap-1.5">
          <PenLine className="w-3 h-3" /> Dibuja tu firma aquí con el dedo o el mouse
        </p>
      </div>
      <div className="flex items-center justify-end gap-2 mt-3">
        <button
          onClick={clear}
          className="inline-flex items-center gap-1.5 text-xs rounded-full border border-stone-200 px-3 py-1.5 text-stone-400 hover:text-rose-400 hover:border-rose-200 transition-colors font-body"
        >
          <Eraser className="w-3.5 h-3.5" /> Borrar
        </button>
        <button
          onClick={save}
          disabled={!dirty || saving}
          className="inline-flex items-center gap-1.5 text-xs rounded-full bg-rose-400 px-4 py-1.5 text-white hover:bg-rose-500 transition-colors disabled:opacity-40 font-body"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          Guardar firma
        </button>
      </div>
    </div>
  );
}