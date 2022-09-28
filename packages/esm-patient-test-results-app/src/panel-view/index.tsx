import React, { useEffect, useState } from 'react';
import LabSetPanel from './panel.component';
import usePanelData from './usePanelData';
import { Column, DataTableSkeleton } from '@carbon/react';
import styles from '../results-viewer/results-viewer.styles.scss';
import { useLayoutType } from '@openmrs/esm-framework';
import PanelTimelineComponent from './timeline.component';
import { ObsRecord } from './types';

interface PanelViewProps {
  expanded: boolean;
}

const PanelView: React.FC<PanelViewProps> = ({ expanded }) => {
  const tablet = useLayoutType() === 'tablet';
  const { panels, isLoading, groupedObservations } = usePanelData();
  const [activePanel, setActivePanel] = useState<ObsRecord>(null);

  useEffect(() => {
    if (!activePanel && panels) {
      setActivePanel(panels?.[0]);
    }
  }, [panels, activePanel]);

  return (
    <>
      {!tablet && (
        <Column sm={16} lg={tablet || expanded ? 0 : 5} className={`${styles.columnPanel} ${styles.treeColumn}`}>
          {!isLoading ? (
            panels.map((panel) => (
              <LabSetPanel
                panel={panel}
                observations={[panel, ...panel.relatedObs]}
                setActivePanel={setActivePanel}
                activePanel={activePanel}
              />
            ))
          ) : (
            <DataTableSkeleton columns={3} />
          )}
        </Column>
      )}
      <Column sm={16} lg={tablet || expanded ? 12 : 7} className={`${styles.columnPanel}`}>
        <PanelTimelineComponent activePanel={activePanel} />
      </Column>
    </>
  );
};

export default PanelView;
