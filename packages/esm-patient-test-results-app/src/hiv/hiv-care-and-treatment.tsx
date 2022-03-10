import { Column, ContentSwitcher, InlineLoading, Row, Switch } from 'carbon-components-react';
import React, { useState } from 'react';
import FilterSet from '../filter/filter-set';
import { FilterProvider } from '../filter/filter-context';
import NewTimeline from '../new-timeline/new-timeline';
import { ErrorState } from '@openmrs/esm-patient-common-lib';
import { useGetManyObstreeData } from '../new-timeline/useObstreeData';
import styles from '../new-timeline/new-timeline.scss';
import { useConfig } from '@openmrs/esm-framework';

export interface ConfigObject {
  title: string;
  resultsName: string;
  data: Array<{
    concept: string;
    label: string;
    color: string;
  }>;
  table: {
    pageSize: number;
  };
}

interface obsShape {
  [key: string]: any;
}

const HIVCareAndTreatment = () => {
  const config = useConfig();
  const conceptUuids = config.concepts.map((c) => c.conceptUuid);
  // const { data: root, error, loading }: obsShape = useGetObstreeData(conceptUuids[0]);
  const { roots, loading, errors } = useGetManyObstreeData(conceptUuids);

  const [view, setView] = useState<string>('split');

  const expanded = view === 'full';

  if (loading) {
    return <InlineLoading />;
  }
  if (errors.length) {
    return <ErrorState error={errors[0]} headerTitle="Data Load Error" />;
  }
  if (!loading && !errors.length && roots?.length) {
    return (
      <FilterProvider roots={roots}>
        <div style={{ padding: 0 }}>
          <Row className={styles['results-header']}>
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
          <Row style={{ height: '100%' }}>
            <Column sm={16} lg={expanded ? 0 : 6} className={styles['column-panel']}>
              <FilterSet />
            </Column>
            <Column sm={16} lg={expanded ? 12 : 6} className={styles['column-panel']}>
              <NewTimeline />
            </Column>
          </Row>
        </div>
      </FilterProvider>
    );
  }
  return null;
};

export default HIVCareAndTreatment;
