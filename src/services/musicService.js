import { createEntity, deleteEntity, listEntity, updateEntity, withUserFilter } from './entityService';

export async function listSongs(filters = {}) {
  return listEntity('songs', withUserFilter(filters));
}

export async function createSong(values) {
  return createEntity('songs', { ...values, user_id: values.user_id ?? withUserFilter().user_id });
}

export async function updateSong(id, values) {
  return updateEntity('songs', id, values);
}

export async function deleteSong(id) {
  return deleteEntity('songs', id);
}

export default {
  listSongs,
  createSong,
  updateSong,
  deleteSong,
};
