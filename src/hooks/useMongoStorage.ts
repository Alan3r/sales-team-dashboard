import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Member, WeekData, StructureChange } from '@/types/dashboard';

type StorageItem = Member | WeekData | StructureChange;

export function useMongoStorage<T extends StorageItem>(collectionKey: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [collectionKey]);

  // Allow using a direct API endpoint instead of Supabase Functions.
  // Useful when hosting the frontend on GitHub Pages and using a simple
  // serverless API (Vercel / Render) or MongoDB Realm App Services.
  const API_URL = import.meta.env.VITE_API_URL;

  const loadData = async () => {
    try {
      if (API_URL) {
        const res = await fetch(`${API_URL}/${collectionKey}`);
        const json = await res.json();
        setData(json as T[]);
        return;
      }

      const { data: result, error } = await supabase.functions.invoke('dashboard-api/' + collectionKey, {
        method: 'GET',
      });

      if (error) {
        console.error('Error loading data:', error);
        throw error;
      }
      
      if (result && Array.isArray(result)) {
        setData(result as T[]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (item: T) => {
    try {
      if (API_URL) {
        await fetch(`${API_URL}/${collectionKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
        await loadData();
        return;
      }

      const { error } = await supabase.functions.invoke('dashboard-api/' + collectionKey, {
        body: item,
        method: 'POST',
      });

      if (error) {
        console.error('Error adding item:', error);
        throw error;
      }
      
      await loadData();
    } catch (error) {
      console.error('Error adding item:', error);
      throw error;
    }
  };

  const updateItem = async (id: string, updates: Partial<T>) => {
    try {
      const item = data.find(i => i.id === id);
      if (!item) return;

      let path = `${collectionKey}/${id}`;
      if (item.type === 'week_data') {
        const weekData = item as WeekData;
        path = `weeks/${id}/${weekData.week_start}`;
      }

      if (API_URL) {
        await fetch(`${API_URL}/${path}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        await loadData();
        return;
      }

      const { error } = await supabase.functions.invoke('dashboard-api/' + path, {
        body: updates,
        method: 'PUT',
      });

      if (error) {
        console.error('Error updating item:', error);
        throw error;
      }
      
      await loadData();
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      if (API_URL) {
        await fetch(`${API_URL}/${collectionKey}/${id}`, {
          method: 'DELETE',
        });
        await loadData();
        return;
      }

      const { error } = await supabase.functions.invoke('dashboard-api/' + collectionKey + '/' + id, {
        method: 'DELETE',
      });

      if (error) {
        console.error('Error deleting item:', error);
        throw error;
      }
      
      await loadData();
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  };

  const clearAll = async () => {
    try {
      if (API_URL) {
        await fetch(`${API_URL}/clear-all`, { method: 'POST' });
        await loadData();
        return;
      }

      const { error } = await supabase.functions.invoke('dashboard-api/clear-all', {
        method: 'POST',
      });

      if (error) {
        console.error('Error clearing data:', error);
        throw error;
      }
      
      await loadData();
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  };

  return {
    data,
    loading,
    addItem,
    updateItem,
    deleteItem,
    clearAll,
    refresh: loadData,
  };
}