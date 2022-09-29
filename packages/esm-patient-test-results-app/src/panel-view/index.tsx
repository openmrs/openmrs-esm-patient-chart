import React, { useEffect, useState } from 'react';
import LabSetPanel from './panel.component';
import usePanelData from './usePanelData';
import { Column, DataTableSkeleton, Button } from '@carbon/react';
import { Search as SearchIcon } from '@carbon/react/icons';
import styles from './panel-view.scss';
import { useLayoutType } from '@openmrs/esm-framework';
import PanelTimelineComponent from './timeline.component';
import { ObsRecord } from './types';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@openmrs/esm-patient-common-lib';

interface PanelViewProps {
  expanded: boolean;
}

const PanelView: React.FC<PanelViewProps> = ({ expanded }) => {
  const tablet = useLayoutType() === 'tablet';
  const { panels, isLoading, groupedObservations } = usePanelData();
  const [activePanel, setActivePanel] = useState<ObsRecord>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (!activePanel && panels) {
      setActivePanel(panels?.[0]);
    }
  }, [panels, activePanel]);

  return (
    <>
      {!tablet && (
        <Column sm={16} lg={tablet || expanded ? 0 : 5}>
          <>
            <PanelViewHeader tablet={tablet} />
            {!isLoading ? (
              panels.length > 0 ? (
                panels.map((panel) => (
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
      <Column sm={16} lg={tablet || expanded ? 12 : 7}>
        <PanelTimelineComponent activePanel={activePanel} />
      </Column>
    </>
  );
};

interface PanelViewHeaderProps {
  tablet: boolean;
}

const PanelViewHeader: React.FC<PanelViewHeaderProps> = ({ tablet }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.panelViewHeader}>
      <h4 className={styles.productiveHeading02}>{t('panel', 'Panel')}</h4>
      <Button kind="ghost" size={tablet ? 'md' : 'sm'} renderIcon={SearchIcon}>
        {t('search', 'Search')}
      </Button>
    </div>
  );
};

export default PanelView;
