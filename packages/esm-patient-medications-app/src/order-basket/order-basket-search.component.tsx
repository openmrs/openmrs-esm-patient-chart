import React, { useState, useEffect } from 'react';
import Search from 'carbon-components-react/es/components/Search';
import styles from './order-basket-search.scss';
import OrderBasketSearchResults from './order-basket-search-results';
import { useTranslation } from 'react-i18next';
import { OrderBasketItem } from '../types/order-basket-item';
import { useLayoutType } from '@openmrs/esm-framework';

export interface OrderBasketSearchProps {
  encounterUuid: string;
  onSearchResultClicked: (searchResult: OrderBasketItem, directlyAddToBasket: boolean) => void;
}

export default function OrderBasketSearch({ encounterUuid, onSearchResultClicked }: OrderBasketSearchProps) {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const [searchTerm, setSearchTerm] = useState('');
  const [lightMode, setLightMode] = useState<boolean>();

  useEffect(() => {
    layout === 'desktop' ? setLightMode(false) : setLightMode(true);
  }, [layout]);

  return (
    <>
      <div className={styles.searchPopupContainer}>
        <Search
          size="xl"
          light={lightMode}
          value={searchTerm}
          placeholder={t('searchFieldPlaceholder', 'Search for an order (e.g. "Aspirin")')}
          labelText={t('searchFieldPlaceholder', 'Search for an order (e.g. "Aspirin")')}
          onChange={(e) => setSearchTerm(e.currentTarget?.value ?? '')}
        />
        <div style={{ margin: '1rem' }}>
          <OrderBasketSearchResults
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
