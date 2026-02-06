/**
 * Serviço de armazenamento de áudio usando IndexedDB
 * IndexedDB suporta armazenamento muito maior que localStorage (50MB+)
 */

const DB_NAME = 'MusicPlayerDB';
const DB_VERSION = 1;
const AUDIO_STORE = 'audioFiles';
const COVER_STORE = 'coverImages';

let db: IDBDatabase | null = null;

async function openDatabase(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      
      if (!database.objectStoreNames.contains(AUDIO_STORE)) {
        database.createObjectStore(AUDIO_STORE, { keyPath: 'id' });
      }
      
      if (!database.objectStoreNames.contains(COVER_STORE)) {
        database.createObjectStore(COVER_STORE, { keyPath: 'id' });
      }
    };
  });
}

/**
 * Salva um arquivo de áudio no IndexedDB
 */
export async function saveAudioFile(id: string, dataUrl: string): Promise<void> {
  const database = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([AUDIO_STORE], 'readwrite');
    const store = transaction.objectStore(AUDIO_STORE);
    const request = store.put({ id, dataUrl });

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Recupera um arquivo de áudio do IndexedDB
 */
export async function getAudioFile(id: string): Promise<string | null> {
  const database = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([AUDIO_STORE], 'readonly');
    const store = transaction.objectStore(AUDIO_STORE);
    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      resolve(request.result?.dataUrl || null);
    };
  });
}

/**
 * Remove um arquivo de áudio do IndexedDB
 */
export async function deleteAudioFile(id: string): Promise<void> {
  const database = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([AUDIO_STORE], 'readwrite');
    const store = transaction.objectStore(AUDIO_STORE);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Salva uma capa de álbum no IndexedDB
 */
export async function saveCoverImage(albumKey: string, dataUrl: string): Promise<void> {
  const database = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([COVER_STORE], 'readwrite');
    const store = transaction.objectStore(COVER_STORE);
    const request = store.put({ id: albumKey, dataUrl });

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Recupera uma capa de álbum do IndexedDB
 */
export async function getCoverImage(albumKey: string): Promise<string | null> {
  const database = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([COVER_STORE], 'readonly');
    const store = transaction.objectStore(COVER_STORE);
    const request = store.get(albumKey);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      resolve(request.result?.dataUrl || null);
    };
  });
}

/**
 * Remove uma capa de álbum do IndexedDB
 */
export async function deleteCoverImage(albumKey: string): Promise<void> {
  const database = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([COVER_STORE], 'readwrite');
    const store = transaction.objectStore(COVER_STORE);
    const request = store.delete(albumKey);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Limpa todos os dados armazenados
 */
export async function clearAllStorage(): Promise<void> {
  const database = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([AUDIO_STORE, COVER_STORE], 'readwrite');
    
    transaction.objectStore(AUDIO_STORE).clear();
    transaction.objectStore(COVER_STORE).clear();
    
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}
