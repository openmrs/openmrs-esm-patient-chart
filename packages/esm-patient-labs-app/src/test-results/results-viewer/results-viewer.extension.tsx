import React, { useCallback, useContext, useState } from 'react';
import classNames from 'classnames';
import { type TFunction, useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { ContentSwitcher, Switch, Button } from '@carbon/react';
import { EmptyState, ErrorState } from '@openmrs/esm-patient-common-lib';
import { navigate, useConfig, useLayoutType } from '@openmrs/esm-framework';
import { FilterContext, FilterProvider } from '../filter';
import { useGetManyObstreeData } from '../grouped-timeline';
import { testResultsBasePath } from '../helpers';
import PanelView from '../panel-view/panel-view.component';
import TabletOverlay from '../tablet-overlay';
import TreeViewWrapper from '../tree-view/tree-view-wrapper.component';
import Trendline from '../trendline/trendline.component';
import type { ConfigObject } from '../../config-schema';
import styles from './results-viewer.scss';
import { type viewOpts } from '../../types';

type panelOpts = 'tree' | 'panel';

interface RefreshDataButtonProps {
  isTablet: boolean;
  t: TFunction;
}

interface ResultsViewerProps {
  basePath: string;
  patientUuid?: string;
  loading?: boolean;
}

const RoutedResultsViewer: React.FC<ResultsViewerProps> = ({ basePath, patientUuid }) => {
  const { t } = useTranslation();
  const config = useConfig<ConfigObject>();
  const conceptUuids = config.resultsViewerConcepts.map((concept) => concept.conceptUuid) ?? [];
  const { roots, loading, error } = useGetManyObstreeData(conceptUuids);

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
      headerTitle={t('testResults_title', 'Test Results')}
      displayText={t('testResultsData', 'Test results data')}
    />
  );
};

const ResultsViewer: React.FC<ResultsViewerProps> = ({ patientUuid, basePath, loading }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const [view, setView] = useState<viewOpts>('individual-test');
  const [selectedSection, setSelectedSection] = useState<panelOpts>('tree');
  const { totalResultsCount, resetTree } = useContext(FilterContext);
  const { type, testUuid } = useParams();
  const isExpanded = view === 'full';
  const trendlineView = testUuid && type === 'trendline';
  const responsiveSize = isTablet ? 'lg' : 'md';

  const navigateBackFromTrendlineView = useCallback(() => {
    navigate({
      to: testResultsBasePath(`/patient/${patientUuid}/chart`),
    });
  }, [patientUuid]);

  if (isTablet) {
    return (
      <div className={styles.resultsContainer}>
        <div className={styles.resultsHeader}>
          <h4 style={{ flexGrow: 1 }}>{`${t('results', 'Results')} ${
            totalResultsCount ? `(${totalResultsCount})` : ''
          }`}</h4>
          <div className={styles.leftHeaderActions}>
            <ContentSwitcher
              selectedIndex={['panel', 'tree'].indexOf(selectedSection)}
              onChange={({ name }: { name: panelOpts }) => setSelectedSection(name)}
            >
              <Switch name="panel" text={t('individualTests', 'Individual tests')} />
              <Switch name="tree" text={t('overTime', 'Over time')} />
            </ContentSwitcher>
          </div>
        </div>
        {selectedSection === 'tree' ? (
          <TreeViewWrapper
            patientUuid={patientUuid}
            basePath={basePath}
            type={type}
            expanded={isExpanded}
            testUuid={testUuid}
            view={view}
          />
        ) : selectedSection === 'panel' ? (
          <PanelView
            expanded={isExpanded}
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
    <div className={styles.resultsContainer}>
      <div className={styles.resultsHeader}>
        <div className={classNames(styles.leftSection, styles.leftHeaderSection)}>
          <h4>{t('tests', 'Tests')}</h4>
          <Button
            className={styles.button}
            kind="ghost"
            size={isTablet ? 'md' : 'sm'}
            onClick={resetTree} //TO-DO (undo selections fix)
          >
            <span>{t('reset', 'Reset')}</span>
          </Button>
        </div>
        <div className={styles.rightSectionHeader}>
          <div className={styles.viewOptsContentSwitcherContainer}>
            <h4 className={styles.viewOptionsText}>{`${t('results', 'Results')} ${
              totalResultsCount ? `(${totalResultsCount})` : ''
            }`}</h4>
            <ContentSwitcher
              className={styles.viewOptionsSwitcher}
              onChange={({ name }: { name: viewOpts }) => setView(name)}
              selectedIndex={isExpanded ? 1 : 0}
              size={responsiveSize}
            >
              <Switch name="individual-test" text={t('individualTests', 'Individual tests')} disabled={loading} />
              <Switch name="over-time" text={t('overTime', 'Over time')} disabled={loading} />
            </ContentSwitcher>
          </div>
        </div>
      </div>
      <div className={styles.flex}>
        <TreeViewWrapper
          patientUuid={patientUuid}
          basePath={basePath}
          type={type}
          expanded={false}
          testUuid={testUuid}
          view={view}
        />
      </div>
    </div>
  );
};

export default RoutedResultsViewer;
