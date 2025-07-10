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

interface FormsProviderProps {
  children: React.ReactNode;
  defaultPageSize?: number;
  defaultCurrentPage?: number;
}

export const FormsProvider: React.FC<FormsProviderProps> = ({
  children,
  defaultPageSize = 50,
  defaultCurrentPage = 1,
}) => {
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [currentPage, setCurrentPage] = useState(defaultCurrentPage);
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
