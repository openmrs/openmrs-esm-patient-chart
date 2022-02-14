import { Column, Grid, InlineLoading, Row } from 'carbon-components-react';
import React, { useContext, useEffect } from 'react';
import concepts from './concepts';
import FilterSet from '../filter/FilterSet';
import FilterContext, { FilterProvider } from '../filter/FilterContext';
import usePatientResultsData from '../loadPatientTestData/usePatientResultsData';
import { usePatient } from '@openmrs/esm-framework';
import { MultiTimeline } from '../timeline/Timeline';
import { EmptyState, ErrorState } from '@openmrs/esm-patient-common-lib';

const StatePrinter = () => {
  const { state } = useContext(FilterContext);
  return <pre>{JSON.stringify(state, null, 2)}</pre>;
};

const DataLoader = ({ sortedObs }) => {
  const { state, initialize } = useContext(FilterContext);
  useEffect(() => {
    const tests = (sortedObs && Object.keys(sortedObs)) || [];
    if (tests.length && !Object.keys(state?.checkboxes).length) {
      initialize(Object.fromEntries(tests.map((test) => [test, false])), concepts);
    }
  }, [sortedObs, initialize, state]);
  return null;
};

const HIVCareAndTreatment = () => {
  const patient = usePatient();
  const patientUuid = patient?.patient?.id;
  const { sortedObs, loaded, error } = usePatientResultsData(patientUuid);
  return (
    <div>
      <FilterProvider>
        {!loaded && <InlineLoading />}
        {error && <ErrorState error={error} headerTitle="Data Load Error" />}
        {loaded && !error && sortedObs && Object.keys(sortedObs).length && (
          <>
            <DataLoader sortedObs={sortedObs} />
            <Grid>
              <Row>
                <Column sm={16} lg={4}>
                  <FilterSet root={concepts} />
                </Column>
                <Column sm={16} lg={8}>
                  <MultiTimeline patientUuid={patientUuid} />
                </Column>
              </Row>
            </Grid>
          </>
        )}
        {loaded && !error && sortedObs && !Object.keys(sortedObs).length && (
          <EmptyState displayText="observations" headerTitle="Data Timeline" />
        )}
      </FilterProvider>
    </div>
  );
};

export default HIVCareAndTreatment;
export { StatePrinter };
