/**
 * @fileoverview Hook para gerenciar músicas favoritas
 * 
 * Armazena IDs das músicas favoritas no localStorage
 * 100% offline, sem necessidade de backend
 */

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

const FAVORITES_STORAGE_KEY = 'musicFavorites';

interface FavoritesContextType {
  /** IDs das músicas favoritas */
  favoriteIds: Set<string>;
  /** Verifica se uma música está nos favoritos */
  isFavorite: (trackId: string) => boolean;
  /** Adiciona/remove uma música dos favoritos */
  toggleFavorite: (trackId: string) => void;
  /** Adiciona uma música aos favoritos */
  addFavorite: (trackId: string) => void;
  /** Remove uma música dos favoritos */
  removeFavorite: (trackId: string) => void;
  /** Número total de favoritos */
  favoritesCount: number;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return new Set(Array.isArray(parsed) ? parsed : []);
      }
    } catch (e) {
      console.warn('Erro ao carregar favoritos:', e);
    }
    return new Set();
  });

  // Salva no localStorage quando muda
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...favoriteIds]));
    } catch (e) {
      console.warn('Erro ao salvar favoritos:', e);
    }
  }, [favoriteIds]);

  const isFavorite = useCallback((trackId: string) => {
    return favoriteIds.has(trackId);
  }, [favoriteIds]);

  const addFavorite = useCallback((trackId: string) => {
    setFavoriteIds(prev => {
      const next = new Set(prev);
      next.add(trackId);
      return next;
    });
  }, []);

  const removeFavorite = useCallback((trackId: string) => {
    setFavoriteIds(prev => {
      const next = new Set(prev);
      next.delete(trackId);
      return next;
    });
  }, []);

  const toggleFavorite = useCallback((trackId: string) => {
    setFavoriteIds(prev => {
      const next = new Set(prev);
      if (next.has(trackId)) {
        next.delete(trackId);
      } else {
        next.add(trackId);
      }
      return next;
    });
  }, []);

  return (
    <FavoritesContext.Provider
      value={{
        favoriteIds,
        isFavorite,
        toggleFavorite,
        addFavorite,
        removeFavorite,
        favoritesCount: favoriteIds.size,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites deve ser usado dentro de um FavoritesProvider');
  }
  return context;
}
