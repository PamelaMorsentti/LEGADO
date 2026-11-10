import React, { useState } from "react";
import { Loader2, Type } from "lucide-react";
import { appClient } from "@/api/appClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FONT_OPTIONS } from "@/lib/fonts";

export default function FontPicker({ profile, onFontSaved }) {
  const [saving, setSaving] = useState(false);
  const current = profile?.font_family || "libro";

  const handleChange = async (value) => {
    setSaving(true);
    if (profile) {
      await appClient.entities.ProfileInfo.update(profile.id, { font_family: value });
      onFontSaved?.({ ...profile, font_family: value });
    } else {
      const created = await appClient.entities.ProfileInfo.create({ font_family: value });
      onFontSaved?.(created);
    }
    setSaving(false);
  };

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-white px-4 py-2 shadow-sm">
      <Type className="w-4 h-4 text-[#a67451] flex-shrink-0" />
      <Select value={current} onValueChange={handleChange} disabled={saving}>
        <SelectTrigger className="w-44 border-0 shadow-none p-0 h-auto text-sm text-[#a67451] focus:ring-0 focus:ring-offset-0 font-body">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FONT_OPTIONS.map((f) => (
            <SelectItem key={f.value} value={f.value} className="font-body">
              <span className={f.className}>{f.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {saving && <Loader2 className="w-3.5 h-3.5 animate-spin text-stone-400" />}
    </div>
  );
}