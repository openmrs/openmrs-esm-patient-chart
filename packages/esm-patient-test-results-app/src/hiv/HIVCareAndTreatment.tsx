import { Column, Grid, Row } from 'carbon-components-react';
import React, { useContext, useEffect } from 'react';
import concepts from './concepts';
import FilterSet from '../filter/FilterSet';
import FilterContext, { FilterProvider } from '../filter/FilterContext';
import usePatientResultsData from '../loadPatientTestData/usePatientResultsData';
import { usePatient } from '@openmrs/esm-framework';
import { MultiTimeline } from '../timeline/Timeline';

const StatePrinter = () => {
  const { state } = useContext(FilterContext);
  return <p>{JSON.stringify(state, null, 2)}</p>;
};

const DataLoader = () => {
  const patient = usePatient();
  const patientUuid = patient?.patient?.id;
  const { sortedObs, loaded, error } = usePatientResultsData(patientUuid);
  const { state, initialize } = useContext(FilterContext);

  useEffect(() => {
    const tests = (sortedObs && Object.keys(sortedObs)) || [];
    if (tests.length && !Object.keys(state).length) {
      initialize(Object.fromEntries(tests.map((test) => [test, false])));
    }
  }, [sortedObs, initialize, state]);
  return null;
};

const HIVCareAndTreatment = ({ patientUuid }) => {
  return (
    <div>
      <FilterProvider>
        <DataLoader />
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
        {/* <StatePrinter /> */}
      </FilterProvider>
    </div>
  );
};

export default HIVCareAndTreatment;
