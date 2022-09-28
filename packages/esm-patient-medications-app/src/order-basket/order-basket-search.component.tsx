import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from '@carbon/react';
import { useLayoutType } from '@openmrs/esm-framework';
import OrderBasketSearchResults from './order-basket-search-results.component';
import { OrderBasketItem } from '../types/order-basket-item';
import styles from './order-basket-search.scss';

export interface OrderBasketSearchProps {
  encounterUuid: string;
  onSearchResultClicked: (searchResult: OrderBasketItem, directlyAddToBasket: boolean) => void;
}

export default function OrderBasketSearch({ encounterUuid, onSearchResultClicked }: OrderBasketSearchProps) {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className={styles.searchPopupContainer}>
      <Search
        size="lg"
        light={isTablet}
        value={searchTerm}
        placeholder={t('searchFieldPlaceholder', 'Search for an order (e.g. "Aspirin")')}
        labelText={t('searchFieldPlaceholder', 'Search for an order (e.g. "Aspirin")')}
        onChange={(e) => setSearchTerm(e.currentTarget?.value ?? '')}
      />
      <OrderBasketSearchResults
        encounterUuid={encounterUuid}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSearchResultClicked={onSearchResultClicked}
      />
    </div>
  );
}
