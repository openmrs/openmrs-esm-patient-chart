import React, { useContext, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { AccordionSkeleton, DataTableSkeleton, Button, Layer } from '@carbon/react';
import { useLayoutType, TreeViewAltIcon, useConfig } from '@openmrs/esm-framework';
import { EmptyState, ErrorState } from '@openmrs/esm-patient-common-lib';
import { type ConfigObject } from '../../config-schema';
import { type GroupedObservation, type viewOpts } from '../../types';
import FilterSet, { FilterContext } from '../filter';
import GroupedTimeline, { useGetManyObstreeData } from '../grouped-timeline';
import IndividualResultsTable from '../individual-results-table/individual-results-table.component';
import TabletOverlay from '../tablet-overlay';
import styles from '../results-viewer/results-viewer.scss';

interface TreeViewProps {
  patientUuid: string;
  basePath: string;
  testUuid: string;
  expanded: boolean;
  type: string;
  view?: viewOpts;
  error?: string;
}

const GroupedPanelsTables: React.FC<{ className: string; loadingPanelData: boolean }> = ({
  className,
  loadingPanelData,
}) => {
  const { t } = useTranslation();
  const { checkboxes, someChecked, tableData } = useContext(FilterContext);
  const selectedCheckboxes = Object.keys(checkboxes).filter((key) => checkboxes[key]);

  if (!tableData?.length) {
    return <EmptyState displayText={t('data', 'data')} headerTitle={t('dataTimelineText', 'Data timeline')} />;
  }

  return (
    <Layer className={className}>
      {tableData
        ?.filter(
          (row) =>
            !someChecked ||
            row.entries?.some((entry) => selectedCheckboxes.some((selectedKey) => entry.flatName === selectedKey)),
        )
        .map((subRows: GroupedObservation, index) => {
          const filteredSubRows = {
            ...subRows,
            entries: subRows.entries?.filter(
              (entry) =>
                !someChecked ||
                selectedCheckboxes.some((selectedKey) => entry.flatName === selectedKey || entry.key === selectedKey),
            ),
          };
          return filteredSubRows.entries?.length > 0 ? (
            <div
              key={index}
              className={classNames({
                [styles.border]: filteredSubRows?.entries.length,
              })}
            >
              <IndividualResultsTable
                isLoading={loadingPanelData}
                subRows={filteredSubRows}
                index={index}
                title={filteredSubRows.key}
              />
            </div>
          ) : null;
        })}
    </Layer>
  );
};

const TreeView: React.FC<TreeViewProps> = ({ patientUuid, basePath, testUuid, expanded, type, view }) => {
  const { t } = useTranslation();
  const tablet = useLayoutType() === 'tablet';
  const [showTreeOverlay, setShowTreeOverlay] = useState(false);
  const config = useConfig<ConfigObject>();
  const conceptUuids = config?.resultsViewerConcepts?.map((c) => c.conceptUuid) ?? [];
  const { roots, error } = useGetManyObstreeData(conceptUuids);

  const { timelineData, resetTree, isLoading } = useContext(FilterContext);

  if (error) {
    return <ErrorState error={error} headerTitle={t('dataLoadError', 'Data Load Error')} />;
  }

  if (!roots || roots.length === 0) {
    return (
      <EmptyState
        headerTitle={t('testResults_title', 'Test Results')}
        displayText={t('testResultsData', 'Test results data')}
      />
    );
  }

  if (tablet) {
    return (
      <>
        <div>
          {!isLoading ? <GroupedTimeline patientUuid={patientUuid} /> : <DataTableSkeleton role="progressbar" />}
        </div>
        <div className={styles.floatingTreeButton}>
          <Button
            renderIcon={TreeViewAltIcon}
            hasIconOnly
            onClick={() => setShowTreeOverlay(true)}
            iconDescription={t('showTree', 'Show tree')}
          />
        </div>
        {showTreeOverlay && (
          <TabletOverlay
            headerText={t('tree', 'Tree')}
            close={() => setShowTreeOverlay(false)}
            buttonsGroup={
              <div className={styles.overlay}>
                <Button kind="secondary" size="xl" onClick={resetTree} disabled={isLoading}>
                  {t('resetTreeText', 'Reset tree')}
                </Button>
                <Button kind="primary" size="xl" onClick={() => setShowTreeOverlay(false)} disabled={isLoading}>
                  {`${t('view', 'View')} ${
                    !isLoading && timelineData?.loaded ? timelineData?.data?.rowData?.length : ''
                  } ${t('resultsText', 'results')}`}
                </Button>
              </div>
            }
          >
            {!isLoading ? <FilterSet hideFilterSetHeader /> : <AccordionSkeleton open count={4} align="start" />}
          </TabletOverlay>
        )}
      </>
    );
  }

  return (
    <>
      {!expanded && (
        <div className={styles.leftSection}>
          {!isLoading ? <FilterSet /> : <AccordionSkeleton open count={4} align="start" />}
        </div>
      )}
      <div className={classNames(styles.rightSection, expanded ? styles.fullView : styles.splitView)}>
        {isLoading ? (
          <DataTableSkeleton />
        ) : view === 'individual-test' ? (
          <div className={styles.panelViewTimeline}>
            <GroupedPanelsTables className={styles.groupPanelsTables} loadingPanelData={isLoading} />
          </div>
        ) : view === 'over-time' ? (
          <GroupedTimeline patientUuid={patientUuid} />
        ) : null}
      </div>
    </>
  );
};

export default TreeView;
