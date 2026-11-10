/**
 * Cache corto para las listas completas de entidades.
 * Evita repetir las mismas consultas al navegar entre páginas (límite de 70 listas/min).
 * Cualquier escritura sobre una entidad borra su caché automáticamente.
 */
const TTL = 30_000;
const store = new Map();

export function invalidateEntity(name) {
  store.delete(name);
}

export function cachedList(name, fetcher) {
  const hit = store.get(name);
  if (hit && Date.now() - hit.at < TTL) return hit.promise.then((rows) => [...rows]);

  const promise = Promise.resolve()
    .then(fetcher)
    .then((rows) => (Array.isArray(rows) ? rows : []));

  store.set(name, { at: Date.now(), promise });
  promise.catch(() => store.delete(name));

  return promise.then((rows) => [...rows]);
}