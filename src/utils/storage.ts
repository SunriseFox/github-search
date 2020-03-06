import { searchResultDB } from './idb';

// TODO: https://github.com/pubkey/rxdb

interface StorageAdapter<T = string> {
  set(value: T): boolean;
  get(filter?: T | ((query: T) => boolean)): T[];
  delete(value?: T): boolean;
  clear(): boolean;
}

export class LocalStorageAdapter implements StorageAdapter<string> {
  constructor(private key: string) {
    try {
      const storage = localStorage.getItem(this.key);
      JSON.parse(storage);
    } catch {
      localStorage.setItem(this.key, JSON.stringify([]));
    }
    window.addEventListener('storage', this.onChangeHandler.bind(this));
  }
  private onChangeCallback = new Set<() => void>();
  private onChangeHandler() {
    for (const cb of this.onChangeCallback) cb();
  }
  private getStore() {
    return (JSON.parse(localStorage.getItem('search-history')) as string[]) || [];
  }
  private setStore(data: string[]) {
    localStorage.setItem('search-history', JSON.stringify(data));
    setTimeout(this.onChangeHandler.bind(this), 100);
    return true;
  }
  set(value: string) {
    const history = this.getStore();
    if (history.includes(value)) return true;
    history.push(value);
    this.setStore(history);
  }
  get(filter?: string) {
    const history = this.getStore();
    if (!filter) return history;
    return history.filter(record => record.startsWith(filter));
  }
  delete(value: string) {
    const history = this.getStore();
    const index = history.indexOf(value);
    if (index < 0) return false;
    history.splice(index, 1);
    debugger;
    this.setStore(history);
    searchResultDB.then(async db => {
      const store = db.transaction('search', 'readwrite').objectStore('search');
      const keys = (await store.getAllKeys()) as string[];
      keys
        .filter(key => key === value || key.endsWith(' ' + value))
        .forEach(key => store.delete(key));
    });
    return true;
  }
  clear() {
    this.setStore([]);
    searchResultDB.then(db =>
      db
        .transaction('search', 'readwrite')
        .objectStore('search')
        .clear()
    );
    return true;
  }
  subscribe(callback) {
    this.onChangeCallback.add(callback);
    return () => this.onChangeCallback.delete(callback);
  }
}

export const storage = new LocalStorageAdapter('search-history');
