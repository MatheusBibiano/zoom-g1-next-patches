import { useState, useEffect, useCallback, useRef } from 'react';
import { type Patch } from '../types/patch';
import { patchesService } from '../database/patches-service';

type SortOption = 'song_name' | 'artist' | 'created_at';

// Hooks for querying patches list with debounced search query and horizontal chips sorting
export const usePatches = () => {
  const [patches, setPatches] = useState<Patch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] =
    useState<SortOption>('song_name');

  const currentQueryId = useRef(0);

  // Register a debounce effect of 300ms on search queries before querying database
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Performs database load call
  const fetchPatches = useCallback(async () => {
    const queryId = ++currentQueryId.current;
    try {
      setIsLoading(true);
      const data = await patchesService.getAll(
        debouncedSearchQuery,
        selectedSort
      );
      if (queryId === currentQueryId.current) {
        setPatches(data);
      }
    } catch (error) {
      console.error('Failed to load patches from database:', error);
    } finally {
      if (queryId === currentQueryId.current) {
        setIsLoading(false);
      }
    }
  }, [debouncedSearchQuery, selectedSort]);

  // Triggers re-fetch upon query inputs or sorting option changes
  useEffect(() => {
    fetchPatches();
  }, [fetchPatches]);

  return {
    patches,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedSort,
    setSelectedSort,
    refetch: fetchPatches,
  };
};
