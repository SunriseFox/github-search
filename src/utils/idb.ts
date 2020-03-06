import { openDB, IDBPDatabase, OpenDBCallbacks } from 'idb';

const openedDB: Map<string, IDBPDatabase> = new Map();

const createDatabase = async (key, version, opener: OpenDBCallbacks<unknown>) => {
  if (openedDB.has(key)) return openedDB.get(key);
  return openDB(key, version, opener);
};

export const searchResultDB = createDatabase('github-search', 1, {
  upgrade(db) {
    db.createObjectStore('search', { keyPath: 'searchText' });
  },
});
