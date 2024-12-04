import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Search } from '@carbon/react';
import { useConfig, useDebounce, ResponsiveWrapper, closeWorkspace, useLayoutType } from '@openmrs/esm-framework';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { type DrugOrderBasketItem } from '../../types';
import { type ConfigObject } from '../../config-schema';
import OrderBasketSearchResults from './order-basket-search-results.component';
import styles from './order-basket-search.scss';

export interface DrugSearchProps {
  openOrderForm: (searchResult: DrugOrderBasketItem) => void;
}

export default function DrugSearch({ openOrderForm }: DrugSearchProps) {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const [searchTerm, setSearchTerm] = useState('');
  const { debounceDelayInMs } = useConfig<ConfigObject>();
  const debouncedSearchTerm = useDebounce(searchTerm, debounceDelayInMs ?? 300);
  const searchInputRef = useRef(null);

  const cancelDrugOrder = useCallback(() => {
    closeWorkspace('add-drug-order', {
      onWorkspaceClose: () => launchPatientWorkspace('order-basket'),
    });
  }, []);

  const focusAndClearSearchInput = () => {
    setSearchTerm('');
    searchInputRef.current?.focus();
  };

  const handleSearchTermChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setSearchTerm(event.target.value ?? '');

  return (
    <div className={styles.searchPopupContainer}>
      <ResponsiveWrapper>
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
      {isTablet && (
        <div className={styles.separatorContainer}>
          <p className={styles.separator}>{t('or', 'or')}</p>
          <Button iconDescription="Return to order basket" kind="ghost" onClick={cancelDrugOrder}>
            {t('returnToOrderBasket', 'Return to order basket')}
          </Button>
        </div>
      )}
    </div>
  );
}
