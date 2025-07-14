import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { DataTableSkeleton, Button, Search, Form } from '@carbon/react';
import { CloseIcon, SearchIcon, useLayoutType } from '@openmrs/esm-framework';
import { EmptyState } from '@openmrs/esm-patient-common-lib';
import { FilterEmptyState } from '../ui-elements/resetFiltersEmptyState/filter-empty-state.component';
import type { GroupedObservation } from '../../types';
import LabSetPanel from './lab-set-panel.component';
import Overlay from '../tablet-overlay/tablet-overlay.component';
import FilterContext from '../filter/filter-context';
import TimelineDataGroup from '../grouped-timeline/timeline-data-group.component';
import styles from './individual-results-table-tablet.scss';

interface IndividualResultsTableTabletProps {
  expanded: boolean;
  patientUuid: string;
}

interface IndividualResultsTableTabletHeaderProps {
  isTablet: boolean;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  totalSearchResults: number;
}

const IndividualResultsTableTablet: React.FC<IndividualResultsTableTabletProps> = ({ expanded, patientUuid }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const isTablet = layout === 'tablet';
  const [searchTerm, setSearchTerm] = useState('');
  const [activePanel, setActivePanel] = useState<GroupedObservation>(null);
  const { tableData, timelineData, lowestParents, isLoading } = useContext(FilterContext);

  const activeTimelineData = useMemo(() => {
    return activePanel
      ? activePanel.entries
          .map((panelTest) =>
            timelineData.data.rowData.filter((timelineTest) => timelineTest.flatName == panelTest.flatName),
          )
          .flat()
      : [];
  }, [timelineData, activePanel]);

  const activeTimelineParent = useMemo(() => {
    return activePanel ? lowestParents.find((parent) => parent.display == activePanel.key) : null;
  }, [lowestParents, activePanel]);

  const filteredPanels = useMemo(() => {
    if (!searchTerm) {
      return tableData;
    }
    return tableData?.filter(
      (panel) =>
        panel.flatName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        panel.entries.some((ob) => ob.display.toLowerCase().includes(searchTerm.toLowerCase())),
    );
  }, [tableData, searchTerm]);

  useEffect(() => {
    // Selecting the active panel should not occur in small-desktop
    if (layout !== 'tablet' && filteredPanels?.length) {
      setActivePanel(filteredPanels[0]);
    }
  }, [filteredPanels, layout]);

  if (isTablet) {
    return (
      <>
        <div>
          <IndividualResultsTableTabletHeader
            isTablet={isTablet}
            setSearchTerm={setSearchTerm}
            searchTerm={searchTerm}
            totalSearchResults={filteredPanels?.length ?? 0}
          />
          {!isLoading ? (
            tableData?.length > 0 ? (
              filteredPanels?.length ? (
                filteredPanels.map((panel) => (
                  <LabSetPanel
                    key={panel.key}
                    panel={panel}
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
            <DataTableSkeleton data-testid="cds--data-table-container" />
          )}
        </div>
        {activePanel ? (
          <Overlay close={() => setActivePanel(null)} headerText={activePanel?.key}>
            <div className={styles.overlay}>
              <TimelineDataGroup
                patientUuid={patientUuid}
                parent={activeTimelineParent}
                subRows={activeTimelineData}
                panelName={activePanel.key}
                groupNumber={1}
                setPanelName={() => {}}
                xScroll={0}
                setXScroll={() => {}}
              />
            </div>
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
            <IndividualResultsTableTabletHeader
              isTablet={isTablet}
              setSearchTerm={setSearchTerm}
              searchTerm={searchTerm}
              totalSearchResults={filteredPanels?.length ?? 0}
            />
            {!isLoading ? (
              tableData?.length > 0 ? (
                filteredPanels?.length ? (
                  filteredPanels.map((panel) => (
                    <LabSetPanel
                      key={panel.key}
                      panel={panel}
                      activePanel={activePanel}
                      setActivePanel={setActivePanel}
                    />
                  ))
                ) : (
                  <FilterEmptyState clearFilter={() => setSearchTerm('')} />
                )
              ) : (
                <EmptyState displayText={t('panels', 'panels')} headerTitle={t('noPanelsFound', 'No panels found')} />
              )
            ) : (
              <DataTableSkeleton data-testid="cds--data-table-container" />
            )}
          </>
        </div>
      ) : null}
      <div
        className={classNames(styles.headerMargin, styles.rightSection, expanded ? styles.fullView : styles.splitView)}
      >
        <div className={styles.stickySection}>
          {isLoading ? (
            <DataTableSkeleton data-testid="cds--data-table-container" />
          ) : activePanel ? (
            <div className={styles.overlay}>
              <TimelineDataGroup
                patientUuid={patientUuid}
                parent={activeTimelineParent}
                subRows={activeTimelineData}
                panelName={activePanel.key}
                groupNumber={1}
                setPanelName={() => {}}
                xScroll={0}
                setXScroll={() => {}}
              />
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};

const IndividualResultsTableTabletHeader: React.FC<IndividualResultsTableTabletHeaderProps> = ({
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

  const handleSearchTerm = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setSearchTerm(localSearchTerm);
      handleToggleSearchFields();
    },
    [localSearchTerm, setSearchTerm, handleToggleSearchFields],
  );

  const handleClear = useCallback(() => {
    setSearchTerm('');
    setLocalSearchTerm('');
  }, [setSearchTerm, setLocalSearchTerm]);

  return (
    <div className={styles.panelViewHeader}>
      {!showSearchFields ? (
        <>
          <div className={styles.flexBaseline}>
            {searchTerm && totalSearchResults > 0 && (
              <h4 className={styles.heading}>
                {t('searchResultsTextFor', '{{count}} search results for {{searchTerm}}', {
                  searchTerm,
                  count: totalSearchResults,
                })}
              </h4>
            )}
            {searchTerm ? (
              <Button className={styles.clearButton} kind="ghost" size={isTablet ? 'md' : 'sm'} onClick={handleClear}>
                {t('clear', 'Clear')}
              </Button>
            ) : null}
          </div>
          <Button
            data-testid="toggle-search-button"
            kind="ghost"
            size={isTablet ? 'md' : 'sm'}
            renderIcon={SearchIcon}
            onClick={handleToggleSearchFields}
          >
            {t('search', 'Search')}
          </Button>
        </>
      ) : !isTablet ? (
        <>
          <Form onSubmit={handleSearchTerm} className={styles.flexBaseline}>
            <Search
              autoFocus
              labelText=""
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              placeholder={t('searchByTestName', 'Search by test name')}
              size="sm"
              value={localSearchTerm}
            />
            <Button
              data-testid="execute-search-button"
              kind="secondary"
              size="sm"
              onClick={() => handleSearchTerm(null)}
            >
              {t('search', 'Search')}
            </Button>
          </Form>
          <Button
            hasIconOnly
            renderIcon={CloseIcon}
            iconDescription={t('closeSearchBar', 'Close search')}
            onClick={handleToggleSearchFields}
            size="sm"
            kind="ghost"
          />
        </>
      ) : (
        <>
          <Overlay close={handleToggleSearchFields} headerText={t('search', 'Search')}>
            <Form onSubmit={handleSearchTerm} className={classNames(styles.flex)}>
              <Search
                autoFocus
                labelText=""
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                placeholder={t('searchByTestName', 'Search by test name')}
                size="lg"
                value={localSearchTerm}
              />
              <Button data-testid="execute-search-button" kind="secondary" onClick={() => handleSearchTerm(null)}>
                {t('search', 'Search')}
              </Button>
            </Form>
          </Overlay>
        </>
      )}
    </div>
  );
};

export default IndividualResultsTableTablet;
