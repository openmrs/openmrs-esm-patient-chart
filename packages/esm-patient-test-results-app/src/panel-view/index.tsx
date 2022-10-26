import React, { useCallback, useEffect, useMemo, useState } from 'react';
import LabSetPanel from './panel.component';
import usePanelData from './usePanelData';
import { Column, DataTableSkeleton, Button, Search, Layer } from '@carbon/react';
import { Search as SearchIcon, Close } from '@carbon/react/icons';
import styles from './panel-view.scss';
import { navigate, useLayoutType } from '@openmrs/esm-framework';
import PanelTimelineComponent from '../panel-timeline';
import { ObsRecord } from './types';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@openmrs/esm-patient-common-lib';
import Trendline from '../trendline/trendline.component';
import Overlay from '../tablet-overlay/tablet-overlay.component';
import { testResultsBasePath } from '../helpers';
import TabletOverlay from '../tablet-overlay';
import { FilterEmptyState } from '../ui-components/resetFiltersEmptyState';

interface PanelViewProps {
  expanded: boolean;
  testUuid: string;
  type: string;
  basePath: string;
  patientUuid: string;
}

const PanelView: React.FC<PanelViewProps> = ({ expanded, testUuid, basePath, type, patientUuid }) => {
  const layout = useLayoutType();
  const isTablet = layout === 'tablet';
  const { panels, isLoading, groupedObservations } = usePanelData();
  const [activePanel, setActivePanel] = useState<ObsRecord>(null);
  const { t } = useTranslation();
  const fullWidthPanels = expanded || !activePanel;
  const trendlineView = testUuid && type === 'trendline';
  const [searchTerm, setSearchTerm] = useState('');

  const clearFilter = useCallback(() => {
    setSearchTerm('');
  }, [setSearchTerm]);

  const navigateBackFromTrendlineView = useCallback(() => {
    navigate({
      to: testResultsBasePath(`/patient/${patientUuid}/chart`),
    });
  }, [patientUuid]);

  const filteredPanels = useMemo(() => {
    return panels.filter((panel) => {
      const observations = [panel, ...panel.relatedObs];
      return observations.some((obs) => obs.name.toLowerCase().includes(searchTerm.toLowerCase()));
    });
  }, [panels, searchTerm]);

  useEffect(() => {
    if (layout === 'large-desktop' && !activePanel && filteredPanels) {
      setActivePanel(filteredPanels?.[0]);
    }
  }, [filteredPanels, activePanel, layout, searchTerm]);

  useEffect(() => {
    setActivePanel(null);
  }, [searchTerm]);

  if (isTablet) {
    return (
      <>
        <div>
          <PanelViewHeader
            isTablet={isTablet}
            setSearchTerm={setSearchTerm}
            searchTerm={searchTerm}
            totalResults={filteredPanels?.length ?? 0}
          />
          {!isLoading ? (
            filteredPanels.length > 0 ? (
              filteredPanels.map((panel) => (
                <LabSetPanel
                  panel={panel}
                  observations={[panel, ...panel.relatedObs]}
                  setActivePanel={setActivePanel}
                  activePanel={activePanel}
                />
              ))
            ) : searchTerm ? (
              <FilterEmptyState clearFilter={clearFilter} />
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
      <Column sm={16} lg={fullWidthPanels ? 12 : 5}>
        <PanelViewHeader
          isTablet={isTablet}
          setSearchTerm={setSearchTerm}
          searchTerm={searchTerm}
          totalResults={filteredPanels?.length ?? 0}
        />
        {!isLoading ? (
          filteredPanels.length > 0 ? (
            filteredPanels.map((panel) => (
              <LabSetPanel
                panel={panel}
                observations={[panel, ...panel.relatedObs]}
                setActivePanel={setActivePanel}
                activePanel={activePanel}
              />
            ))
          ) : searchTerm ? (
            <FilterEmptyState clearFilter={clearFilter} />
          ) : (
            <EmptyState displayText={t('panels', 'panels')} headerTitle={t('noPanelsFound', 'No panels found')} />
          )
        ) : (
          <DataTableSkeleton columns={3} />
        )}
      </Column>
      <Column
        sm={16}
        lg={fullWidthPanels ? 0 : 7}
        className={isTablet ? styles.headerMarginTablet : styles.headerMargin}
      >
        <div className={styles.stickyTop}>
          {isLoading ? (
            <DataTableSkeleton columns={3} />
          ) : trendlineView ? (
            <Trendline patientUuid={patientUuid} conceptUuid={testUuid} basePath={basePath} showBackToTimelineButton />
          ) : activePanel ? (
            <PanelTimelineComponent groupedObservations={groupedObservations} activePanel={activePanel} />
          ) : (
            <EmptyState
              headerTitle={t('noPanelSelected', 'No panel selected')}
              displayText={t('observations', 'Observations')}
            />
          )}
        </div>
      </Column>
    </>
  );
};

interface PanelViewHeaderProps {
  isTablet: boolean;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  searchTerm: string;
  totalResults: number;
}

const PanelViewHeader: React.FC<PanelViewHeaderProps> = ({ isTablet, setSearchTerm, searchTerm, totalResults }) => {
  const { t } = useTranslation();
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  const handleClearSearch = useCallback(() => {
    setShowSearchBar(false);
    setSearchTerm('');
    setLocalSearchTerm('');
  }, []);

  const handleSearch = useCallback(
    (evt) => {
      setLocalSearchTerm(evt.target.value);
    },
    [setLocalSearchTerm],
  );

  const handleSubmit = useCallback(
    (evt) => {
      evt.preventDefault();
      setSearchTerm(localSearchTerm);
      setShowSearchBar(false);
    },
    [localSearchTerm, setSearchTerm, setShowSearchBar],
  );

  if (isTablet) {
    return (
      <>
        <div className={styles.panelViewHeader}>
          <div className={styles.panelViewHeaderText}>
            <div className={styles.headerText}>
              <h4 className={styles.productiveHeading02}>
                {!searchTerm
                  ? t('panel', 'Panel')
                  : `${totalResults} ${t('searchResultsOnSearchText', 'search results for ')} "${searchTerm}"`}
              </h4>
              {searchTerm && (
                <Button kind="ghost" onClick={handleClearSearch}>
                  {t('clear', 'Clear')}
                </Button>
              )}
            </div>
            <Button kind="ghost" renderIcon={SearchIcon} onClick={() => setShowSearchBar(true)}>
              {t('search', 'Search')}
            </Button>
          </div>
        </div>
        {showSearchBar && (
          <TabletOverlay close={() => setShowSearchBar(false)} headerText={t('search', 'Search')}>
            <div className={styles.panelViewHeaderSearch}>
              <form className={styles.searchForm} onSubmit={handleSubmit}>
                <div className={styles.searchBar}>
                  <Layer>
                    <Search value={localSearchTerm} onChange={handleSearch} autoFocus size="lg" />
                  </Layer>
                </div>
                <Button type="submit" kind="secondary">
                  {t('search', 'Search')}
                </Button>
              </form>
            </div>
          </TabletOverlay>
        )}
      </>
    );
  }

  return (
    <div className={styles.panelViewHeader}>
      {!showSearchBar ? (
        <div className={styles.panelViewHeaderText}>
          <div className={styles.headerText}>
            <h4 className={styles.productiveHeading02}>
              {!searchTerm
                ? t('panel', 'Panel')
                : `${totalResults} ${t('searchResultsOnSearchText', 'search results for ')} "${searchTerm}"`}
            </h4>
            {searchTerm && (
              <Button kind="ghost" size="sm" onClick={handleClearSearch}>
                {t('clear', 'Clear')}
              </Button>
            )}
          </div>
          <Button kind="ghost" size="sm" renderIcon={SearchIcon} onClick={() => setShowSearchBar(true)}>
            {t('search', 'Search')}
          </Button>
        </div>
      ) : (
        <div className={styles.panelViewHeaderSearch}>
          <form className={styles.searchForm} onSubmit={handleSubmit}>
            <div className={styles.searchBar}>
              <Layer>
                <Search value={localSearchTerm} size="sm" onChange={handleSearch} autoFocus />
              </Layer>
            </div>
            <Button type="submit" kind="secondary" size={isTablet ? 'md' : 'sm'}>
              {t('search', 'Search')}
            </Button>
          </form>
          <Button
            hasIconOnly
            renderIcon={Close}
            size={isTablet ? 'md' : 'sm'}
            kind="ghost"
            onClick={handleClearSearch}
          />
        </div>
      )}
    </div>
  );
};

export default PanelView;
