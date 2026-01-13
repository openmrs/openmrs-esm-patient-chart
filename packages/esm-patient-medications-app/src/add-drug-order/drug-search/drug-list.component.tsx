import { Button, ComboBox } from '@carbon/react';
import { useConfig, useLayoutType, type Visit, type Workspace2DefinitionProps } from '@openmrs/esm-framework';
import { type DrugOrderBasketItem } from '@openmrs/esm-patient-common-lib';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { type ConfigObject } from '../../config-schema';
import DrugListResults from './drug-list-results.component';
import { type ConceptSet, useConceptSets, useDrugListByConceptSet } from './drug-search.resource';
import styles from './order-basket-search.scss';

interface DrugListProps {
  openOrderForm: (searchResult: DrugOrderBasketItem) => void;
  closeWorkspace: Workspace2DefinitionProps['closeWorkspace'];
  patient: fhir.Patient;
  visit: Visit;
}

export default function DrugList({ openOrderForm, closeWorkspace, patient, visit }: DrugListProps) {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';

  const { drugCategoryConceptSets } = useConfig<ConfigObject>();
  const { conceptSets, isLoading: isLoadingConceptSets } = useConceptSets(drugCategoryConceptSets);

  const [selectedConceptSet, setSelectedConceptSet] = useState<ConceptSet | null>(null);
  const { drugs, isLoading, error } = useDrugListByConceptSet(selectedConceptSet?.uuid);

  const onConceptSetChange = useCallback(({ selectedItem }: { selectedItem: ConceptSet }) => {
    setSelectedConceptSet(selectedItem ?? null);
  }, []);

  return (
    <div className={styles.searchPopupContainer}>
      <ComboBox
        id="service-type-concept-set-combobox"
        size="lg"
        items={conceptSets}
        selectedItem={selectedConceptSet}
        itemToString={(item) => item?.display ?? ''}
        placeholder={t('selectCategory', 'Search and select a category (e.g. Mental Health)')}
        aria-label={t('selectCategory', 'Search and select a category (e.g. Mental Health)')}
        onChange={onConceptSetChange}
        disabled={isLoadingConceptSets}
      />

      <DrugListResults
        drugs={drugs}
        isLoading={isLoading}
        error={error}
        patient={patient}
        visit={visit}
        closeWorkspace={closeWorkspace}
        openOrderForm={openOrderForm}
        hasSelection={Boolean(selectedConceptSet)}
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
