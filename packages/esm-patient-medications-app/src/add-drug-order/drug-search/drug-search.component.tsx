import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, Search } from '@carbon/react';
import { useDebounce, useLayoutType } from '@openmrs/esm-framework';
import { type DrugOrderBasketItem } from '../../types';
import OrderBasketSearchResults from './order-basket-search-results.component';
import styles from './order-basket-search.scss';

export interface DrugSearchProps {
  openOrderForm: (searchResult: DrugOrderBasketItem) => void;
}

export default function DrugSearch({ openOrderForm }: DrugSearchProps) {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm);
  const searchInputRef = useRef(null);

  const focusAndClearSearchInput = () => {
    setSearchTerm('');
    searchInputRef.current?.focus();
  };

  const handleSearchTermChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value ?? '');
  };

  return (
    <div className={styles.searchPopupContainer}>
      <ResponsiveWrapper isTablet={isTablet}>
        <Search
          autoFocus
          size="lg"
          placeholder={t('searchFieldPlaceholder', 'Search for a drug or orderset (e.g. "Aspirin")')}
          labelText={t('searchFieldPlaceholder', 'Search for a drug or orderset (e.g. "Aspirin")')}
          onChange={handleSearchTermChange}
          ref={searchInputRef}
          value={searchTerm}
        />
      </ResponsiveWrapper>
      <OrderBasketSearchResults
        searchTerm={debouncedSearchTerm}
        openOrderForm={openOrderForm}
        focusAndClearSearchInput={focusAndClearSearchInput}
      />
    </div>
  );
}

function ResponsiveWrapper({ children, isTablet }: { children: React.ReactNode; isTablet: boolean }) {
  return isTablet ? <Layer>{children} </Layer> : <>{children}</>;
}
