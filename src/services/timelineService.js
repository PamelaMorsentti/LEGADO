import { createEntity, deleteEntity, listEntity, updateEntity, withUserFilter } from './entityService';

export async function listTimelineEvents(filters = {}) {
  return listEntity('timeline_events', withUserFilter(filters));
}

export async function createTimelineEvent(values) {
  return createEntity('timeline_events', { ...values, user_id: values.user_id ?? withUserFilter().user_id });
}

export async function updateTimelineEvent(id, values) {
  return updateEntity('timeline_events', id, values);
}

export async function deleteTimelineEvent(id) {
  return deleteEntity('timeline_events', id);
}

export default {
  listTimelineEvents,
  createTimelineEvent,
  updateTimelineEvent,
  deleteTimelineEvent,
};
