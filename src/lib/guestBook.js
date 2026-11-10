import { appClient } from "@/api/appClient";
import { SECTIONS } from "@/lib/bookSections";
import { ownSectionKey } from "@/lib/ownContent";

const hasText = (a) => typeof a.answer_text === "string" && a.answer_text.trim().length > 0;

const byIndex = (a, b) => (a.question_index || 0) - (b.question_index || 0);

// Copia de solo lectura del libro. No incluye fotos, audios ni cartas selladas.
export async function buildSnapshot() {
  const [profiles, answers, timeline, recipes, members, places, songs, messages, ownChapters] =
    await Promise.all([
      appClient.entities.ProfileInfo.list(),
      appClient.entities.Answer.list(),
      appClient.entities.TimelineEvent.list(),
      appClient.entities.Recipe.list(),
      appClient.entities.FamilyMember.list(),
      appClient.entities.Place.list(),
      appClient.entities.Song.list(),
      appClient.entities.FamilyMessage.list(),
      appClient.entities.OwnChapter.list(),
    ]);

  const profile = profiles[0] || {};
  const answered = answers.filter(hasText).sort(byIndex);

  const originalChapters = SECTIONS.map((section) => ({
    title: section.title,
    entries: answered
      .filter((a) => a.section_key === section.key)
      .map((a) => ({
        question: a.question_text || section.questions[a.question_index] || "",
        answer: a.answer_text,
      })),
  }));

  const customChapters = ownChapters.map((chapter) => ({
    title: chapter.title,
    entries: answered
      .filter((a) => a.section_key === ownSectionKey(chapter.id))
      .map((a) => ({ question: a.question_text || "", answer: a.answer_text })),
  }));

  return {
    generated: new Date().toISOString(),
    title: profile.cover_title || "Mamá, cuéntame tu historia",
    author: profile.full_name || "",
    letter: profile.letter_text || "",
    signature: profile.letter_signature || "",
    closing_title: profile.closing_title || "",
    closing_text: profile.closing_text || "",
    chapters: [...originalChapters, ...customChapters].filter((c) => c.entries.length > 0),
    timeline: timeline.map((e) => ({
      year: e.year,
      title: e.title,
      description: e.description || "",
    })),
    recipes: recipes.map((r) => ({
      title: r.title,
      kind: r.kind,
      learned_from: r.learned_from || "",
      content: r.content,
      notes: r.notes || "",
    })),
    members: members.map((m) => ({ name: m.name, relation: m.relation, note: m.note || "" })),
    places: places.map((p) => ({
      title: p.title,
      place_name: p.place_name || "",
      date_range: p.date_range || "",
      story: p.story || "",
    })),
    songs: songs.map((s) => ({
      title: s.title,
      artist: s.artist || "",
      era: s.era || "",
      story: s.story || "",
    })),
    messages: messages.map((m) => ({
      sender_name: m.sender_name,
      message: m.message || "",
      kind: m.kind,
    })),
  };
}

export async function createGuestLink() {
  const snapshot = await buildSnapshot();
  const file = new File([JSON.stringify(snapshot, null, 2)], "libro-familia.json", {
    type: "application/json",
  });
  const { file_url } = await appClient.integrations.Core.UploadPublicFile({ file });

  const existing = await appClient.entities.SharedBook.list();
  const current = existing[0];
  const token = current?.token || crypto.randomUUID().replace(/-/g, "").slice(0, 16);

  const record = current
    ? await appClient.entities.SharedBook.update(current.id, { data_url: file_url })
    : await appClient.entities.SharedBook.create({ token, data_url: file_url });

  return `${window.location.origin}/invitado/${record.token}`;
}

export async function loadGuestBook(token) {
  if (!token) return null;
  const list = await appClient.entities.SharedBook.filter({ token });
  const record = list.find((r) => r.token === token);
  if (!record) return null;

  const res = await fetch(record.data_url);
  if (!res.ok) return null;
  return res.json();
}