import React, { useCallback, useContext, useState } from 'react';
import classNames from 'classnames';
import { type TFunction, useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { ContentSwitcher, Switch, Button } from '@carbon/react';
import { Printer, Renew } from '@carbon/react/icons';
import { EmptyState, ErrorState } from '@openmrs/esm-patient-common-lib';
import { navigate, showModal, useConfig, useLayoutType } from '@openmrs/esm-framework';
import { FilterContext, FilterProvider } from '../filter';
import { useGetManyObstreeData } from '../grouped-timeline';
import { testResultsBasePath } from '../helpers';
import PanelView from '../panel-view/panel-view.component';
import TabletOverlay from '../tablet-overlay';
import TreeViewWrapper from '../tree-view/tree-view-wrapper.component';
import Trendline from '../trendline/trendline.component';
import type { ConfigObject } from '../../config-schema';
import styles from './results-viewer.scss';

type panelOpts = 'tree' | 'panel';
type viewOpts = 'split' | 'full';

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
  const [view, setView] = useState<viewOpts>('split');
  const config = useConfig() as ConfigObject;
  const [selectedSection, setSelectedSection] = useState<panelOpts>('tree');
  const { totalResultsCount } = useContext(FilterContext);
  const { type, testUuid } = useParams();
  const isExpanded = view === 'full';
  const trendlineView = testUuid && type === 'trendline';
  const showPrintButton = config.showPrintButton;
  const responsiveSize = isTablet ? 'lg' : 'md';

  const navigateBackFromTrendlineView = useCallback(() => {
    navigate({
      to: testResultsBasePath(`/patient/${patientUuid}/chart`),
    });
  }, [patientUuid]);

  const openPrintModal = useCallback(() => {
    const dispose = showModal('print-modal', {
      patientUuid,
      closeDialog: () => dispose(),
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
              <Switch name="panel" text={t('panel', 'Panel')} />
              <Switch name="tree" text={t('tree', 'Tree')} />
            </ContentSwitcher>
          </div>
          <RefreshDataButton isTablet={isTablet} t={t} />
        </div>
        {selectedSection === 'tree' ? (
          <TreeViewWrapper
            patientUuid={patientUuid}
            basePath={basePath}
            type={type}
            expanded={isExpanded}
            testUuid={testUuid}
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
          <h4 style={{ flexGrow: 1 }}>{`${t('results', 'Results')} ${
            totalResultsCount ? `(${totalResultsCount})` : ''
          }`}</h4>
          <div className={styles.leftHeaderActions}>
            <ContentSwitcher
              size={responsiveSize}
              selectedIndex={['panel', 'tree'].indexOf(selectedSection)}
              onChange={({ name }: { name: panelOpts }) => setSelectedSection(name)}
            >
              <Switch name="panel" text={t('panel', 'Panel')} />
              <Switch name="tree" text={t('tree', 'Tree')} />
            </ContentSwitcher>
            {showPrintButton && (
              <Button
                className={styles.button}
                kind="ghost"
                size={isTablet ? 'md' : 'sm'}
                renderIcon={Printer}
                iconDescription="Print results"
                onClick={openPrintModal}
              >
                <span>{t('print', 'Print')}</span>
              </Button>
            )}
          </div>
        </div>
        <div className={styles.rightSectionHeader}>
          <div className={styles.viewOptsContentSwitcherContainer}>
            <ContentSwitcher
              className={styles.viewOptionsSwitcher}
              onChange={({ name }: { name: viewOpts }) => setView(name)}
              selectedIndex={isExpanded ? 1 : 0}
              size={responsiveSize}
            >
              <Switch name="split" text={t('split', 'Split')} disabled={loading} />
              <Switch name="full" text={t('full', 'Full')} disabled={loading} />
            </ContentSwitcher>
          </div>
          <RefreshDataButton isTablet={isTablet} t={t} />
        </div>
      </div>
      <div className={styles.flex}>
        {selectedSection === 'tree' ? (
          <TreeViewWrapper
            patientUuid={patientUuid}
            basePath={basePath}
            type={type}
            expanded={isExpanded}
            testUuid={testUuid}
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
      </div>
    </div>
  );
};

function RefreshDataButton({ isTablet, t }: RefreshDataButtonProps) {
  return (
    <Button
      className={styles.button}
      kind="ghost"
      renderIcon={Renew}
      size={isTablet ? 'md' : 'sm'}
      onClick={() => window.location.reload()}
    >
      <span>{t('refreshData', 'Refresh data')}</span>
    </Button>
  );
}

export default RoutedResultsViewer;
