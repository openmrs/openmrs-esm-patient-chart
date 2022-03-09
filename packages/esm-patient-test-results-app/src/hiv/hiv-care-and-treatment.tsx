import { Column, ContentSwitcher, InlineLoading, Row, Switch } from 'carbon-components-react';
import React, { useState } from 'react';
import FilterSet from '../filter/filter-set';
import { FilterProvider } from '../filter/filter-context';
import NewTimeline from '../new-timeline/new-timeline';
import { EmptyState, ErrorState } from '@openmrs/esm-patient-common-lib';
import useGetObstreeData from '../new-timeline/useObstreeData';

interface obsShape {
  [key: string]: any;
}

const HIVCareAndTreatment = () => {
  const concept = '5035a431-51de-40f0-8f25-4a98762eb796'; // bloodwork
  const { data: root, error, loading }: obsShape = useGetObstreeData(concept);

  const [view, setView] = useState<string>('split');

  const expanded = view === 'full';

  if (loading) {
    return <InlineLoading />;
  }
  if (error) {
    return <ErrorState error={error} headerTitle="Data Load Error" />;
  }
  if (!loading && !error && root?.display && root?.subSets?.length) {
    return (
      <FilterProvider root={root}>
        <div style={{ padding: 0 }}>
          <Row style={{ padding: '1rem 0' }}>
            <Column sm={16} lg={expanded ? 0 : 6}>
              <div style={{ display: 'flex' }}>
                <h4 style={{ flexGrow: 1 }}>Results</h4>
                <div style={{ minWidth: '10rem' }}>
                  <ContentSwitcher>
                    <Switch name="panel" text="Panel" />
                    <Switch name="tree" text="Tree" />
                  </ContentSwitcher>
                </div>
              </div>
            </Column>
            <Column sm={16} lg={expanded ? 12 : 6} style={{ border: expanded ? null : '0 0 0 1px solid gray' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <ContentSwitcher style={{ maxWidth: '10rem' }} onChange={(e) => setView(`${e.name}`)}>
                  <Switch name="split" text="Split" />
                  <Switch name="full" text="Full" />
                </ContentSwitcher>
              </div>
            </Column>
          </Row>
          <Row>
            <Column sm={16} lg={expanded ? 0 : 6}>
              <FilterSet />
            </Column>
            <Column sm={16} lg={expanded ? 12 : 6}>
              <NewTimeline />
            </Column>
          </Row>
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
