import { createEntity, deleteEntity, listEntity, updateEntity, withUserFilter } from './entityService';

export async function listOwnQuestions(filters = {}) {
  return listEntity('own_questions', withUserFilter(filters));
}

export async function createOwnQuestion(values) {
  return createEntity('own_questions', { ...values, user_id: values.user_id ?? withUserFilter().user_id });
}

export async function updateOwnQuestion(id, values) {
  return updateEntity('own_questions', id, values);
}

export async function deleteOwnQuestion(id) {
  return deleteEntity('own_questions', id);
}

export default {
  listOwnQuestions,
  createOwnQuestion,
  updateOwnQuestion,
  deleteOwnQuestion,
};
