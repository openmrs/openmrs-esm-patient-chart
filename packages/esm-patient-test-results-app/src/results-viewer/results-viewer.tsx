import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AccordionSkeleton, Button, Column, ContentSwitcher, DataTableSkeleton, Grid, Switch } from '@carbon/react';
import { TreeViewAlt } from '@carbon/react/icons';
import { EmptyState, ErrorState } from '@openmrs/esm-patient-common-lib';
import { isDesktop, navigate, useConfig, useLayoutType } from '@openmrs/esm-framework';
import { testResultsBasePath } from '../helpers';
import FilterSet, { FilterContext, FilterProvider } from '../filter';
import GroupedTimeline, { useGetManyObstreeData } from '../grouped-timeline';
import TabletOverlay from '../tablet-overlay';
import Trendline from '../trendline/trendline.component';
import styles from './results-viewer.styles.scss';
import { useParams } from 'react-router-dom';
import PanelView from '../panel-view';
import TreeViewWrapper from '../tree-view';

type viewOpts = 'split' | 'full';
type panelOpts = 'tree' | 'panel';

interface ResultsViewerProps {
  basePath: string;
  patientUuid?: string;
  loading?: boolean;
}

const RoutedResultsViewer: React.FC<ResultsViewerProps> = ({ basePath, patientUuid }) => {
  const config = useConfig();
  const conceptUuids = config?.concepts?.map((c) => c.conceptUuid) ?? [];
  const { roots, loading, error } = useGetManyObstreeData(conceptUuids);
  const { t } = useTranslation();

  if (error) {
    return <ErrorState error={error} headerTitle={t('dataLoadError', 'Data Load Error')} />;
  }

  if (roots?.length) {
    return (
      <FilterProvider roots={!loading ? roots : []}>
        <ResultsViewer patientUuid={patientUuid} basePath={basePath} loading={loading} />
      </FilterProvider>
    );
  }

  return (
    <EmptyState
      headerTitle={t('testResults', 'Test Results')}
      displayText={t('testResultsData', 'Test results data')}
    />
  );
};

const ResultsViewer: React.FC<ResultsViewerProps> = ({ patientUuid, basePath, loading }) => {
  const { t } = useTranslation();
  const tablet = useLayoutType() === 'tablet';
  const [view, setView] = useState<viewOpts>('split');
  const [leftContent, setLeftContent] = useState<panelOpts>('tree');
  const [showTreeOverlay, setShowTreeOverlay] = useState<boolean>(false);
  const { resetTree, timelineData, totalResultsCount } = useContext(FilterContext);
  const expanded = view === 'full';
  const { type, testUuid } = useParams();

  return (
    <>
      <Grid className={styles.resultsContainer}>
        <Column className={styles.resultsHeader} sm={12} lg={!tablet ? 5 : 12}>
          <div className={styles.leftHeader}>
            <h4 style={{ flexGrow: 1 }}>{`${t('results', 'Results')} ${
              totalResultsCount ? `(${totalResultsCount})` : ''
            }`}</h4>
            <div className={styles.leftHeaderActions}>
              {tablet && (
                <Button
                  size={tablet ? 'md' : 'sm'}
                  kind="ghost"
                  renderIcon={(props) => <TreeViewAlt {...props} size={16} />}
                  onClick={() => setShowTreeOverlay(true)}
                  style={{
                    marginRight: '1rem',
                  }}
                >
                  {t('showTreeButtonText', 'Show tree')}
                </Button>
              )}
              {!expanded && (
                <ContentSwitcher
                  size={tablet ? 'lg' : 'md'}
                  selectedIndex={['panel', 'tree'].indexOf(leftContent)}
                  onChange={(e) => setLeftContent(e.name as panelOpts)}
                >
                  <Switch name="panel" text={t('panel', 'Panel')} />
                  <Switch name="tree" text={t('tree', 'Tree')} />
                </ContentSwitcher>
              )}
            </div>
          </div>
        </Column>
        {!tablet && (
          <Column className={styles.resultsHeader} sm={12} lg={7}>
            <div
              className={styles.viewOptsContentSwitcherContainer}
              style={{ display: 'flex', justifyContent: 'flex-end' }}
            >
              <ContentSwitcher
                size={tablet ? 'lg' : 'md'}
                style={{ maxWidth: '10rem' }}
                onChange={(e) => setView(e.name as viewOpts)}
                selectedIndex={expanded ? 1 : 0}
              >
                <Switch name="split" text={t('split', 'Split')} disabled={loading} />
                <Switch name="full" text={t('full', 'Full')} disabled={loading} />
              </ContentSwitcher>
            </div>
          </Column>
        )}
        {leftContent === 'tree' ? (
          <TreeViewWrapper
            patientUuid={patientUuid}
            basePath={basePath}
            type={type}
            expanded={expanded}
            testUuid={testUuid}
          />
        ) : (
          <PanelView expanded={expanded} />
        )}
      </Grid>

      {tablet && showTreeOverlay && (
        <TabletOverlay
          headerText={t('tree', 'Tree')}
          close={() => setShowTreeOverlay(false)}
          buttonsGroup={
            <>
              <Button kind="secondary" size="lg" onClick={resetTree} disabled={loading}>
                {t('resetTreeText', 'Reset tree')}
              </Button>
              <Button kind="primary" size="lg" onClick={() => setShowTreeOverlay(false)} disabled={loading}>
                {`${t('view', 'View')} ${
                  !loading && timelineData?.loaded ? timelineData?.data?.rowData?.length : ''
                } ${t('resultsText', 'results')}`}
              </Button>
            </>
          }
        >
          {!loading ? <FilterSet hideFilterSetHeader /> : <AccordionSkeleton open count={4} align="start" />}
        </TabletOverlay>
      )}
      {tablet && testUuid && type === 'trendline' && (
        <TabletOverlay
          headerText={t('trendline', 'Trendline')}
          close={() => navigate({ to: testResultsBasePath(basePath) })}
          buttonsGroup={<></>}
        >
          <Trendline patientUuid={patientUuid} conceptUuid={testUuid} basePath={basePath} />
        </TabletOverlay>
      )}
    </>
  );
};

export default RoutedResultsViewer;
