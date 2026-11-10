import { createEntity, deleteEntity, listEntity, updateEntity, withUserFilter } from './entityService';

export async function listSharedBooks(filters = {}) {
  return listEntity('shared_books', withUserFilter(filters));
}

export async function createSharedBook(values) {
  return createEntity('shared_books', { ...values, user_id: values.user_id ?? withUserFilter().user_id });
}

export async function updateSharedBook(id, values) {
  return updateEntity('shared_books', id, values);
}

export async function deleteSharedBook(id) {
  return deleteEntity('shared_books', id);
}

export default {
  listSharedBooks,
  createSharedBook,
  updateSharedBook,
  deleteSharedBook,
};
