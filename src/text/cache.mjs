export function createCachedLoader(load) {
  let cache = null;
  return async function loadCachedValue() {
    if (cache) return cache;
    cache = await load();
    return cache;
  };
}
