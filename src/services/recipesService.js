import { createEntity, deleteEntity, listEntity, updateEntity, withUserFilter } from './entityService';

export async function listRecipes(filters = {}) {
  return listEntity('recipes', withUserFilter(filters));
}

export async function createRecipe(values) {
  return createEntity('recipes', { ...values, user_id: values.user_id ?? withUserFilter().user_id });
}

export async function updateRecipe(id, values) {
  return updateEntity('recipes', id, values);
}

export async function deleteRecipe(id) {
  return deleteEntity('recipes', id);
}

export default {
  listRecipes,
  createRecipe,
  updateRecipe,
  deleteRecipe,
};
