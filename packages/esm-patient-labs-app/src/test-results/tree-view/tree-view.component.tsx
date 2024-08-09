import React, { useContext, useEffect, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { AccordionSkeleton, DataTableSkeleton, Button } from '@carbon/react';
import { TreeViewAlt } from '@carbon/react/icons';
import { useLayoutType } from '@openmrs/esm-framework';
import FilterSet, { FilterContext } from '../filter';
import GroupedTimeline from '../grouped-timeline';
import PanelTimelineComponent from '../panel-timeline/panel-timeline-component';
import TabletOverlay from '../tablet-overlay';
import Trendline from '../trendline/trendline.component';
import usePanelData from '../panel-view/usePanelData';
import styles from '../results-viewer/results-viewer.scss';
import { type viewOpts } from '../../types';
import IndividualResultsTable from '../individual-results-table/individual-results-table.component';
import { EmptyState } from '@openmrs/esm-patient-common-lib';

interface TreeViewProps {
  patientUuid: string;
  basePath: string;
  testUuid: string;
  loading: boolean;
  expanded: boolean;
  type: string;
  view?: viewOpts;
}

const GroupedPanelsTables = ({ loadingPanelData }) => {
  const { activeTests, timelineData, parents, checkboxes, someChecked, lowestParents } = useContext(FilterContext);
  const [panelName, setPanelName] = useState('');
  const { t } = useTranslation();
  let shownGroups = 0;

  const {
    data: {
      parsedTime: { yearColumns, dayColumns, timeColumns },
      rowData,
    },
    loaded,
  } = timelineData; // data pulled from timeline data

  useEffect(() => {
    setPanelName('');
  }, [rowData]); //resetting panel name when row data changes

  if (rowData && rowData?.length === 0) {
    return <EmptyState displayText={t('data', 'data')} headerTitle={t('dataTimelineText', 'Data timeline')} />;
  } //empty state when there is no row data

  return (
    <>
      {lowestParents?.map((parent, index) => {
        if (parents[parent.flatName].some((kid) => checkboxes[kid]) || !someChecked) {
          shownGroups += 1;
          const subRows = someChecked
            ? rowData?.filter(
                (row: { flatName: string }) =>
                  parents[parent.flatName].includes(row.flatName) && checkboxes[row.flatName],
              )
            : rowData?.filter((row: { flatName: string }) => parents[parent.flatName].includes(row.flatName));

          // console.log({ parent, subRows, index, panelName, shownGroups });

          return (
            <div style={{ paddingBottom: '1rem' }}>
              <IndividualResultsTable isLoading={loadingPanelData} parent={parent} subRows={subRows} index={index} />
            </div>
          );
        } else return null;
      })}
    </>
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
        <div>{!loading ? <GroupedTimeline /> : <DataTableSkeleton />}</div>
        <div className={styles.floatingTreeButton}>
          <Button
            renderIcon={TreeViewAlt}
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
        ) : someChecked ? (
          <GroupedTimeline />
        ) : // If no filter is selected from the filter view
        // All the test results recorded for the patient needs to be shown
        view === 'individual-test' ? (
          <div className={styles.panelViewTimeline}>
            <GroupedPanelsTables loadingPanelData={loading} />
            {/* <IndividualResultsTable panels={panels} isLoading={isLoadingPanelData} /> */}
          </div>
        ) : view === 'over-time' ? (
          panels.map((panel) => (
            <div className={styles.panelViewTimeline}>
              <PanelTimelineComponent groupedObservations={groupedObservations} activePanel={panel} />
            </div>
          ))
        ) : null}
      </div>
    </>
  );
};

export default TreeView;
