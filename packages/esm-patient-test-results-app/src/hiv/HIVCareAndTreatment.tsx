import { Column, Grid, Row } from 'carbon-components-react';
import React from 'react';
import Timeline from '../timeline';
import concepts from './concepts';
import FilterSet from '../filter/FilterSet';

const HIVCareAndTreatment = ({ patientUuid }) => {
  return (
    <div>
      <Grid>
        <Row>
          <Column sm={16} lg={4}>
            <FilterSet root={concepts} />
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
