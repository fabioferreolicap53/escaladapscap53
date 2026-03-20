import useSWR from 'swr';
import { pb, getCollectionName } from '../lib/pocketbase';

export interface SettingItem {
  id: string;
  name: string;
}

// Fetchers genéricos para qualquer tabela de configuração simples
const fetchSettings = async (collectionBaseName: string) => {
  const collectionName = getCollectionName(collectionBaseName);
  try {
    const records = await pb.collection(collectionName).getFullList({
      sort: 'created',
      fields: 'id,name'
    });
    return records.map(record => ({ id: record.id, name: record.name }));
  } catch (error) {
    console.error(`Erro ao buscar ${collectionBaseName}:`, error);
    return [];
  }
};

export function useSettingsDB(collectionBaseName: string) {
  const cacheKey = `settings_${collectionBaseName}`;
  
  const { data, error, mutate, isLoading } = useSWR(
    cacheKey, 
    () => fetchSettings(collectionBaseName), 
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      dedupingInterval: 300000 // 5 minutos de cache, muda pouco
    }
  );

  const collectionName = getCollectionName(collectionBaseName);

  const addItem = async (name: string) => {
    try {
      // Verifica duplicidade localmente antes de enviar
      if (data?.some(item => item.name.toLowerCase() === name.toLowerCase())) {
        return; 
      }

      const record = await pb.collection(collectionName).create({ name });
      mutate(current => {
        if (!current) return current;
        return [...current, { id: record.id, name: record.name }];
      }, false);
      return record;
    } catch (error) {
      console.error(`Erro ao criar em ${collectionBaseName}:`, error);
      throw error;
    }
  };

  const removeItem = async (id: string) => {
    try {
      await pb.collection(collectionName).delete(id);
      mutate(current => {
        if (!current) return current;
        return current.filter(item => item.id !== id);
      }, false);
    } catch (error) {
      console.error(`Erro ao excluir de ${collectionBaseName}:`, error);
      throw error;
    }
  };

  return {
    items: data || [],
    isLoading,
    isError: error,
    addItem,
    removeItem
  };
}