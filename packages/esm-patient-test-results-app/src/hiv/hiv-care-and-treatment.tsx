import { Column, Grid, InlineLoading, Row } from 'carbon-components-react';
import React from 'react';
import FilterSet from '../filter/filter-set';
import { FilterProvider } from '../filter/filter-context';
import { MultiTimeline } from '../timeline/Timeline';
import { EmptyState, ErrorState } from '@openmrs/esm-patient-common-lib';
import useGetObstreeData from '../timeline/useObstreeData';

interface obsShape {
  [key: string]: any;
}

const HIVCareAndTreatment = () => {
  const concept = '5035a431-51de-40f0-8f25-4a98762eb796'; // bloodwork
  const { data: root, error, loading }: obsShape = useGetObstreeData(concept);

  if (loading) {
    return <InlineLoading />;
  }
  if (error) {
    return <ErrorState error={error} headerTitle="Data Load Error" />;
  }
  if (!loading && !error && root?.display && root?.subSets?.length) {
    return (
      <FilterProvider root={root}>
        <Grid>
          <Row>
            <Column sm={16} lg={4}>
              <FilterSet />
            </Column>
            <Column sm={16} lg={8}>
              <MultiTimeline />
            </Column>
          </Row>
        </Grid>
      </FilterProvider>
    );
  }
  if (!loading && !error && root?.display && root?.subSets?.length === 0) {
    return <EmptyState displayText="observations" headerTitle="Data Timeline" />;
  }
  return null;
};

export default HIVCareAndTreatment;
