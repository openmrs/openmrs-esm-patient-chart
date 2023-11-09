import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import debounce from 'lodash-es/debounce';
import isEmpty from 'lodash-es/isEmpty';
import { Layer, RadioButton, RadioButtonGroup, Search } from '@carbon/react';
import { EmptyState, PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import { useLayoutType, usePagination } from '@openmrs/esm-framework';
import type { ConceptAnswer } from './deceased.resource';
import styles from './deceased-form.scss';

interface BaseConceptAnswerProps {
  onChange: (event) => void;
  isPatientDead: boolean;
  conceptAnswers;
}

const BaseConceptAnswer: React.FC<BaseConceptAnswerProps> = ({ onChange, isPatientDead, conceptAnswers }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const [searchTerm, setSearchTerm] = useState<string>('');

  const searchResults = useMemo(() => {
    if (!isEmpty(searchTerm)) {
      return conceptAnswers.filter(
        (conceptAnswer) => conceptAnswer.display.toLowerCase().search(searchTerm.toLowerCase()) !== -1,
      );
    } else {
      return conceptAnswers;
    }
  }, [searchTerm, conceptAnswers]);

  const handleSearch = React.useMemo(() => debounce((searchTerm) => setSearchTerm(searchTerm), 300), [setSearchTerm]);

  const { results, currentPage, goTo } = usePagination<ConceptAnswer>(searchResults, 10);

  return (
    <div
      className={classNames(
        styles.conceptAnswerOverviewWrapper,
        isTablet ? styles.conceptAnswerOverviewWrapperTablet : styles.conceptAnswerOverviewWrapperDesktop,
      )}
    >
      <ResponsiveWrapper isTablet={isTablet}>
        <Search
          onChange={(event) => handleSearch(event.target.value)}
          placeholder={t('searchForCauseOfDeath', 'Search for a cause of death')}
          labelText=""
        />
      </ResponsiveWrapper>

      {results.length ? (
        <>
          <RadioButtonGroup
            className={styles.radioButtonGroup}
            defaultSelected="default-selected"
            orientation="vertical"
            onChange={onChange}
            name="radio-button-group"
            valueSelected="default-selected"
          >
            {results?.map(({ uuid, display, name }) => (
              <RadioButton key={uuid} className={styles.radioButton} id={name} labelText={display} value={uuid} />
            ))}
          </RadioButtonGroup>
          <div className={styles.paginationContainer}>
            <PatientChartPagination
              pageNumber={currentPage}
              totalItems={conceptAnswers?.length}
              currentItems={results.length}
              pageSize={10}
              onPageNumberChange={({ page }) => goTo(page)}
            />
          </div>
        </>
      ) : (
        <EmptyState
          displayText={t('causeOfDeath_title', 'Cause of Death')}
          headerTitle={t('causeOfDeath', 'Cause of death')}
        />
      )}
    </div>
  );
};

function ResponsiveWrapper({ children, isTablet }: { children: React.ReactNode; isTablet: boolean }) {
  return isTablet ? <Layer>{children} </Layer> : <>{children}</>;
}

export default BaseConceptAnswer;
