import { Column, Grid, Row } from 'carbon-components-react';
import React from 'react';
import Timeline from '../timeline';
import concepts from './concepts';
import FilterSetRoot, { FilterSetSubSet } from '../filter/FilterSetRoot';

const Filter = ({ concepts }) => {
  return (
    <div>
      <FilterSetRoot root={concepts} active>
        {concepts?.sub_sets?.map((subSet, index) => (
          <FilterSetSubSet root={subSet} key={index}></FilterSetSubSet>
        ))}
      </FilterSetRoot>
    </div>
  );
};

const HIVCareAndTreatment = ({ patientUuid }) => {
  return (
    <div>
      <Grid>
        <Row>
          <Column sm={16} lg={4}>
            <Filter concepts={concepts} />
          </Column>
          <Column sm={16} lg={8}>
            <Timeline patientUuid={patientUuid} />
          </Column>
        </Row>
      </Grid>
    </div>
  );
};

export default HIVCareAndTreatment;
