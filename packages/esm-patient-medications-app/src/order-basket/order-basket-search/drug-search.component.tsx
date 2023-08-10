import React, { useState } from 'react';
import debounce from 'lodash-es/debounce';
import { useTranslation } from 'react-i18next';
import { Layer, Search } from '@carbon/react';
import { useLayoutType } from '@openmrs/esm-framework';
import type { OrderBasketItem } from '../../types/order-basket-item';
import OrderBasketSearchResults from './order-basket-search-results.component';
import styles from './order-basket-search.scss';

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
    setSearchTerm('');
  };

  return (
    <div className={styles.searchPopupContainer}>
      <ResponsiveWrapper isTablet={isTablet}>
        <Search
          size="lg"
          placeholder={t('searchFieldPlaceholder', 'Search for a drug or orderset (e.g. "Aspirin")')}
          labelText={t('searchFieldPlaceholder', 'Search for a drug or orderset (e.g. "Aspirin")')}
          onChange={handleSearchTermChange}
        />
      </ResponsiveWrapper>
      <OrderBasketSearchResults
        searchTerm={searchTerm}
        onSearchTermClear={resetSearchTerm}
        onSearchResultClicked={onSearchResultClicked}
      />
    </div>
  );
}

function ResponsiveWrapper({ children, isTablet }: { children: React.ReactNode; isTablet: boolean }) {
  return isTablet ? <Layer>{children} </Layer> : <>{children}</>;
}
