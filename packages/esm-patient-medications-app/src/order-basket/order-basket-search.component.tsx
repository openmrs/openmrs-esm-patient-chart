import React, { useState } from 'react';
import styles from './order-basket-search.scss';
import { Search } from 'carbon-components-react';
import OrderBasketSearchResults from './order-basket-search-results.component';
import { useTranslation } from 'react-i18next';
import { OrderBasketItem } from '../types/order-basket-item';

export interface OrderBasketSearchProps {
  encounterUuid: string;
  onSearchResultClicked: (searchResult: OrderBasketItem, directlyAddToBasket: boolean) => void;
  isTablet: boolean;
}

export default function OrderBasketSearch({ encounterUuid, onSearchResultClicked, isTablet }: OrderBasketSearchProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <>
      <div className={styles.searchPopupContainer}>
        <Search
          size="xl"
          light={isTablet}
          value={searchTerm}
          placeholder={t('searchFieldPlaceholder', 'Search for an order (e.g. "Aspirin")')}
          labelText={t('searchFieldPlaceholder', 'Search for an order (e.g. "Aspirin")')}
          onChange={(e) => setSearchTerm(e.currentTarget?.value ?? '')}
        />
        <div style={{ margin: '1rem' }}>
          <OrderBasketSearchResults
            isTablet={isTablet}
            encounterUuid={encounterUuid}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onSearchResultClicked={onSearchResultClicked}
          />
        </div>
      </div>
    </>
  );
}
