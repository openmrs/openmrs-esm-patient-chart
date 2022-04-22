import React, { useContext, useState } from 'react';
import {
  AccordionSkeleton,
  Button,
  Column,
  ContentSwitcher,
  DataTableSkeleton,
  Grid,
  InlineLoading,
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
import Trendline from '../trendline-new/trendline.component';
import TabletOverlay from '../tablet-overlay';
import { TreeViewAlt16 } from '@carbon/icons-react';

type viewOpts = 'split' | 'full';
type panelOpts = 'tree' | 'panel';

interface ResultsViewerProps {
  basePath: string;
  type: string;
  testUuid: string;
  patientUuid?: string;
}

const RoutedResultsViewer: React.FC<ResultsViewerProps> = ({ type, basePath, testUuid, patientUuid }) => {
  const config = useConfig();
  const conceptUuids = config?.concepts?.map((c) => c.conceptUuid) ?? [];
  const { roots, loading, errors } = useGetManyObstreeData(conceptUuids);
  const { t } = useTranslation();

  if (loading) {
    return <LoadingResultsViewer patientUuid={patientUuid} testUuid={testUuid} type={type} basePath={basePath} />;
  }

  if (errors.length) {
    return <ErrorState error={errors[0]} headerTitle={t('dataLoadError', 'Data Load Error')} />;
  }

  if (!loading && !errors.length && roots?.length) {
    return (
      <FilterProvider roots={roots} testUuid={testUuid} type={type} basePath={basePath}>
        <ResultsViewer patientUuid={patientUuid} testUuid={testUuid} type={type} basePath={basePath} />
      </FilterProvider>
    );
  }
  return null;
};

const ResultsViewer: React.FC<ResultsViewerProps> = ({ patientUuid, basePath, type, testUuid }) => {
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
                    <Switch name="panel" text={t('panel', 'Panel')} />
                    <Switch name="tree" text={t('tree', 'Tree')} />
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
                  <Switch name="split" text={t('split', 'Split')} />
                  <Switch name="full" text={t('full', 'Full')} />
                </ContentSwitcher>
              </div>
            </Column>
          )}
        </Row>
        <Row className={styles.resultsViewer}>
          {!tablet && (
            <Column sm={16} lg={tablet || expanded ? 0 : 5} className={`${styles.columnPanel} ${styles.treeColumn}`}>
              {leftContent === 'tree' && <FilterSet />}
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
            ) : (
              <GroupedTimeline />
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
              <Button kind="secondary" size="lg" onClick={resetTree}>
                {t('resetTreeText', 'Reset tree')}
              </Button>
              <Button kind="primary" size="lg" onClick={() => setShowTreeOverlay(false)}>
                {`${t('view', 'View')} ${timelineData?.loaded ? timelineData?.data?.rowData?.length : ''} ${t(
                  'resultsText',
                  'results',
                )}`}
              </Button>
            </>
          }
        >
          <FilterSet hideFilterSetHeader />
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

const LoadingResultsViewer: React.FC<ResultsViewerProps> = ({ patientUuid, basePath, type, testUuid }) => {
  const { t } = useTranslation();
  const tablet = useLayoutType() === 'tablet';
  const [view, setView] = useState<viewOpts>('split');
  const [leftContent, setLeftContent] = useState<panelOpts>('tree');
  const [showTreeOverlay, setShowTreeOverlay] = useState<boolean>(false);
  const expanded = view === 'full';

  return (
    <>
      <Grid className={styles.resultsContainer}>
        <Row className={styles.resultsHeader}>
          <Column sm={12} lg={!tablet ? 5 : 12}>
            <div className={styles.leftHeader}>
              <h4 style={{ flexGrow: 1 }}>{t('results', 'Results')}</h4>
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
                    <Switch name="panel" text={t('panel', 'Panel')} />
                    <Switch name="tree" text={t('tree', 'Tree')} />
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
                  <Switch name="split" text={t('split', 'Split')} />
                  <Switch name="full" text={t('full', 'Full')} />
                </ContentSwitcher>
              </div>
            </Column>
          )}
        </Row>
        <Row className={styles.resultsViewer}>
          {!tablet && (
            <Column sm={16} lg={tablet || expanded ? 0 : 5} className={`${styles.columnPanel} ${styles.treeColumn}`}>
              {leftContent === 'tree' && <AccordionSkeleton open count={4} align="start" />}
              {leftContent === 'panel' && <DataTableSkeleton />}
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
              <Button kind="secondary" size="lg" disabled>
                {t('resetTreeText', 'Reset tree')}
              </Button>
              <Button kind="primary" size="lg" disabled>
                {`${t('view', 'View')} ${t('resultsText', 'results')}`}
              </Button>
            </>
          }
        >
          <AccordionSkeleton open count={4} align="start" />
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
export { ResultsViewer };
