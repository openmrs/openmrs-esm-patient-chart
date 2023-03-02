import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import debounce from 'lodash-es/debounce';
import isEmpty from 'lodash-es/isEmpty';
import { Layer, RadioButtonGroup, RadioButton, Search, StructuredListSkeleton } from '@carbon/react';
import { EmptyState, PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import { useLayoutType, usePagination, VisitType } from '@openmrs/esm-framework';
import styles from './visit-type-overview.scss';

interface BaseVisitTypeProps {
  onChange: (event) => void;
  patientUuid: string;
  visitTypes: Array<VisitType>;
}

const BaseVisitType: React.FC<BaseVisitTypeProps> = ({ onChange, visitTypes }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const [searchTerm, setSearchTerm] = useState<string>('');

  const searchResults = useMemo(() => {
    if (!isEmpty(searchTerm)) {
      return visitTypes.filter((visitType) => visitType.display.toLowerCase().search(searchTerm.toLowerCase()) !== -1);
    } else {
      return visitTypes;
    }
  }, [searchTerm, visitTypes]);

  const handleSearch = useMemo(() => debounce((searchTerm) => setSearchTerm(searchTerm), 300), []);

  const { results, currentPage, goTo } = usePagination(searchResults, 5);

  return (
    <div className={`${styles.visitTypeOverviewWrapper} ${isTablet ? styles.tablet : styles.desktop}`}>
      {visitTypes.length ? (
        <>
          {isTablet ? (
            <Layer>
              <Search
                onChange={(event) => handleSearch(event.target.value)}
                placeholder={t('searchForAVisitType', 'Search for a visit type')}
                labelText=""
                light={isTablet}
              />
            </Layer>
          ) : (
            <Search
              onChange={(event) => handleSearch(event.target.value)}
              placeholder={t('searchForAVisitType', 'Search for a visit type')}
              labelText=""
              light={isTablet}
            />
          )}

          <RadioButtonGroup
            className={styles.radioButtonGroup}
            defaultSelected={results?.length === 1 ? results[0].uuid : ''}
            orientation="vertical"
            onChange={onChange}
            name="radio-button-group"
            valueSelected={results?.length === 1 ? results[0].uuid : ''}
          >
            {results.map(({ uuid, display, name }) => (
              <RadioButton key={uuid} className={styles.radioButton} id={name} labelText={display} value={uuid} />
            ))}
          </RadioButtonGroup>
          <div className={styles.paginationContainer}>
            <PatientChartPagination
              pageNumber={currentPage}
              totalItems={visitTypes?.length}
              currentItems={results.length}
              pageSize={5}
              onPageNumberChange={({ page }) => goTo(page)}
            />
          </div>
        </>
      ) : (
        <StructuredListSkeleton />
      )}
    </div>
  );
};

export default BaseVisitType;
