import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSettingsDB, SettingItem } from '../hooks/useSettingsDB';

type Theme = 'dark' | 'light';

interface SettingsContextType {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  
  theme: Theme;
  toggleTheme: () => void;
  
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
  
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Conectando com o PocketBase
  const { 
    items: linhasCuidado, 
    addItem: addLinha, 
    removeItem: removeLinha,
    isLoading: isLoadingLinhas
  } = useSettingsDB('escaladapscap53_linhas_cuidado');

  const { 
    items: categorias, 
    addItem: addCategoria, 
    removeItem: removeCategoria,
    isLoading: isLoadingCategorias
  } = useSettingsDB('escaladapscap53_categorias');

  const { 
    items: vinculos, 
    addItem: addVinculo, 
    removeItem: removeVinculo,
    isLoading: isLoadingVinculos
  } = useSettingsDB('escaladapscap53_vinculos');

  return (
    <SettingsContext.Provider value={{ 
      searchTerm, setSearchTerm,
      theme, toggleTheme,
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
