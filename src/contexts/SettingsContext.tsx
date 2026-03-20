import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useSettingsDB, SettingItem } from '../hooks/useSettingsDB';

interface SettingsContextType {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  
  linhasCuidado: SettingItem[];
  addLinha: (name: string) => Promise<any>;
  removeLinha: (id: string) => Promise<void>;
  isLoadingLinhas: boolean;

  categorias: SettingItem[];
  addCategoria: (name: string) => Promise<any>;
  removeCategoria: (id: string) => Promise<void>;
  isLoadingCategorias: boolean;

  vinculos: SettingItem[];
  addVinculo: (name: string) => Promise<any>;
  removeVinculo: (id: string) => Promise<void>;
  isLoadingVinculos: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Conectando com o PocketBase
  const { 
    items: linhasCuidado, 
    addItem: addLinha, 
    removeItem: removeLinha,
    isLoading: isLoadingLinhas
  } = useSettingsDB('linhas_cuidado');

  const { 
    items: categorias, 
    addItem: addCategoria, 
    removeItem: removeCategoria,
    isLoading: isLoadingCategorias
  } = useSettingsDB('categorias');

  const { 
    items: vinculos, 
    addItem: addVinculo, 
    removeItem: removeVinculo,
    isLoading: isLoadingVinculos
  } = useSettingsDB('vinculos');

  return (
    <SettingsContext.Provider value={{ 
      searchTerm, setSearchTerm,
      linhasCuidado, addLinha, removeLinha, isLoadingLinhas,
      categorias, addCategoria, removeCategoria, isLoadingCategorias,
      vinculos, addVinculo, removeVinculo, isLoadingVinculos
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
