import React, { useState } from 'react';
import { Column, ContentSwitcher, Grid, InlineLoading, Row, Switch } from 'carbon-components-react';
import FilterSet, { FilterProvider } from '../filter';
import GroupedTimeline, { useGetManyObstreeData } from '../grouped-timeline';
import { ErrorState } from '@openmrs/esm-patient-common-lib';
import { navigate, useConfig, useLayoutType } from '@openmrs/esm-framework';
import DesktopView from '../desktop-view/desktop-view.component';
import styles from './results-viewer.styles.scss';
import { useTranslation } from 'react-i18next';
import { Route } from 'react-router-dom';
import { testResultsBasePath } from '../helpers';
import Trendline from '../trendline-new/trendline.component';

type viewOpts = 'split' | 'full';
type panelOpts = 'tree' | 'panel';

interface ResultsViewerProps {
  basePath: string;
  type: string;
  panelUuid: string;
  testUuid: string;
  patientUuid: string;
}

const ResultsViewer: React.FC<ResultsViewerProps> = ({ basePath, type, testUuid }) => {
  const config = useConfig();
  const conceptUuids = config?.concepts?.map((c) => c.conceptUuid) ?? [];
  const { t } = useTranslation();
  const tablet = useLayoutType() === 'tablet';
  const { roots, loading, errors } = useGetManyObstreeData(conceptUuids);

  const [view, setView] = useState<viewOpts>('split');
  const [leftContent, setLeftContent] = useState<panelOpts>('tree');

  const expanded = view === 'full';
  const openTimeline = React.useCallback(() => navigate({ to: testResultsBasePath(basePath) }), [basePath, navigate]);

  if (loading) {
    return <InlineLoading />;
  }
  if (errors.length) {
    return <ErrorState error={errors[0]} headerTitle={t('dataLoadError', 'Data Load Error')} />;
  }
  if (!loading && !errors.length && roots?.length) {
    return (
      <FilterProvider roots={roots} testUuid={testUuid} type={type} basePath={basePath}>
        <Grid className={styles.resultsContainer}>
          <Row className={styles.resultsHeader}>
            <Column sm={12} lg={expanded || tablet ? 0 : 6}>
              <div style={{ display: 'flex' }}>
                <h4 style={{ flexGrow: 1 }}>{t('results', 'Results')}</h4>
                <div style={{ minWidth: '10rem' }}>
                  <ContentSwitcher selectedIndex={1} onChange={(e) => setLeftContent(e.name as panelOpts)}>
                    <Switch name="panel" text={t('panel', 'Panel')} />
                    <Switch name="tree" text={t('tree', 'Tree')} />
                  </ContentSwitcher>
                </div>
              </div>
            </Column>
            <Column sm={12} lg={expanded || tablet ? 12 : 6}>
              <div
                className={styles.viewOptsContentSwitcherContainer}
                style={{ display: 'flex', justifyContent: 'flex-end' }}
              >
                <ContentSwitcher style={{ maxWidth: '10rem' }} onChange={(e) => setView(e.name as viewOpts)}>
                  <Switch name="split" text={t('split', 'Split')} />
                  <Switch name="full" text={t('full', 'Full')} />
                </ContentSwitcher>
              </div>
            </Column>
          </Row>
          <Row style={{ height: '100%' }}>
            <Column sm={16} lg={expanded ? 0 : 6} className={styles.columnPanel}>
              {leftContent === 'tree' && <FilterSet />}
              {leftContent === 'panel' && <DesktopView />}
            </Column>
            <Column sm={16} lg={expanded ? 12 : 6} className={styles.columnPanel}>
              {testUuid && type === 'trendline' ? <Trendline /> : <GroupedTimeline />}
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
