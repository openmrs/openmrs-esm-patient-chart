import { Column, ContentSwitcher, Grid, InlineLoading, Row, Switch } from 'carbon-components-react';
import React, { useState } from 'react';
import FilterSet from '../filter/filter-set';
import { FilterProvider } from '../filter/filter-context';
import NewTimeline from '../grouped-timeline/grouped-timeline';
import { ErrorState } from '@openmrs/esm-patient-common-lib';
import { useGetManyObstreeData } from '../grouped-timeline/useObstreeData';
import { styles } from '../grouped-timeline';
import { useConfig, useLayoutType } from '@openmrs/esm-framework';
import DesktopView from '../desktop-view/desktop-view.component';

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

type viewOpts = 'split' | 'full';
type panelOpts = 'tree' | 'panel';

const ResultsViewer = () => {
  const config = useConfig();
  const conceptUuids = config.concepts.map((c) => c.conceptUuid);
  const isTablet = useLayoutType() === 'tablet';
  const { roots, loading, errors } = useGetManyObstreeData(conceptUuids);

  const [view, setView] = useState<viewOpts>('split');
  const [leftContent, setLeftContent] = useState<panelOpts>('tree');

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
        <Grid
          style={{
            padding: 0,
            width: isTablet ? 'calc(100vw - 48px - 2.6rem)' : 'calc(100vw - 16rem - 48px - 2.6rem)',
          }}
        >
          <Row className={styles['results-header']}>
            <Column sm={16} lg={expanded ? 0 : 6}>
              <div style={{ display: 'flex' }}>
                <h4 style={{ flexGrow: 1 }}>Results</h4>
                <div style={{ minWidth: '10rem' }}>
                  <ContentSwitcher selectedIndex={1} onChange={(e) => setLeftContent(e.name as panelOpts)}>
                    <Switch name="panel" text="Panel" />
                    <Switch name="tree" text="Tree" />
                  </ContentSwitcher>
                </div>
              </div>
            </Column>
            <Column sm={16} lg={expanded ? 12 : 6} style={{ border: expanded ? null : '0 0 0 1px solid gray' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <ContentSwitcher style={{ maxWidth: '10rem' }} onChange={(e) => setView(e.name as viewOpts)}>
                  <Switch name="split" text="Split" />
                  <Switch name="full" text="Full" />
                </ContentSwitcher>
              </div>
            </Column>
          </Row>
          <Row style={{ height: '100%' }}>
            <Column sm={16} lg={expanded ? 0 : 6} className={styles['column-panel']}>
              {leftContent === 'tree' && <FilterSet />}
              {leftContent === 'panel' && <DesktopView />}
            </Column>
            <Column sm={16} lg={expanded ? 12 : 6} className={styles['column-panel']}>
              <NewTimeline />
            </Column>
          </Row>
        </Grid>
      </FilterProvider>
    );
  }
  return null;
};

export default ResultsViewer;
export { ResultsViewer };
