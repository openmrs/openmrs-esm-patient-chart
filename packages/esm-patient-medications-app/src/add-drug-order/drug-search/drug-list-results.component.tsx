import { SkeletonText, Tile } from '@carbon/react';
import { useLayoutType, type Visit, type Workspace2DefinitionProps } from '@openmrs/esm-framework';
import { type DrugOrderBasketItem } from '@openmrs/esm-patient-common-lib';
import React from 'react';
import { useTranslation } from 'react-i18next';

import classNames from 'classnames';
import { type DrugSearchResult } from './drug-search.resource';
import { DrugSearchResultItem } from './order-basket-search-results.component';
import styles from './order-basket-search-results.scss';

interface DrugListResultsProps {
  drugs: DrugSearchResult[];
  isLoading: boolean;
  error?: Error;
  hasSelection: boolean;
  patient: fhir.Patient;
  visit: Visit;
  closeWorkspace: Workspace2DefinitionProps['closeWorkspace'];
  openOrderForm: (item: DrugOrderBasketItem) => void;
}

export default function DrugListResults({
  drugs,
  isLoading,
  error,
  hasSelection,
  patient,
  visit,
  closeWorkspace,
  openOrderForm,
}: DrugListResultsProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return <DrugListSkeleton />;
  }

  if (error) {
    return <Tile>{t('errorFetchingDrugList', 'Error fetching drugs')}</Tile>;
  }

  if (!drugs?.length && hasSelection) {
    return (
      <Tile className={styles.emptyState}>
        <div>
          <h4 className={styles.productiveHeading01}>{t('noResultsForDrugList', 'No results to display')}</h4>
          <p className={styles.bodyShort01}>
            <span>{t('tryToSelectOtherOption', 'Try to select another option')}</span>
          </p>
        </div>
      </Tile>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.resultsContainer}>
        {drugs?.map((drug) => (
          <DrugSearchResultItem
            key={drug.uuid}
            drug={drug}
            patient={patient}
            visit={visit}
            closeWorkspace={closeWorkspace}
            openOrderForm={openOrderForm}
          />
        ))}
      </div>
    </div>
  );
}

function DrugListSkeleton() {
  const isTablet = useLayoutType() === 'tablet';
  const tileClassName = classNames({
    [styles.tabletSearchResultTile]: isTablet,
    [styles.desktopSearchResultTile]: !isTablet,
    [styles.skeletonTile]: true,
  });

  return (
    <div className={styles.searchResultSkeletonWrapper}>
      {[...Array(4)].map((_, index) => (
        <Tile key={index} className={tileClassName}>
          <SkeletonText />
        </Tile>
      ))}
    </div>
  );
}
