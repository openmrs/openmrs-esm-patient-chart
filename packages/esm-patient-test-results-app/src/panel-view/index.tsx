import React, { useCallback, useEffect, useState } from 'react';
import LabSetPanel from './panel.component';
import usePanelData from './usePanelData';
import { Column, DataTableSkeleton, Button } from '@carbon/react';
import { Search as SearchIcon } from '@carbon/react/icons';
import styles from './panel-view.scss';
import { useLayoutType } from '@openmrs/esm-framework';
import PanelTimelineComponent from '../panel-timeline';
import { ObsRecord } from './types';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@openmrs/esm-patient-common-lib';
import Trendline from '../trendline/trendline.component';

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
            <PanelViewHeader isTablet={isTablet} />
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
}

const PanelViewHeader: React.FC<PanelViewHeaderProps> = ({ isTablet }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.panelViewHeader}>
      <h4 className={styles.productiveHeading02}>{t('panel', 'Panel')}</h4>
      <Button kind="ghost" size={isTablet ? 'md' : 'sm'} renderIcon={SearchIcon}>
        {t('search', 'Search')}
      </Button>
    </div>
  );
};

export default PanelView;
