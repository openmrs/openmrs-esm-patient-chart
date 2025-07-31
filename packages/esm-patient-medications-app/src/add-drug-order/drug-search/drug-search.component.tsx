import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Search } from '@carbon/react';
import {
  useConfig,
  useDebounce,
  ResponsiveWrapper,
  useLayoutType,
  Workspace2DefinitionProps,
} from '@openmrs/esm-framework';
import { type ConfigObject } from '../../config-schema';
import { type DrugOrderBasketItem } from '../../types';
import OrderBasketSearchResults from './order-basket-search-results.component';
import styles from './order-basket-search.scss';

export interface DrugSearchProps {
  openOrderForm: (searchResult: DrugOrderBasketItem) => void;
  closeWorkspace: Workspace2DefinitionProps['closeWorkspace']
}

export default function DrugSearch({ closeWorkspace, openOrderForm }: DrugSearchProps) {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const [searchTerm, setSearchTerm] = useState('');
  const { debounceDelayInMs } = useConfig<ConfigObject>();
  const debouncedSearchTerm = useDebounce(searchTerm, debounceDelayInMs ?? 300);
  const searchInputRef = useRef(null);

  const focusAndClearSearchInput = () => {
    setSearchTerm('');
    searchInputRef.current?.focus();
  };


  return (
    <div className={styles.searchPopupContainer}>
      <ResponsiveWrapper>
        <Search
          size="lg"
          placeholder={t('searchFieldPlaceholder', 'Search for a drug or orderset (e.g. "Aspirin")')}
          labelText={t('searchFieldPlaceholder', 'Search for a drug or orderset (e.g. "Aspirin")')}
          onChange={(e) => setSearchTerm(e.target.value ?? '')}
          ref={searchInputRef}
          value={searchTerm}
        />
      </ResponsiveWrapper>
      <OrderBasketSearchResults
        searchTerm={debouncedSearchTerm}
        closeWorkspace={closeWorkspace}
        openOrderForm={openOrderForm}
        focusAndClearSearchInput={focusAndClearSearchInput}
      />
      {isTablet && (
        <div className={styles.separatorContainer}>
          <p className={styles.separator}>{t('or', 'or')}</p>
          <Button iconDescription="Return to order basket" kind="ghost" onClick={() => closeWorkspace()}>
            {t('returnToOrderBasket', 'Return to order basket')}
          </Button>
        </div>
      )}
    </div>
  );
}
