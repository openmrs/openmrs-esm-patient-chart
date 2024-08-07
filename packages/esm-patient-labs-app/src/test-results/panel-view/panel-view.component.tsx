import React, { useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { DataTableSkeleton, Button, Search, Form } from '@carbon/react';
import { Search as SearchIcon, Close } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { navigate, useLayoutType } from '@openmrs/esm-framework';
import { EmptyState } from '@openmrs/esm-patient-common-lib';
import { FilterEmptyState } from '../ui-elements/resetFiltersEmptyState/filter-empty-state.component';
import type { ObsRecord } from '../../types';
import { testResultsBasePath } from '../helpers';
import LabSetPanel from './panel.component';
import Overlay from '../tablet-overlay/tablet-overlay.component';
import PanelTimelineComponent from '../panel-timeline/panel-timeline-component';
import Trendline from '../trendline/trendline.component';
import usePanelData from './usePanelData';
import styles from './panel-view.scss';

interface PanelViewProps {
  expanded: boolean;
  testUuid: string;
  type: string;
  basePath: string;
  patientUuid: string;
}

const PanelView: React.FC<PanelViewProps> = ({ expanded, testUuid, basePath, type, patientUuid }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const isTablet = layout === 'tablet';
  const trendlineView = testUuid && type === 'trendline';
  const { panels, isLoading, groupedObservations } = usePanelData();
  const [searchTerm, setSearchTerm] = useState('');
  const [activePanel, setActivePanel] = useState<ObsRecord>(null);

  const filteredPanels = useMemo(() => {
    if (!searchTerm) {
      return panels;
    }
    return panels?.filter(
      (panel) =>
        panel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        panel.relatedObs.some((ob) => ob.name.toLowerCase().includes(searchTerm.toLowerCase())),
    );
  }, [panels, searchTerm]);

  const navigateBackFromTrendlineView = useCallback(() => {
    navigate({
      to: testResultsBasePath(`/patient/${patientUuid}/chart`),
    });
  }, [patientUuid]);

  useEffect(() => {
    // Selecting the active panel should not occur in small-desktop
    if (layout !== 'tablet' && filteredPanels) {
      setActivePanel(filteredPanels?.[0]);
    }
  }, [filteredPanels, layout]);

  if (isTablet) {
    return (
      <>
        <div>
          <PanelViewHeader
            isTablet={isTablet}
            setSearchTerm={setSearchTerm}
            searchTerm={searchTerm}
            totalSearchResults={filteredPanels?.length ?? 0}
          />
          {!isLoading ? (
            panels.length > 0 ? (
              filteredPanels.length ? (
                filteredPanels.map((panel) => (
                  <LabSetPanel
                    panel={panel}
                    observations={[panel, ...panel.relatedObs]}
                    setActivePanel={setActivePanel}
                    activePanel={activePanel}
                  />
                ))
              ) : (
                <FilterEmptyState clearFilter={() => setSearchTerm('')} />
              )
            ) : (
              <EmptyState displayText={t('panels', 'panels')} headerTitle={t('noPanelsFound', 'No panels found')} />
            )
          ) : (
            <DataTableSkeleton columns={3} />
          )}
        </div>
        {activePanel ? (
          <Overlay close={() => setActivePanel(null)} headerText={activePanel?.name}>
            <PanelTimelineComponent groupedObservations={groupedObservations} activePanel={activePanel} />
          </Overlay>
        ) : null}
        {trendlineView ? (
          <Overlay close={navigateBackFromTrendlineView} headerText={activePanel?.name}>
            <Trendline patientUuid={patientUuid} conceptUuid={testUuid} basePath={basePath} />
          </Overlay>
        ) : null}
      </>
    );
  }

  return (
    <>
      {!expanded ? (
        <div className={styles.leftSection}>
          <>
            <PanelViewHeader
              isTablet={isTablet}
              setSearchTerm={setSearchTerm}
              searchTerm={searchTerm}
              totalSearchResults={filteredPanels?.length ?? 0}
            />
            {!isLoading ? (
              panels.length > 0 ? (
                filteredPanels.length ? (
                  filteredPanels.map((panel) => (
                    <LabSetPanel
                      panel={panel}
                      observations={[panel, ...panel.relatedObs]}
                      setActivePanel={setActivePanel}
                      activePanel={activePanel}
                    />
                  ))
                ) : (
                  <FilterEmptyState clearFilter={() => setSearchTerm('')} />
                )
              ) : (
                <EmptyState displayText={t('panels', 'panels')} headerTitle={t('noPanelsFound', 'No panels found')} />
              )
            ) : (
              <DataTableSkeleton columns={3} />
            )}
          </>
        </div>
      ) : null}
      <div
        className={classNames(styles.headerMargin, styles.rightSection, expanded ? styles.fullView : styles.splitView)}
      >
        <div className={styles.stickySection}>
          {isLoading ? (
            <DataTableSkeleton columns={3} />
          ) : trendlineView ? (
            <Trendline patientUuid={patientUuid} conceptUuid={testUuid} basePath={basePath} showBackToTimelineButton />
          ) : activePanel ? (
            <PanelTimelineComponent groupedObservations={groupedObservations} activePanel={activePanel} />
          ) : null}
        </div>
      </div>
    </>
  );
};

interface PanelViewHeaderProps {
  isTablet: boolean;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  totalSearchResults: number;
}

const PanelViewHeader: React.FC<PanelViewHeaderProps> = ({
  isTablet,
  searchTerm,
  setSearchTerm,
  totalSearchResults,
}) => {
  const { t } = useTranslation();
  const [showSearchFields, setShowSearchFields] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  const handleToggleSearchFields = useCallback(() => {
    setShowSearchFields((prev) => !prev);
  }, [setShowSearchFields]);

  const handleSearchTerm = () => {
    setSearchTerm(localSearchTerm);
    handleToggleSearchFields();
  };

  const handleClear = useCallback(() => {
    setSearchTerm('');
    setLocalSearchTerm('');
  }, [setSearchTerm, setLocalSearchTerm]);

  return (
    <div className={styles.panelViewHeader}>
      {!showSearchFields ? (
        <>
          <div className={styles.flex}>
            <h4 className={styles.heading}>
              {!searchTerm
                ? t('panel', 'Panel')
                : t('searchResultsTextFor', '{{count}} search results for {{searchTerm}}', {
                    searchTerm,
                    count: totalSearchResults,
                  })}
            </h4>
            {searchTerm ? (
              <Button className={styles.clearButton} kind="ghost" size={isTablet ? 'md' : 'sm'} onClick={handleClear}>
                {t('clear', 'Clear')}
              </Button>
            ) : null}
          </div>
          <Button kind="ghost" size={isTablet ? 'md' : 'sm'} renderIcon={SearchIcon} onClick={handleToggleSearchFields}>
            {t('search', 'Search')}
          </Button>
        </>
      ) : !isTablet ? (
        <>
          <Form onSubmit={handleSearchTerm} className={styles.flex}>
            <Search
              size="sm"
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              placeholder={t('searchByTestName', 'Search by test name')}
              autoFocus
            />
            <Button kind="secondary" size="sm" onClick={handleSearchTerm}>
              {t('search', 'Search')}
            </Button>
          </Form>
          <Button
            hasIconOnly
            renderIcon={Close}
            iconDescription={t('closeSearchBar', 'Close search')}
            onClick={handleToggleSearchFields}
            size="sm"
            kind="ghost"
          />
        </>
      ) : (
        <>
          <Overlay close={handleToggleSearchFields} headerText={t('search', 'Search')}>
            <Form onSubmit={handleSearchTerm} className={classNames(styles.flex, styles.tabletSearch)}>
              <Search
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                placeholder={t('searchByTestName', 'Search by test name')}
                autoFocus
                size="lg"
              />
              <Button kind="secondary" onClick={handleSearchTerm}>
                {t('search', 'Search')}
              </Button>
            </Form>
          </Overlay>
        </>
      )}
    </div>
  );
};

export default PanelView;
