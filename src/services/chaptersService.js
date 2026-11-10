import { createEntity, deleteEntity, listEntity, updateEntity, withUserFilter } from './entityService';

export async function listOwnChapters(filters = {}) {
  return listEntity('own_chapters', withUserFilter(filters));
}

export async function createOwnChapter(values) {
  return createEntity('own_chapters', { ...values, user_id: values.user_id ?? withUserFilter().user_id });
}

export async function updateOwnChapter(id, values) {
  return updateEntity('own_chapters', id, values);
}

export async function deleteOwnChapter(id) {
  return deleteEntity('own_chapters', id);
}

export async function listChapterCovers(filters = {}) {
  return listEntity('chapter_covers', withUserFilter(filters));
}

export default {
  listOwnChapters,
  createOwnChapter,
  updateOwnChapter,
  deleteOwnChapter,
  listChapterCovers,
};
