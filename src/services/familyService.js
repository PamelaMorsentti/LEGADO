import { createEntity, deleteEntity, listEntity, updateEntity, withUserFilter } from './entityService';

export async function listFamilyMembers(filters = {}) {
  return listEntity('family_members', withUserFilter(filters));
}

export async function createFamilyMember(values) {
  return createEntity('family_members', { ...values, user_id: values.user_id ?? withUserFilter().user_id });
}

export async function updateFamilyMember(id, values) {
  return updateEntity('family_members', id, values);
}

export async function deleteFamilyMember(id) {
  return deleteEntity('family_members', id);
}

export default {
  listFamilyMembers,
  createFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
};
