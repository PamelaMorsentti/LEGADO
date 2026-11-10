export const FONT_OPTIONS = [
  { value: "libro", label: "Libro clásico", className: "font-libro" },
  { value: "elegante", label: "Elegante", className: "font-elegante" },
  { value: "clasica", label: "Clásica suave", className: "font-clasica" },
  { value: "moderna", label: "Moderna", className: "font-moderna" },
  { value: "manuscrita", label: "Manuscrita", className: "font-manuscrita" },
  { value: "dinamica", label: "Caligrafía", className: "font-dinamica" },
];

export function getFontClass(value) {
  return (FONT_OPTIONS.find((f) => f.value === value) || FONT_OPTIONS[0]).className;
}