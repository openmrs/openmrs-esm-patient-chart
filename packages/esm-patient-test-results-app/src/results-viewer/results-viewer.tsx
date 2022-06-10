import React, { useContext, useState } from 'react';
import {
  AccordionSkeleton,
  Button,
  Column,
  ContentSwitcher,
  DataTableSkeleton,
  Grid,
  Row,
  Switch,
} from '@carbon/react';
import { TreeViewAlt } from '@carbon/react/icons';
import FilterSet, { FilterContext, FilterProvider } from '../filter';
import GroupedTimeline, { useGetManyObstreeData } from '../grouped-timeline';
import { ErrorState } from '@openmrs/esm-patient-common-lib';
import { navigate, useConfig, useLayoutType } from '@openmrs/esm-framework';
import DesktopView from '../desktop-view/desktop-view.component';
import styles from './results-viewer.styles.scss';
import { useTranslation } from 'react-i18next';
import { testResultsBasePath } from '../helpers';
import Trendline from '../trendline/trendline.component';
import TabletOverlay from '../tablet-overlay';

type viewOpts = 'split' | 'full';
type panelOpts = 'tree' | 'panel';

interface ResultsViewerProps {
  basePath: string;
  type: string;
  testUuid: string;
  patientUuid?: string;
  loading?: boolean;
}

const RoutedResultsViewer: React.FC<ResultsViewerProps> = ({ type, basePath, testUuid, patientUuid }) => {
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
        <ResultsViewer
          patientUuid={patientUuid}
          testUuid={testUuid}
          type={type}
          basePath={basePath}
          loading={loading}
        />
      </FilterProvider>
    );
  }
  return null;
};

const ResultsViewer: React.FC<ResultsViewerProps> = ({ patientUuid, basePath, type, testUuid, loading }) => {
  const { t } = useTranslation();
  const tablet = useLayoutType() === 'tablet';
  const [view, setView] = useState<viewOpts>('split');
  const [leftContent, setLeftContent] = useState<panelOpts>('tree');
  const [showTreeOverlay, setShowTreeOverlay] = useState<boolean>(false);
  const { resetTree, timelineData, totalResultsCount } = useContext(FilterContext);
  const expanded = view === 'full';

  return (
    <>
      <Grid className={styles.resultsContainer}>
        <Row className={styles.resultsHeader}>
          <Column sm={12} lg={!tablet ? 5 : 12}>
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
                    selectedIndex={1}
                    onChange={(e) => setLeftContent(e.name as panelOpts)}
                  >
                    <Switch name="panel" text={t('panel', 'Panel')} disabled={loading} />
                    <Switch name="tree" text={t('tree', 'Tree')} disabled={loading} />
                  </ContentSwitcher>
                )}
              </div>
            </div>
          </Column>
          {!tablet && (
            <Column sm={12} lg={7}>
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
        </Row>
        <Row className={styles.resultsViewer}>
          {!tablet && (
            <Column sm={16} lg={tablet || expanded ? 0 : 5} className={`${styles.columnPanel} ${styles.treeColumn}`}>
              {leftContent === 'tree' &&
                (!loading ? <FilterSet /> : <AccordionSkeleton open count={4} align="start" />)}
              {leftContent === 'panel' && <DesktopView />}
            </Column>
          )}
          <Column sm={16} lg={tablet || expanded ? 12 : 7} className={`${styles.columnPanel}`}>
            {!tablet && testUuid && type === 'trendline' ? (
              <Trendline
                patientUuid={patientUuid}
                conceptUuid={testUuid}
                basePath={basePath}
                showBackToTimelineButton
              />
            ) : !loading ? (
              <GroupedTimeline />
            ) : (
              <DataTableSkeleton />
            )}
          </Column>
        </Row>
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
