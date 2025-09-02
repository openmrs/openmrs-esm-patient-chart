import React, { useCallback, useMemo } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Tab, TabListVertical, TabPanel, TabPanels, TabsVertical } from '@carbon/react';
import { LineChart, ScaleTypes } from '@carbon/charts-react';
import { ExtensionSlot, formatDate, useConfig } from '@openmrs/esm-framework';
import { type ConfigObjectSwitchable } from '../config-schema-obs-switchable';
import { useObs } from '../resources/useObs';
import styles from './obs-graph.scss';

interface ConceptGroupDescriptor {
  groupLabel: string;
  concepts: ConfigObjectSwitchable['data'];
}

interface ObsGraphProps {
  patientUuid: string;
}

const ObsGraph: React.FC<ObsGraphProps> = ({ patientUuid }) => {
  const config = useConfig<ConfigObjectSwitchable>();
  const { data: observations } = useObs(patientUuid);

  const groupedConfigData = useMemo(
    () =>
      config.data.reduce((acc, curr) => {
        if (!curr.graphGroup) {
          acc.push({
            groupLabel: curr.label || observations.find((o) => o.conceptUuid == curr.concept)?.code.text,
            concepts: [curr],
          });
        } else if (acc.find((a) => a.groupLabel == curr.graphGroup)) {
          acc.find((a) => a.groupLabel == curr.graphGroup).concepts.push(curr);
        } else {
          acc.push({
            groupLabel: curr.graphGroup,
            concepts: [curr],
          });
        }
        return acc;
      }, [] as ConceptGroupDescriptor[]),
    [config.data, observations],
  );

  const [selectedMenuItem, setSelectedMenuItem] = React.useState<ConceptGroupDescriptor>(groupedConfigData[0]);

  const chartDataForConcepts = useCallback(
    (concepts: ConfigObjectSwitchable['data']) => {
      const chartRecords = observations
        .filter((obs) => concepts.some((c) => c.concept == obs.conceptUuid) && obs.dataType === 'Number')
        .map((obs) => ({
          group: obs.code.text,
          key: formatDate(new Date(obs.effectiveDateTime), { year: true, time: false }),
          value: obs.valueQuantity.value,
        }));

      if (config.graphOldestFirst) {
        chartRecords.reverse();
      }

      return chartRecords;
    },
    [observations, config.graphOldestFirst],
  );

  const chartColors = Object.fromEntries(selectedMenuItem.concepts.map((d) => [d.label, d.color]));

  const chartOptions = {
    axes: {
      bottom: {
        title: 'Date',
        mapsTo: 'key',
        scaleType: ScaleTypes.LABELS,
      },
      left: {
        mapsTo: 'value',
        title: selectedMenuItem.groupLabel,
        scaleType: ScaleTypes.LINEAR,
        includeZero: false,
      },
    },
    legend: {
      enabled: false,
    },
    color: {
      scale: chartColors,
    },
    height: '400px',
  };

  return (
    <>
      <div className={styles.graphContainer}>
        <div className={styles.conceptPickerTabs}>
          <div className={styles.verticalTabs}>
            <TabsVertical>
              <TabListVertical aria-label="Obs tabs">
                {groupedConfigData.map(({ groupLabel }, index) => {
                  const tabClasses = classNames(styles.tab, styles.bodyLong01, {
                    [styles.selectedTab]: selectedMenuItem.groupLabel === groupLabel,
                  });

                  return (
                    <Tab
                      className={tabClasses}
                      key={groupLabel}
                      onClick={() => setSelectedMenuItem(groupedConfigData[index])}
                    >
                      {groupLabel}
                    </Tab>
                  );
                })}
              </TabListVertical>
              <TabPanels>
                {groupedConfigData.map(({ groupLabel, concepts }) => (
                  <TabPanel key={groupLabel}>
                    <LineChart data={chartDataForConcepts(concepts).flat()} options={chartOptions} />
                  </TabPanel>
                ))}
              </TabPanels>
            </TabsVertical>
          </div>
        </div>
      </div>
      {config.interpretationSlot ? (
        <div>
          <ExtensionSlot name={config.interpretationSlot} style={{ gridTemplateColumns: '1fr' }} />
        </div>
      ) : null}
    </>
  );
};

export default ObsGraph;
