import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { type TFunction, useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { ContentSwitcher, Switch, Button } from '@carbon/react';
import { EmptyState, ErrorState } from '@openmrs/esm-patient-common-lib';
import { navigate, useConfig, useLayoutType } from '@openmrs/esm-framework';
import { type ConfigObject } from '../../config-schema';
import { type viewOpts } from '../../types';
import { FilterContext, FilterProvider } from '../filter';
import { useGetManyObstreeData } from '../grouped-timeline';
import { testResultsBasePath } from '../helpers';
import PanelView from '../panel-view/panel-view.component';
import TabletOverlay from '../tablet-overlay';
import TreeViewWrapper from '../tree-view/tree-view-wrapper.component';
import Trendline from '../trendline/trendline.component';
import styles from './results-viewer.scss';

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
  const { roots, isLoading, error } = useGetManyObstreeData(conceptUuids);

  if (error) {
    return <ErrorState error={error} headerTitle={t('dataLoadError', 'Data Load Error')} />;
  }

  if (roots?.length) {
    return (
      <FilterProvider roots={!isLoading ? roots : []}>
        <ResultsViewer patientUuid={patientUuid} basePath={basePath} loading={isLoading} />
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
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries) => {
      const [entry] = entries;
      setIsHeaderVisible(entry.isIntersecting);
    };

    const observerOptions: IntersectionObserverInit = {
      threshold: 1,
      rootMargin: '-1px 0px 0px 0px',
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    const currentHeader = headerRef.current;
    if (currentHeader) {
      observer.observe(currentHeader);
    }

    return () => {
      if (currentHeader) {
        observer.unobserve(currentHeader);
      }
      observer.disconnect();
    };
  }, []);

  const navigateBackFromTrendlineView = useCallback(() => {
    navigate({
      to: testResultsBasePath(`/patient/${patientUuid}/chart`),
    });
  }, [patientUuid]);

  if (isTablet) {
    return (
      <div className={styles.resultsContainer}>
        <div ref={headerRef} className={styles.headerSentinel} />
        <div className={classNames(styles.resultsHeader, { [styles.resultsHeaderScrolled]: !isHeaderVisible })}>
          <h4 style={{ flexGrow: 1 }}>{`${t('results', 'Results')} ${
            totalResultsCount ? `(${totalResultsCount})` : ''
          }`}</h4>
          <div className={styles.leftHeaderActions}>
            <p>{t('view', 'View')}: </p>
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
      <div ref={headerRef} className={styles.headerSentinel} />
      <div className={classNames(styles.resultsHeader, { [styles.resultsHeaderScrolled]: !isHeaderVisible })}>
        <div className={classNames(styles.leftSection, styles.leftHeaderSection)}>
          <h4>{t('tests', 'Tests')}</h4>
          <Button
            className={styles.button}
            kind="ghost"
            size={isTablet ? 'md' : 'sm'}
            onClick={resetTree} // TODO: Undo selections fix
          >
            <span>{t('reset', 'Reset')}</span>
          </Button>
        </div>
        <div className={styles.rightSectionHeader}>
          <div className={styles.viewOptsContentSwitcherContainer}>
            <h4 className={styles.viewOptionsText}>{`${t('results', 'Results')} ${
              totalResultsCount ? `(${totalResultsCount})` : ''
            }`}</h4>
            <p className={styles.viewOptionsSubHeading}>{t('view', 'View')}: </p>
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
