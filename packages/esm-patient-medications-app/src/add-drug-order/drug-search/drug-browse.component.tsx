import { Button, ComboBox } from '@carbon/react';
import { useConfig, useLayoutType, type Visit, type Workspace2DefinitionProps } from '@openmrs/esm-framework';
import { type DrugOrderBasketItem } from '@openmrs/esm-patient-common-lib';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { type ConfigObject } from '../../config-schema';
import { DrugBrowseEmptyState } from './drug-browse-empty-state.component';
import DrugBrowseResults from './drug-browse-results.component';
import { type ConceptSet, useConceptSets, useDrugBrowseByConceptSet } from './drug-search.resource';
import styles from './order-basket-search.scss';

interface DrugBrowseProps {
  openOrderForm: (searchResult: DrugOrderBasketItem) => void;
  closeWorkspace: Workspace2DefinitionProps['closeWorkspace'];
  patient: fhir.Patient;
  visit: Visit;
}

export default function DrugBrowse({ openOrderForm, closeWorkspace, patient, visit }: DrugBrowseProps) {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';

  const { drugCategoryConceptSets } = useConfig<ConfigObject>();
  const { conceptSets, isLoading: isLoadingConceptSets } = useConceptSets(drugCategoryConceptSets);

  const [selectedConceptSet, setSelectedConceptSet] = useState<ConceptSet | null>(null);
  const { drugs, isLoading, hasFailures } = useDrugBrowseByConceptSet(selectedConceptSet?.uuid);

  const onConceptSetChange = useCallback(({ selectedItem }: { selectedItem: ConceptSet }) => {
    setSelectedConceptSet(selectedItem ?? null);
  }, []);

  if (conceptSets.length === 0) {
    return (
      <DrugBrowseEmptyState
        title={t('noCategoriesConfigured', 'No drug categories configured')}
        description={t(
          'noCategoriesConfiguredDescription',
          'To browse drugs by category, please configure drugCategoryConceptSets in the medications app config.',
        )}
      />
    );
  }

  return (
    <div className={styles.searchPopupContainer}>
      <div className={styles.comboBoxWrapper}>
        <ComboBox
          id="service-type-concept-set-combobox"
          size="lg"
          items={conceptSets}
          selectedItem={selectedConceptSet}
          itemToString={(item) => item?.display ?? ''}
          placeholder={t('selectCategory', 'Search and select a category (e.g. Mental Health)')}
          aria-label={t('selectCategory', 'Search and select a category (e.g. Mental Health)')}
          titleText={t('browseDrugsByCategory', 'Browse drugs by category')}
          onChange={onConceptSetChange}
          disabled={isLoadingConceptSets}
        />
      </div>

      <DrugBrowseResults
        drugs={drugs}
        isLoading={isLoading}
        isError={hasFailures}
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
