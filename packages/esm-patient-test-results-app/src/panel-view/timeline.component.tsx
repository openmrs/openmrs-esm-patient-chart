import React from 'react';
import { useTranslation } from 'react-i18next';
import { ObsRecord } from './types';
import usePanelData from './usePanelData';

interface PanelTimelineComponentProps {
  activePanel: ObsRecord;
}

const PanelTimelineComponent: React.FC<PanelTimelineComponentProps> = ({ activePanel }) => {
  const { t } = useTranslation();
  const { groupedObservations, conceptData } = usePanelData();
  const panelObservations: Array<ObsRecord> = activePanel ? [activePanel, ...activePanel?.relatedObs] : [];
  const rowData = panelObservations.map((obs) => ({
    ...obs,
    allObservations: groupedObservations[obs.conceptUuid],
  }));
  console.log(rowData);
  const mappedObservations = Object.fromEntries(
    panelObservations.map((concept) => [concept.conceptUuid, groupedObservations[concept.conceptUuid]]),
  );
  const allTimes = [].concat(
    ...Object.values(mappedObservations).map((obsRecords) => obsRecords.map((obs) => obs.effectiveDateTime)),
  );

  console.log();
  if (!activePanel) {
    return <p>{t('panelTimelineInstructions', 'Select a panel to view the timeline')}</p>;
  }
  return (
    <>
      {panelObservations.map((panel) => (
        <>
          <p>{panel.conceptUuid}</p>
          {mappedObservations[panel.conceptUuid].map((obs) => (
            <p>{obs.value}</p>
          ))}
        </>
      ))}
    </>
  );
};

export default PanelTimelineComponent;
