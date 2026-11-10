// Preguntas y capítulos escritos por la autora.
// Se guardan con un índice propio (a partir de 1000) para no chocar con
// las preguntas originales del libro.
export const OWN_INDEX_BASE = 1000;

export const ownSectionKey = (chapterId) => `custom:${chapterId}`;

export const ownIndex = (order) => OWN_INDEX_BASE + (order || 0);

export const sortByOrder = (list) =>
  [...list].sort((a, b) => (a.order || 0) - (b.order || 0));