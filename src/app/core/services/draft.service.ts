import { Injectable } from '@angular/core';

const DB_NAME    = 'oaxacamiel_db';
const DB_VERSION = 1;
const STORE_NAME = 'drafts';

@Injectable({ providedIn: 'root' })
export class DraftService {
  private db: IDBDatabase | null = null;

  private async openDb(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        }
      };
      request.onsuccess = () => { this.db = request.result; resolve(this.db!); };
      request.onerror   = () => reject(request.error);
    });
  }

  async saveDraft<T>(key: string, data: T): Promise<void> {
    const db    = await this.openDb();
    const tx    = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({ key, data, savedAt: new Date().toISOString() });
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror    = () => reject(tx.error);
    });
  }

  async getDraft<T>(key: string): Promise<T | null> {
    const db      = await this.openDb();
    const tx      = db.transaction(STORE_NAME, 'readonly');
    const store   = tx.objectStore(STORE_NAME);
    const request = store.get(key);
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result?.data ?? null);
      request.onerror   = () => reject(request.error);
    });
  }

  async deleteDraft(key: string): Promise<void> {
    const db    = await this.openDb();
    const tx    = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(key);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror    = () => reject(tx.error);
    });
  }
}
