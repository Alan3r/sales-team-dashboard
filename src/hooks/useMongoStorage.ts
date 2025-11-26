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

  const loadData = async () => {
    try {
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