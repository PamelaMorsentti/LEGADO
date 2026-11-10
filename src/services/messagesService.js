import { createEntity, deleteEntity, listEntity, updateEntity, withUserFilter } from './entityService';

export async function listFamilyMessages(filters = {}) {
  return listEntity('family_messages', withUserFilter(filters));
}

export async function createFamilyMessage(values) {
  return createEntity('family_messages', { ...values, user_id: values.user_id ?? withUserFilter().user_id });
}

export async function updateFamilyMessage(id, values) {
  return updateEntity('family_messages', id, values);
}

export async function deleteFamilyMessage(id) {
  return deleteEntity('family_messages', id);
}

export default {
  listFamilyMessages,
  createFamilyMessage,
  updateFamilyMessage,
  deleteFamilyMessage,
};
