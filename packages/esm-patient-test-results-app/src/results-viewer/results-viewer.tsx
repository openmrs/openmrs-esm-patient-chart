import React, { useCallback, useContext, useEffect, useState } from 'react';
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
  const [showTreeOverlay, setShowTreeOverlay] = useState<boolean>(false);
  const [selectedSection, setSelectedSection] = useState<panelOpts>('tree');
  const { totalResultsCount } = useContext(FilterContext);
  const expanded = view === 'full';
  const { type, testUuid } = useParams();
  const trendlineView = testUuid && type === 'trendline';

  const navigateBackFromTrendlineView = useCallback(() => {
    navigate({
      to: testResultsBasePath(`/patient/${patientUuid}/chart`),
    });
  }, [patientUuid]);

  if (tablet) {
    return (
      <div className={styles.resultsContainer}>
        <div className={styles.resultsHeader}>
          <div className={styles.leftHeader}>
            <h4 style={{ flexGrow: 1 }}>{`${t('results', 'Results')} ${
              totalResultsCount ? `(${totalResultsCount})` : ''
            }`}</h4>
            <div className={styles.leftHeaderActions}>
              <ContentSwitcher
                selectedIndex={['panel', 'tree'].indexOf(selectedSection)}
                onChange={(e) => setSelectedSection(e.name as panelOpts)}
              >
                <Switch name="panel" text={t('panel', 'Panel')} />
                <Switch name="tree" text={t('tree', 'Tree')} />
              </ContentSwitcher>
            </div>
          </div>
        </div>
        {selectedSection === 'tree' ? (
          <TreeViewWrapper
            patientUuid={patientUuid}
            basePath={basePath}
            type={type}
            expanded={expanded}
            testUuid={testUuid}
          />
        ) : selectedSection === 'panel' ? (
          <PanelView
            expanded={expanded}
            patientUuid={patientUuid}
            basePath={basePath}
            type={type}
            testUuid={testUuid}
          />
        ) : null}
        {trendlineView && (
          <TabletOverlay
            headerText={t('trendline', 'Trendline')}
            close={navigateBackFromTrendlineView}
            buttonsGroup={<></>}
          >
            <Trendline patientUuid={patientUuid} conceptUuid={testUuid} basePath={basePath} />
          </TabletOverlay>
        )}
      </div>
    );
  }

  return (
    <Grid className={styles.resultsContainer}>
      <Column className={styles.resultsHeader} sm={12} lg={!tablet ? 5 : 12}>
        <div className={styles.leftHeader}>
          <h4 style={{ flexGrow: 1 }}>{`${t('results', 'Results')} ${
            totalResultsCount ? `(${totalResultsCount})` : ''
          }`}</h4>
          <div className={styles.leftHeaderActions}>
            {!expanded && (
              <ContentSwitcher
                size={tablet ? 'lg' : 'md'}
                selectedIndex={['panel', 'tree'].indexOf(selectedSection)}
                onChange={(e) => setSelectedSection(e.name as panelOpts)}
              >
                <Switch name="panel" text={t('panel', 'Panel')} />
                <Switch name="tree" text={t('tree', 'Tree')} />
              </ContentSwitcher>
            )}
          </div>
        </div>
      </Column>
      <Column className={styles.resultsHeader} sm={12} lg={!tablet ? 7 : 0}>
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
      {selectedSection === 'tree' ? (
        <TreeViewWrapper
          patientUuid={patientUuid}
          basePath={basePath}
          type={type}
          expanded={expanded}
          testUuid={testUuid}
        />
      ) : selectedSection === 'panel' ? (
        <PanelView expanded={expanded} patientUuid={patientUuid} basePath={basePath} type={type} testUuid={testUuid} />
      ) : null}
    </Grid>
  );
};

export default RoutedResultsViewer;
