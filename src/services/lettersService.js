import { createEntity, deleteEntity, listEntity, updateEntity, withUserFilter } from './entityService';

export async function listFutureLetters(filters = {}) {
  return listEntity('future_letters', withUserFilter(filters));
}

export async function createFutureLetter(values) {
  return createEntity('future_letters', { ...values, user_id: values.user_id ?? withUserFilter().user_id });
}

export async function updateFutureLetter(id, values) {
  return updateEntity('future_letters', id, values);
}

export async function deleteFutureLetter(id) {
  return deleteEntity('future_letters', id);
}

export default {
  listFutureLetters,
  createFutureLetter,
  updateFutureLetter,
  deleteFutureLetter,
};
