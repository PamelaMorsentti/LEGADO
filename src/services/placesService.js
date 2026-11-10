import { createEntity, deleteEntity, listEntity, updateEntity, withUserFilter } from './entityService';

export async function listPlaces(filters = {}) {
  return listEntity('places', withUserFilter(filters));
}

export async function createPlace(values) {
  return createEntity('places', { ...values, user_id: values.user_id ?? withUserFilter().user_id });
}

export async function updatePlace(id, values) {
  return updateEntity('places', id, values);
}

export async function deletePlace(id) {
  return deleteEntity('places', id);
}

export default {
  listPlaces,
  createPlace,
  updatePlace,
  deletePlace,
};
