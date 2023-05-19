import React, { useContext, useState } from 'react';
import { AccordionSkeleton, DataTableSkeleton, Button } from '@carbon/react';
import { TreeViewAlt } from '@carbon/react/icons';
import { useLayoutType } from '@openmrs/esm-framework';
import FilterSet, { FilterContext } from '../filter';
import GroupedTimeline from '../grouped-timeline';
import Trendline from '../trendline/trendline.component';
import styles from '../results-viewer/results-viewer.styles.scss';
import { useTranslation } from 'react-i18next';
import TabletOverlay from '../tablet-overlay';
import usePanelData from '../panel-view/usePanelData';
import PanelTimelineComponent from '../panel-timeline';

interface TreeViewProps {
  patientUuid: string;
  basePath: string;
  testUuid: string;
  loading: boolean;
  expanded: boolean;
  type: string;
}

const TreeView: React.FC<TreeViewProps> = ({ patientUuid, basePath, testUuid, loading, expanded, type }) => {
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
      <div className={`${styles.rightSection} ${expanded ? styles.fullView : styles.splitView}`}>
        {testUuid && type === 'trendline' ? (
          <Trendline patientUuid={patientUuid} conceptUuid={testUuid} basePath={basePath} showBackToTimelineButton />
        ) : loading || isLoadingPanelData ? (
          <DataTableSkeleton />
        ) : someChecked ? (
          <GroupedTimeline />
        ) : (
          // If no filter is selected from the filter view
          // All the test results recorded for the patient needs to be shown
          panels.map((panel) => (
            <div className={styles.panelViewTimeline}>
              <PanelTimelineComponent groupedObservations={groupedObservations} activePanel={panel} />
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default TreeView;
