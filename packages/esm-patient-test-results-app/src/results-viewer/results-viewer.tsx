import React, { useContext, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AccordionSkeleton, Button, ContentSwitcher, Column, DataTableSkeleton, Grid, Switch } from '@carbon/react';
import { TreeViewAlt } from '@carbon/react/icons';
import { EmptyState, ErrorState } from '@openmrs/esm-patient-common-lib';
import { navigate, useConfig, useLayoutType } from '@openmrs/esm-framework';
import { testResultsBasePath } from '../helpers';
import FilterSet, { FilterContext, FilterProvider } from '../filter';
import GroupedTimeline, { useGetManyObstreeData } from '../grouped-timeline';
import DesktopView from '../desktop-view/desktop-view.component';
import TabletOverlay from '../tablet-overlay';
import Trendline from '../trendline/trendline.component';
import styles from './results-viewer.styles.scss';

type viewOpts = 'split' | 'full';
type panelOpts = 'tree' | 'panel';

interface ResultsViewerProps {
  basePath: string;
  type?: string;
  testUuid?: string;
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

  return (
    <EmptyState
      headerTitle={t('testResults', 'Test Results')}
      displayText={t('testResultsData', 'Test results data')}
    />
  );
};

const ResultsViewer: React.FC<ResultsViewerProps> = ({ patientUuid, basePath, type, testUuid, loading }) => {
  const { t } = useTranslation();
  const tablet = useLayoutType() === 'tablet';
  const [view, setView] = useState<viewOpts>('split');
  const [leftContent, setLeftContent] = useState<panelOpts>('tree');
  const [showTreeOverlay, setShowTreeOverlay] = useState<boolean>(false);
  const { resetTree, timelineData, totalResultsCount } = useContext(FilterContext);
  const expanded = view === 'full';

  const left = useRef(null);
  const right = useRef(null);
  const div = useRef(null);
  let md = null;

  const onMouseMove = (e) => {
    const dx = e.clientX - md.e.clientX;
    left.current.style.width = md.leftWidth + dx + 'px';
    right.current.style.width = md.rightWidth - dx + 'px';
  };

  const onMouseDown = (e) => {
    md = {
      e: e,
      leftWidth: left.current?.offsetWidth,
      rightWidth: right.current?.offsetWidth,
    };

    document.onmousemove = (e) => onMouseMove(e);
    document.onmouseup = () => {
      document.onmousemove = document.onmouseup = md = null;
    };
  };

  return (
    <>
      <div className={styles.resultsContainer}>
        <div className={styles.Left + ' ' + styles.col} ref={left}>
          <div className={styles.resultsHeader}>
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
          </div>
          <div className={`${styles.columnPanel} ${styles.treeColumn}`}>
            {leftContent === 'tree' && (!loading ? <FilterSet /> : <AccordionSkeleton open count={4} align="start" />)}
            {leftContent === 'panel' && <DesktopView />}
          </div>
        </div>
        <div className={styles.dragHandler} ref={div} tabIndex={0} onMouseDown={onMouseDown}></div>
        <div className={styles.Right + ' ' + styles.col} ref={right}>
          {!tablet && (
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
          )}
          <div className={`${styles.columnPanel}`}>
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
          </div>
        </div>
      </div>
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
