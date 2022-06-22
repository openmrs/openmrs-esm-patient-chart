import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  AccordionSkeleton,
  Button,
  Column,
  ContentSwitcher,
  DataTableSkeleton,
  Grid,
  Row,
  Switch,
} from 'carbon-components-react';
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
import { TreeViewAlt16 } from '@carbon/icons-react';

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
  const { roots, loading, errors } = useGetManyObstreeData(conceptUuids);
  const { t } = useTranslation();

  if (errors.length) {
    return <ErrorState error={errors[0]} headerTitle={t('dataLoadError', 'Data Load Error')} />;
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
  const [adjustWidth, setAdjustWidth] = useState<number>(5);
  const shiftLeft = useRef(null);

  const mouseDownHandler = (event) => {
    const draggableEl = shiftLeft.current;
    const rightPanel: HTMLElement = document.querySelector('.rightColumnPanel');
    const wrappingRow: HTMLElement = document.querySelector('.wrapper-row');

    const wrappingRowWidth = window.getComputedStyle(wrappingRow).width;

    rightPanel.style.borderLeft = '1px solid gray';
    wrappingRow.style.pointerEvents = 'none';
    document.body.style.cursor = 'col-resize';

    let fullWidth: number = parseFloat(wrappingRowWidth);

    let prevX = event.clientX;
    document.addEventListener('mousemove', mousemoveHandler);
    document.addEventListener('mouseup', mouseupHandler);

    function mousemoveHandler(ev) {
      let newX = prevX - ev.clientX;
      let dragStyles = window.getComputedStyle(draggableEl);
      let currentLeft = parseInt(dragStyles.left, 10);

      draggableEl.style.left = currentLeft - newX + 'px';

      let colAdjust = parseInt(((12 / fullWidth) * (currentLeft - newX)).toFixed(0));
      if (colAdjust > 2 && colAdjust < 9) setAdjustWidth(colAdjust);
      prevX = ev.clientX;
    }

    function mouseupHandler() {
      draggableEl.style.left = '100%';
      rightPanel.style.borderLeft = 'none';
      wrappingRow.style.pointerEvents = 'auto';
      document.body.style.cursor = 'default';
      document.removeEventListener('mousemove', mousemoveHandler);
      document.removeEventListener('mouseup', mouseupHandler);
    }
  };

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
                    renderIcon={TreeViewAlt16}
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
        <Row className={`${styles.resultsViewer} wrapper-row`}>
          {!tablet && (
            <Column
              sm={16}
              lg={tablet || expanded ? 0 : adjustWidth}
              className={`${styles.columnPanel} ${styles.treeColumn} leftColumnPanel`}
            >
              {leftContent === 'tree' &&
                (!loading ? (
                  <>
                    <FilterSet />
                    <div
                      className={styles.dragHandler}
                      ref={shiftLeft}
                      role="button"
                      tabIndex={0}
                      onMouseDown={mouseDownHandler}
                    ></div>
                  </>
                ) : (
                  <AccordionSkeleton open count={4} align="start" />
                ))}
              {leftContent === 'panel' && <DesktopView />}
            </Column>
          )}
          <Column
            sm={16}
            lg={tablet || expanded ? 12 : 12 - adjustWidth}
            className={`${styles.columnPanel} ${styles.rightColumnPanel} rightColumnPanel`}
          >
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
