import React, { useCallback, useEffect, useMemo, useState } from 'react';
import LabSetPanel from './panel.component';
import usePanelData from './usePanelData';
import { Column, DataTableSkeleton, Button, Search, Form } from '@carbon/react';
import { Search as SearchIcon, Close } from '@carbon/react/icons';
import styles from './panel-view.scss';
import { useLayoutType } from '@openmrs/esm-framework';
import PanelTimelineComponent from '../panel-timeline';
import { ObsRecord } from './types';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@openmrs/esm-patient-common-lib';
import Trendline from '../trendline/trendline.component';
import Overlay from '../tablet-overlay/tablet-overlay.component';

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

  useEffect(() => {
    if (layout === 'large-desktop' && !activePanel && panels) {
      setActivePanel(panels?.[0]);
    }
  }, [panels, activePanel, layout]);

  return (
    <>
      {!isTablet && (
        <Column sm={16} lg={fullWidthPanels ? 12 : 5}>
          <>
            <PanelViewHeader
              isTablet={isTablet}
              setSearchTerm={setSearchTerm}
              searchTerm={searchTerm}
              totalSearchResults={filteredPanels?.length ?? 0}
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
              ) : (
                <EmptyState displayText={t('panels', 'panels')} headerTitle={t('noPanelsFound', 'No panels found')} />
              )
            ) : (
              <DataTableSkeleton columns={3} />
            )}
          </>
        </Column>
      )}
      <Column
        sm={16}
        lg={fullWidthPanels ? 0 : 7}
        className={isTablet ? styles.headerMarginTablet : styles.headerMargin}
      >
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
      </Column>
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
            <h4 className={styles.productiveHeading02}>
              {!searchTerm
                ? t('panel', 'Panel')
                : `${totalSearchResults} ${t('searchResultsTextFor', 'search results for')} "${searchTerm}"`}
            </h4>
            {searchTerm ? (
              <Button kind="ghost" size={isTablet ? 'md' : 'sm'} onClick={handleClear}>
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
              autoFocus={true}
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
            <Form onSubmit={handleSearchTerm} className={styles.flex}>
              <Search
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                placeholder={t('searchByTestName', 'Search by test name')}
                autoFocus={true}
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
