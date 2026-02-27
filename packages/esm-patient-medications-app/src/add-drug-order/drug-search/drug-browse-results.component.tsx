import { SkeletonText, Tile } from '@carbon/react';
import { useLayoutType, type Visit, type Workspace2DefinitionProps } from '@openmrs/esm-framework';
import { type DrugOrderBasketItem } from '@openmrs/esm-patient-common-lib';
import React from 'react';
import { useTranslation } from 'react-i18next';

import classNames from 'classnames';
import { DrugBrowseEmptyState } from './drug-browse-empty-state.component';
import { type DrugSearchResult } from './drug-search.resource';
import { DrugSearchResultItem } from './order-basket-search-results.component';
import styles from './order-basket-search-results.scss';

interface DrugBrowseResultsProps {
  drugs: DrugSearchResult[];
  isLoading: boolean;
  isError?: boolean;
  hasSelection: boolean;
  patient: fhir.Patient;
  visit: Visit;
  closeWorkspace: Workspace2DefinitionProps['closeWorkspace'];
  openOrderForm: (item: DrugOrderBasketItem) => void;
}

export default function DrugBrowseResults({
  drugs,
  isLoading,
  isError = false,
  hasSelection,
  patient,
  visit,
  closeWorkspace,
  openOrderForm,
}: DrugBrowseResultsProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return <DrugBrowseSkeleton />;
  }

  if (isError) {
    return <Tile>{t('errorFetchingDrugCategory', 'Error fetching drugs')}</Tile>;
  }

  if (!drugs?.length) {
    const emptyStateTitle = hasSelection
      ? t('noDrugsInCategory', 'No drugs found in this category')
      : t('chooseCategoryToGetStarted', 'Choose a category to get started');

    const emptyStateDescription = hasSelection
      ? t(
          'noDrugsInCategoryDescription',
          'The drug category you selected does not contain any drugs. Please select a different category.',
        )
      : t('chooseCategoryToGetStartedDescription', 'Select a category to see available drugs.');

    return <DrugBrowseEmptyState title={emptyStateTitle} description={emptyStateDescription} />;
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

function DrugBrowseSkeleton() {
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
