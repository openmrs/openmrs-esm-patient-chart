import React, { createContext, useContext, useState, useMemo } from 'react';

interface FormsContextState {
  pageSize: number;
  currentPage: number;
  searchTerm: string;
  setPageSize: (size: number) => void;
  setCurrentPage: (page: number) => void;
  setSearchTerm: (term: string) => void;
}

const FormsContext = createContext<FormsContextState | undefined>(undefined);

export const FormsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const value = useMemo(
    () => ({
      pageSize,
      currentPage,
      searchTerm,
      setPageSize,
      setCurrentPage,
      setSearchTerm,
    }),
    [pageSize, currentPage, searchTerm],
  );

  return <FormsContext.Provider value={value}>{children}</FormsContext.Provider>;
};

export const useFormsContext = () => {
  const context = useContext(FormsContext);
  if (!context) {
    throw new Error('useFormsContext must be used within a FormsProvider');
  }
  return context;
};
