import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SettingsContextType {
  linhasCuidado: string[];
  addLinha: (linha: string) => void;
  removeLinha: (linha: string) => void;
  categorias: string[];
  addCategoria: (categoria: string) => void;
  removeCategoria: (categoria: string) => void;
  vinculos: string[];
  addVinculo: (vinculo: string) => void;
  removeVinculo: (vinculo: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [linhasCuidado, setLinhasCuidado] = useState<string[]>([]);

  const [categorias, setCategorias] = useState<string[]>([]);

  const [vinculos, setVinculos] = useState<string[]>([]);

  const addLinha = (linha: string) => {
    if (linha && !linhasCuidado.includes(linha)) {
      setLinhasCuidado([...linhasCuidado, linha]);
    }
  };

  const removeLinha = (linha: string) => {
    setLinhasCuidado(linhasCuidado.filter(l => l !== linha));
  };

  const addCategoria = (categoria: string) => {
    if (categoria && !categorias.includes(categoria)) {
      setCategorias([...categorias, categoria]);
    }
  };

  const removeCategoria = (categoria: string) => {
    setCategorias(categorias.filter(c => c !== categoria));
  };

  const addVinculo = (vinculo: string) => {
    if (vinculo && !vinculos.includes(vinculo)) {
      setVinculos([...vinculos, vinculo]);
    }
  };

  const removeVinculo = (vinculo: string) => {
    setVinculos(vinculos.filter(v => v !== vinculo));
  };

  return (
    <SettingsContext.Provider value={{ 
      linhasCuidado, addLinha, removeLinha, 
      categorias, addCategoria, removeCategoria,
      vinculos, addVinculo, removeVinculo,
      searchTerm, setSearchTerm
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
