import { Button, Column, Grid, InlineLoading, Row } from 'carbon-components-react';
import React, { useContext, useState } from 'react';
import FilterSet from '../filter/filter-set';
import FilterContext, { FilterProvider } from '../filter/filter-context';
import NewTimeline from '../new-timeline/new-timeline';
import { EmptyState, ErrorState } from '@openmrs/esm-patient-common-lib';
import useGetObstreeData from '../new-timeline/useObstreeData';
import { Maximize32, Minimize32 } from '@carbon/icons-react';
import styles from '../filter/filter-set.scss';

interface obsShape {
  [key: string]: any;
}

const Results = () => {
  const { checkboxes } = useContext(FilterContext);
  return <h4>Results ({Object.keys(checkboxes).length})</h4>;
};

const HIVCareAndTreatment = () => {
  const concept = '5035a431-51de-40f0-8f25-4a98762eb796'; // bloodwork
  const { data: root, error, loading }: obsShape = useGetObstreeData(concept);
  const [expanded, setExpanded] = useState(false);

  if (loading) {
    return <InlineLoading />;
  }
  if (error) {
    return <ErrorState error={error} headerTitle="Data Load Error" />;
  }
  if (!loading && !error && root?.display && root?.subSets?.length) {
    return (
      <FilterProvider root={root}>
        <div style={{ position: 'relative', width: '100%' }}>
          <div className={styles.floatingRightButton}>
            <Button
              kind="ghost"
              renderIcon={expanded ? Minimize32 : Maximize32}
              iconDescription="expand"
              className={styles.expandButton}
              onClick={() => setExpanded(!expanded)}
            ></Button>
          </div>
          <div>
            <Grid style={{ padding: 0 }}>
              <Row>
                <Column sm={16} lg={expanded ? 0 : 4}>
                  <Results />
                  <FilterSet />
                </Column>
                <Column sm={16} lg={expanded ? 12 : 8}>
                  <NewTimeline />
                </Column>
              </Row>
            </Grid>
          </div>
        </div>
      </FilterProvider>
    );
  }
  if (!loading && !error && root?.display && root?.subSets?.length === 0) {
    return <EmptyState displayText="observations" headerTitle="Data Timeline" />;
  }
  return null;
};

export default HIVCareAndTreatment;
