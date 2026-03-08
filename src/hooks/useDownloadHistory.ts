import { useState, useEffect, useCallback } from 'react';

export interface DownloadRecord {
  id: string;
  url: string;
  title: string;
  platform: 'youtube' | 'tiktok' | 'instagram' | 'facebook' | 'unknown';
  format: string;
  method: string;
  date: string;
  thumbnail?: string;
}

const STORAGE_KEY = 'download_history';

export function useDownloadHistory() {
  const [history, setHistory] = useState<DownloadRecord[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch {}
  }, []);

  const save = (records: DownloadRecord[]) => {
    setHistory(records);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  };

  const addRecord = useCallback((record: Omit<DownloadRecord, 'id' | 'date'>) => {
    const newRecord: DownloadRecord = {
      ...record,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };
    save([newRecord, ...history]);
  }, [history]);

  const removeRecord = useCallback((id: string) => {
    save(history.filter(r => r.id !== id));
  }, [history]);

  const clearHistory = useCallback(() => {
    save([]);
  }, []);

  const isDuplicate = useCallback((url: string) => {
    return history.some(r => r.url === url);
  }, [history]);

  return { history, addRecord, removeRecord, clearHistory, isDuplicate };
}
