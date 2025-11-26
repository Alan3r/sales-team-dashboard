import { useState, useEffect } from 'react';
import { Member, WeekData, StructureChange } from '@/types/dashboard';

type StorageItem = Member | WeekData | StructureChange;

export function useLocalStorage<T extends StorageItem>(key: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [key]);

  const loadData = () => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        setData(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveData = (newData: T[]) => {
    try {
      localStorage.setItem(key, JSON.stringify(newData));
      setData(newData);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const addItem = (item: T) => {
    const newData = [...data, item];
    saveData(newData);
  };

  const updateItem = (id: string, updates: Partial<T>) => {
    const newData = data.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    saveData(newData);
  };

  const deleteItem = (id: string) => {
    const newData = data.filter(item => item.id !== id);
    saveData(newData);
  };

  const clearAll = () => {
    saveData([]);
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
