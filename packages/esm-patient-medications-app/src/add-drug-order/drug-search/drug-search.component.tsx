import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Search } from '@carbon/react';
import {
  ExtensionSlot,
  useConfig,
  useDebounce,
  ResponsiveWrapper,
  useLayoutType,
  type Workspace2DefinitionProps,
  type Visit,
} from '@openmrs/esm-framework';
import { type DrugOrderBasketItem } from '@openmrs/esm-patient-common-lib';
import { type ConfigObject } from '../../config-schema';
import OrderBasketSearchResults from './order-basket-search-results.component';
import styles from './order-basket-search.scss';

export interface DrugSearchProps {
  openOrderForm: (searchResult: DrugOrderBasketItem) => void;
  closeWorkspace: Workspace2DefinitionProps['closeWorkspace'];
  patient: fhir.Patient;
  visit: Visit;
}

export default function DrugSearch({ closeWorkspace, openOrderForm, patient, visit }: DrugSearchProps) {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const [searchTerm, setSearchTerm] = useState('');
  const { debounceDelayInMs, daysDurationUnit } = useConfig<ConfigObject>();
  const debouncedSearchTerm = useDebounce(searchTerm, debounceDelayInMs ?? 300);
  const searchInputRef = useRef(null);

  const handleSearchTermChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value ?? '');
    },
    [setSearchTerm],
  );

  const focusAndClearSearchInput = useCallback(() => {
    setSearchTerm('');
    searchInputRef.current?.focus();
  }, [setSearchTerm]);

  return (
    <div className={styles.searchPopupContainer}>
      <ResponsiveWrapper>
        <Search
          size="lg"
          placeholder={t('searchFieldPlaceholder', 'Search for a drug or orderset (e.g. "Aspirin")')}
          labelText={t('searchFieldPlaceholder', 'Search for a drug or orderset (e.g. "Aspirin")')}
          onChange={handleSearchTermChange}
          ref={searchInputRef}
          value={searchTerm}
        />
      </ResponsiveWrapper>
      <ExtensionSlot
        name="drug-search-slot"
        state={{ openOrderForm, isSearching: Boolean(debouncedSearchTerm), visit, daysDurationUnit }}
      />
      <OrderBasketSearchResults
        searchTerm={debouncedSearchTerm}
        closeWorkspace={closeWorkspace}
        openOrderForm={openOrderForm}
        focusAndClearSearchInput={focusAndClearSearchInput}
        patient={patient}
        visit={visit}
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
