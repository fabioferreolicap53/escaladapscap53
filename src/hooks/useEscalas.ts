import useSWR from 'swr';
import { pb, getCollectionName } from '../lib/pocketbase';

export interface Escala {
  id: string;
  profId: string;
  name: string;
  avatar: string;
  role: string;
  month: number;
  year: number;
  status: string;
  statusColor: string;
  vinculo: string;
  time: string;
  shifts: string; // Adicionado campo para guardar o array de turnos em JSON
  created?: string;
}

const fetcher = async () => {
  const collectionName = getCollectionName('escalas');
  try {
    const records = await pb.collection(collectionName).getFullList({
      sort: '-created',
      fields: 'id,profId,name,avatar,role,month,year,status,statusColor,vinculo,time,shifts,created'
    });
    
    return records.map(record => ({
      id: record.id,
      profId: record.profId,
      name: record.name,
      avatar: record.avatar,
      role: record.role,
      month: record.month,
      year: record.year,
      status: record.status,
      statusColor: record.statusColor,
      vinculo: record.vinculo,
      time: record.time,
      shifts: record.shifts || '[]',
      created: record.created
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

  const deleteEscala = async (id: string) => {
    try {
      await pb.collection(collectionName).delete(id);
      mutate(current => {
        if (!current) return current;
        return current.filter(e => e.id !== id);
      }, false);
    } catch (error) {
      console.error("Erro ao excluir escala:", error);
      throw error;
    }
  };

  const updateEscala = async (id: string, atualizacao: Partial<Escala>) => {
    try {
      const record = await pb.collection(collectionName).update(id, atualizacao);
      mutate(current => {
        if (!current) return current;
        return current.map(e => e.id === id ? { ...e, ...atualizacao } : e);
      }, false);
      return record;
    } catch (error) {
      console.error("Erro ao atualizar escala:", error);
      throw error;
    }
  };

  return {
    escalas: data || [],
    isLoading,
    isError: error,
    addEscala,
    deleteEscala,
    updateEscala,
    mutate
  };
}
