import React, { useContext, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { type TFunction, useTranslation } from 'react-i18next';
import { ContentSwitcher, Switch, Button } from '@carbon/react';
import { EmptyState, ErrorState } from '@openmrs/esm-patient-common-lib';
import { RenewIcon, useConfig, useLayoutType } from '@openmrs/esm-framework';
import { type ConfigObject } from '../../config-schema';
import { type viewOpts } from '../../types';
import { FilterContext, FilterProvider } from '../filter';
import { useGetManyObstreeData } from '../grouped-timeline';
import IndividualResultsTableTablet from '../individual-results-table-tablet/individual-results-table-tablet.component';
import TreeView from '../tree-view/tree-view.component';
import styles from './results-viewer.scss';
import { type Roots } from '../filter/filter-context';

type panelOpts = 'tree' | 'panel';

interface RefreshDataButtonProps {
  isTablet: boolean;
  t: TFunction;
}

interface ResultsViewerProps {
  basePath: string;
  patientUuid?: string;
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
      <FilterProvider roots={!isLoading ? (roots as Roots) : []} isLoading={isLoading}>
        <ResultsViewer patientUuid={patientUuid} basePath={basePath} />
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

const ResultsViewer: React.FC<ResultsViewerProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const [view, setView] = useState<viewOpts>('individual-test');
  const [selectedSection, setSelectedSection] = useState<panelOpts>('tree');
  const { totalResultsCount, resetTree, isLoading } = useContext(FilterContext);
  const isExpanded = view === 'full';
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

  if (isTablet) {
    return (
      <div className={styles.resultsContainer}>
        <div ref={headerRef} className={styles.headerSentinel} />
        <div className={classNames(styles.resultsHeader, { [styles.resultsHeaderScrolled]: !isHeaderVisible })}>
          <h4 style={{ flexGrow: 1 }}>{`${t('results', 'Results')} ${
            totalResultsCount ? `(${totalResultsCount})` : ''
          }`}</h4>
          <div className={styles.leftHeaderActions}>
            <RefreshDataButton isTablet={isTablet} t={t} />
            <span className={styles.contentSwitcherLabel}>{t('view', 'View')}: </span>
            <ContentSwitcher
              selectedIndex={['panel', 'tree'].indexOf(selectedSection)}
              onChange={({ name }: { name: panelOpts }) => setSelectedSection(name)}
              size={responsiveSize}
            >
              <Switch name="panel" text={t('individualTests', 'Individual tests')} />
              <Switch name="tree" text={t('overTime', 'Over time')} />
            </ContentSwitcher>
          </div>
        </div>
        {selectedSection === 'tree' ? (
          <TreeView patientUuid={patientUuid} expanded={isExpanded} view={view} />
        ) : selectedSection === 'panel' ? (
          <IndividualResultsTableTablet expanded={isExpanded} patientUuid={patientUuid} />
        ) : null}
      </div>
    );
  }

  return (
    <div className={styles.resultsContainer}>
      <div className={styles.headerSentinel} ref={headerRef} />
      <div className={classNames(styles.resultsHeader, { [styles.resultsHeaderScrolled]: !isHeaderVisible })}>
        <div className={classNames(styles.leftSection, styles.leftHeaderSection)}>
          <h4>{t('tests', 'Tests')}</h4>
          <Button className={styles.button} kind="ghost" onClick={resetTree} size={isTablet ? 'md' : 'sm'}>
            <span>{t('reset', 'Reset')}</span>
          </Button>
        </div>
        <div className={styles.rightSectionHeader}>
          <div className={styles.viewOptsContentSwitcherContainer}>
            <h4 className={styles.viewOptionsText}>{`${t('results', 'Results')} ${
              totalResultsCount ? `(${totalResultsCount})` : ''
            }`}</h4>
            <div className={styles.buttonsContainer}>
              <RefreshDataButton isTablet={isTablet} t={t} />
              <span className={styles.contentSwitcherLabel}>{t('view', 'View')}: </span>
              <ContentSwitcher
                className={styles.viewOptionsSwitcher}
                onChange={({ name }: { name: viewOpts }) => setView(name)}
                selectedIndex={isExpanded ? 1 : 0}
                size={responsiveSize}
              >
                <Switch name="individual-test" text={t('individualTests', 'Individual tests')} disabled={isLoading} />
                <Switch name="over-time" text={t('overTime', 'Over time')} disabled={isLoading} />
              </ContentSwitcher>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.flex}>
        <TreeView patientUuid={patientUuid} expanded={false} view={view} />
      </div>
    </div>
  );
};

function RefreshDataButton({ isTablet, t }: RefreshDataButtonProps) {
  return (
    <Button
      className={styles.button}
      kind="ghost"
      onClick={() => window.location.reload()}
      renderIcon={RenewIcon}
      size={isTablet ? 'md' : 'sm'}
    >
      <span>{t('refreshData', 'Refresh data')}</span>
    </Button>
  );
}

export default RoutedResultsViewer;
