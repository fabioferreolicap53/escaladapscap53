import useSWR from 'swr';
import { pb, getCollectionName } from '../lib/pocketbase';

export interface Profissional {
  id: string;
  name: string;
  avatar: string;
  dept: string;
  role: string;
  status: string;
  statusColor: string;
  hours: string;
  vinculo: string;
}

const fetcher = async () => {
  const collectionName = getCollectionName('profissionais');
  try {
    const records = await pb.collection(collectionName).getFullList({
      sort: '-created',
      // Trazer apenas os campos necessários para economizar memória
      fields: 'id,name,avatar,dept,role,status,statusColor,hours,vinculo'
    });
    
    return records.map(record => ({
      id: record.id,
      name: record.name,
      avatar: record.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(record.name)}&background=random&color=fff`,
      dept: record.dept,
      role: record.role,
      status: record.status || 'Ativo',
      statusColor: record.statusColor || 'primary',
      hours: record.hours,
      vinculo: record.vinculo
    }));
  } catch (error) {
    console.error("Erro ao buscar profissionais no PocketBase:", error);
    return [];
  }
};

export function useProfissionais() {
  const { data, error, mutate, isLoading } = useSWR('profissionais', fetcher, {
    // Revalidar com menos frequência para priorizar cache e poupar a VM
    revalidateOnFocus: false,
    revalidateIfStale: false,
    dedupingInterval: 60000 // 1 minuto de cache em memória
  });

  const collectionName = getCollectionName('profissionais');

  const addProfissional = async (novo: Omit<Profissional, 'id'>) => {
    try {
      const record = await pb.collection(collectionName).create(novo);
      // Atualiza o cache local sem precisar fazer novo fetch
      mutate(current => {
        if (!current) return current;
        return [{...novo, id: record.id}, ...current];
      }, false);
      return record;
    } catch (error) {
      console.error("Erro ao criar profissional:", error);
      throw error;
    }
  };

  const updateProfissional = async (id: string, dados: Partial<Profissional>) => {
    try {
      await pb.collection(collectionName).update(id, dados);
      mutate(current => {
        if (!current) return current;
        return current.map(p => p.id === id ? { ...p, ...dados } : p);
      }, false);
    } catch (error) {
      console.error("Erro ao atualizar profissional:", error);
      throw error;
    }
  };

  const deleteProfissional = async (id: string) => {
    try {
      await pb.collection(collectionName).delete(id);
      mutate(current => {
        if (!current) return current;
        return current.filter(p => p.id !== id);
      }, false);
    } catch (error) {
      console.error("Erro ao excluir profissional:", error);
      throw error;
    }
  };

  return {
    profissionais: data || [],
    isLoading,
    isError: error,
    addProfissional,
    updateProfissional,
    deleteProfissional,
    mutate
  };
}
