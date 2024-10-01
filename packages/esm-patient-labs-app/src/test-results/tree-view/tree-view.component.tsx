import React, { useContext, useEffect, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { AccordionSkeleton, DataTableSkeleton, Button, Layer } from '@carbon/react';
import { useLayoutType, TreeViewAltIcon } from '@openmrs/esm-framework';
import { EmptyState } from '@openmrs/esm-patient-common-lib';
import FilterSet, { FilterContext } from '../filter';
import GroupedTimeline from '../grouped-timeline';
import TabletOverlay from '../tablet-overlay';
import Trendline from '../trendline/trendline.component';
import usePanelData from '../panel-view/usePanelData';
import { type viewOpts } from '../../types';
import IndividualResultsTable from '../individual-results-table/individual-results-table.component';
import styles from '../results-viewer/results-viewer.scss';

interface TreeViewProps {
  patientUuid: string;
  basePath: string;
  testUuid: string;
  loading: boolean;
  expanded: boolean;
  type: string;
  view?: viewOpts;
}

const GroupedPanelsTables: React.FC<{ className: string; loadingPanelData: boolean }> = ({
  className,
  loadingPanelData,
}) => {
  const { timelineData, parents, checkboxes, someChecked, lowestParents } = useContext(FilterContext);
  const { t } = useTranslation();

  const {
    data: { rowData },
  } = timelineData;

  const filteredParents = lowestParents?.filter(
    (parent) => parents[parent.flatName].some((kid) => checkboxes[kid]) || !someChecked,
  );

  if (rowData && rowData?.length === 0) {
    return <EmptyState displayText={t('data', 'data')} headerTitle={t('dataTimelineText', 'Data timeline')} />;
  }

  return (
    <Layer className={className}>
      {filteredParents?.map((parent, index) => {
        const subRows = someChecked
          ? rowData?.filter(
              (row: { flatName: string }) =>
                parents[parent.flatName].includes(row.flatName) && checkboxes[row.flatName],
            )
          : rowData?.filter((row: { flatName: string }) => parents[parent.flatName].includes(row.flatName));
        return (
          <div
            className={classNames({
              [styles.border]: subRows.length,
            })}
          >
            <IndividualResultsTable isLoading={loadingPanelData} parent={parent} subRows={subRows} index={index} />
          </div>
        );
      })}
    </Layer>
  );
};

const TreeView: React.FC<TreeViewProps> = ({ patientUuid, basePath, testUuid, loading, expanded, type, view }) => {
  const tablet = useLayoutType() === 'tablet';
  const [showTreeOverlay, setShowTreeOverlay] = useState(false);
  const { t } = useTranslation();

  const { timelineData, resetTree, someChecked } = useContext(FilterContext);
  const { panels, isLoading: isLoadingPanelData, groupedObservations } = usePanelData();

  if (tablet) {
    return (
      <>
        <div>{!loading ? <GroupedTimeline patientUuid={patientUuid} /> : <DataTableSkeleton />}</div>
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
              <>
                <Button kind="secondary" size="xl" onClick={resetTree} disabled={loading}>
                  {t('resetTreeText', 'Reset tree')}
                </Button>
                <Button kind="primary" size="xl" onClick={() => setShowTreeOverlay(false)} disabled={loading}>
                  {`${t('view', 'View')} ${
                    !loading && timelineData?.loaded ? timelineData?.data?.rowData?.length : ''
                  } ${t('resultsText', 'results')}`}
                </Button>
              </>
            }
          >
            {!loading ? <FilterSet hideFilterSetHeader /> : <AccordionSkeleton open count={4} align="start" />}
          </TabletOverlay>
        )}
      </>
    );
  }

  return (
    <>
      {!expanded && (
        <div className={styles.leftSection}>
          {!loading ? <FilterSet /> : <AccordionSkeleton open count={4} align="start" />}
        </div>
      )}
      <div className={classNames(styles.rightSection, expanded ? styles.fullView : styles.splitView)}>
        {testUuid && type === 'trendline' ? (
          <Trendline patientUuid={patientUuid} conceptUuid={testUuid} basePath={basePath} showBackToTimelineButton />
        ) : loading || isLoadingPanelData ? (
          <DataTableSkeleton />
        ) : view === 'individual-test' ? (
          <div className={styles.panelViewTimeline}>
            <GroupedPanelsTables className={styles.groupPanelsTables} loadingPanelData={loading} />
          </div>
        ) : view === 'over-time' ? (
          panels.map((panel) => (
            <div key={`panel-${panel.id}`} className={styles.panelViewTimeline}>
              <GroupedTimeline patientUuid={patientUuid} />
            </div>
          ))
        ) : null}
      </div>
    </>
  );
};

export default TreeView;
