import useSWR from 'swr';
import { pb, getCollectionName } from '../lib/pocketbase';

export interface Escala {
  id: string;
  profId: string;
  name: string;
  avatar: string;
  role: string;
  unit: string;
  month: number;
  year: number;
  status: string;
  statusColor: string;
  vinculo: string;
  time: string;
}

const fetcher = async () => {
  const collectionName = getCollectionName('escalas');
  try {
    const records = await pb.collection(collectionName).getFullList({
      sort: '-created',
      fields: 'id,profId,name,avatar,role,unit,month,year,status,statusColor,vinculo,time'
    });
    
    return records.map(record => ({
      id: record.id,
      profId: record.profId,
      name: record.name,
      avatar: record.avatar,
      role: record.role,
      unit: record.unit,
      month: record.month,
      year: record.year,
      status: record.status,
      statusColor: record.statusColor,
      vinculo: record.vinculo,
      time: record.time
    }));
  } catch (error) {
    console.error("Erro ao buscar escalas no PocketBase:", error);
    return [];
  }
};

export function useEscalas() {
  const { data, error, mutate, isLoading } = useSWR('escalas', fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    dedupingInterval: 60000 // 1 minuto
  });

  const collectionName = getCollectionName('escalas');

  const addEscala = async (nova: Omit<Escala, 'id'>) => {
    try {
      const record = await pb.collection(collectionName).create(nova);
      mutate(current => {
        if (!current) return current;
        return [{...nova, id: record.id}, ...current];
      }, false);
      return record;
    } catch (error) {
      console.error("Erro ao criar escala:", error);
      throw error;
    }
  };

  return {
    escalas: data || [],
    isLoading,
    isError: error,
    addEscala,
    mutate
  };
}
