import { createEntity, deleteEntity, listEntity, updateEntity, withUserFilter } from './entityService';

export async function listPhotos(filters = {}) {
  return listEntity('photos', withUserFilter(filters));
}

export async function createPhoto(values) {
  return createEntity('photos', { ...values, user_id: values.user_id ?? withUserFilter().user_id });
}

export async function updatePhoto(id, values) {
  return updateEntity('photos', id, values);
}

export async function deletePhoto(id) {
  return deleteEntity('photos', id);
}

export default {
  listPhotos,
  createPhoto,
  updatePhoto,
  deletePhoto,
};
