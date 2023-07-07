import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from '@carbon/react';
import { useLayoutType } from '@openmrs/esm-framework';
import OrderBasketSearchResults from './order-basket-search-results.component';
import { OrderBasketItem } from '../../types/order-basket-item';
import styles from './order-basket-search.scss';
import { debounce } from 'lodash';

export interface OrderBasketSearchProps {
  onSearchResultClicked: (searchResult: OrderBasketItem, directlyAddToBasket: boolean) => void;
}

export default function OrderBasketSearch({ onSearchResultClicked }: OrderBasketSearchProps) {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleSearchTermChange = debounce((event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event?.target?.value?.trim();
  
    if (!input) {
      setSearchTerm('');
    }
  
    setSearchTerm(input);
  }, 300);

  const resetSearchTerm = () => { 
    setSearchTerm ('');
  }
  // eslint-disable-next-line no-console
console.log(searchTerm);

  return (
    <div className={styles.searchPopupContainer}>
      <Search
        size="lg"
        light={isTablet}
        // value={searchTerm}
        placeholder={t('searchFieldPlaceholder', 'Search for a drug or orderset (e.g. "Aspirin")')}
        labelText={t('searchFieldPlaceholder', 'Search for a drug or orderset (e.g. "Aspirin")')}
        onChange={handleSearchTermChange}
      />
      <OrderBasketSearchResults
        searchTerm={searchTerm}
        onSearchTermClear={resetSearchTerm}
        onSearchResultClicked={onSearchResultClicked}
      />
    </div>
  );
}
