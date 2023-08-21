import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, Search } from '@carbon/react';
import { useLayoutType } from '@openmrs/esm-framework';
import type { OrderBasketItem } from '@openmrs/esm-patient-common-lib';
import OrderBasketSearchResults from './order-basket-search-results.component';
import styles from './order-basket-search.scss';
import { useDebounce } from './drug-search.resource';

export interface OrderBasketSearchProps {
  onSearchResultClicked: (searchResult: OrderBasketItem, directlyAddToBasket: boolean) => void;
}

export default function OrderBasketSearch({ onSearchResultClicked }: OrderBasketSearchProps) {
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
        onSearchResultClicked={onSearchResultClicked}
        focusAndClearSearchInput={focusAndClearSearchInput}
      />
    </div>
  );
}

function ResponsiveWrapper({ children, isTablet }: { children: React.ReactNode; isTablet: boolean }) {
  return isTablet ? <Layer>{children} </Layer> : <>{children}</>;
}
