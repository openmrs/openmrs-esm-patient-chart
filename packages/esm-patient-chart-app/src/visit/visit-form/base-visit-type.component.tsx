import React, { useState, useMemo, useCallback, type ChangeEvent } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { useFormContext, Controller } from 'react-hook-form';
import { Layer, RadioButton, RadioButtonGroup, Search, StructuredListSkeleton, Tile } from '@carbon/react';
import { PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import { useDebounce, useLayoutType, usePagination, type VisitType } from '@openmrs/esm-framework';
import { type VisitFormData } from './visit-form.resource';
import styles from './base-visit-type.scss';

interface BaseVisitTypeProps {
  visitTypes: Array<VisitType>;
}

const BaseVisitType: React.FC<BaseVisitTypeProps> = ({ visitTypes }) => {
  const { t } = useTranslation();
  const { control } = useFormContext<VisitFormData>();
  const isTablet = useLayoutType() === 'tablet';
  const [searchTerm, setSearchTerm] = useState<string>('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const searchResults = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return visitTypes;
    }
    const lowercasedTerm = debouncedSearchTerm.toLowerCase();
    return visitTypes.filter((visitType) => visitType.display.toLowerCase().includes(lowercasedTerm));
  }, [debouncedSearchTerm, visitTypes]);

  const { results, currentPage, goTo } = usePagination(searchResults, 5);
  const hasNoMatchingSearchResults = debouncedSearchTerm.trim() !== '' && searchResults.length === 0;

  const handleSearchTermChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  return (
    <div className={classNames(styles.visitTypeOverviewWrapper, isTablet ? styles.tablet : styles.desktop)}>
      {visitTypes.length ? (
        <>
          {isTablet ? (
            <Layer>
              <Search
                labelText=""
                onChange={handleSearchTermChange}
                placeholder={t('searchForAVisitType', 'Search for a visit type')}
              />
            </Layer>
          ) : (
            <Search
              labelText=""
              onChange={handleSearchTermChange}
              placeholder={t('searchForAVisitType', 'Search for a visit type')}
            />
          )}

          {hasNoMatchingSearchResults ? (
            <div className={styles.tileContainer}>
              <Tile className={styles.tile}>
                <div className={styles.tileContent}>
                  <p className={styles.content}>{t('noVisitTypesToDisplay', 'No visit types to display')}</p>
                  <p className={styles.helper}>{t('checkFilters', 'Check the filters above')}</p>
                </div>
              </Tile>
            </div>
          ) : (
            <Controller
              name="visitType"
              control={control}
              defaultValue={results?.length === 1 ? results[0].uuid : null}
              render={({ field: { onChange, value } }) => (
                <RadioButtonGroup
                  className={styles.radioButtonGroup}
                  name="visit-types"
                  onChange={onChange}
                  orientation="vertical"
                  valueSelected={value}
                >
                  {results.map(({ uuid, display, name }) => (
                    <RadioButton key={uuid} className={styles.radioButton} id={name} labelText={display} value={uuid} />
                  ))}
                </RadioButtonGroup>
              )}
            />
          )}

          {!hasNoMatchingSearchResults && (
            <div className={styles.paginationContainer}>
              <PatientChartPagination
                currentItems={results.length}
                onPageNumberChange={({ page }) => goTo(page)}
                pageNumber={currentPage}
                pageSize={5}
                totalItems={visitTypes?.length}
              />
            </div>
          )}
        </>
      ) : (
        <StructuredListSkeleton className={styles.skeleton} />
      )}
    </div>
  );
};

export default BaseVisitType;
