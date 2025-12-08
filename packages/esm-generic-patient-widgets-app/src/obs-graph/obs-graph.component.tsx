import React, { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import { Tab, TabListVertical, TabPanel, TabPanels, TabsVertical } from '@carbon/react';
import { LineChart, type LineChartOptions, ScaleTypes } from '@carbon/charts-react';
import { ExtensionSlot, formatDate, useConfig } from '@openmrs/esm-framework';
import { type ConfigObjectSwitchable } from '../config-schema-obs-switchable';
import { useObs } from '../resources/useObs';
import styles from './obs-graph.scss';
import { useTranslation } from 'react-i18next';

interface ConceptGroupDescriptor {
  groupLabel: string;
  concepts: ConfigObjectSwitchable['data'];
}

interface ObsGraphProps {
  patientUuid: string;
}

const ObsGraph: React.FC<ObsGraphProps> = ({ patientUuid }) => {
  const config = useConfig<ConfigObjectSwitchable>();
  const { t } = useTranslation();
  const {
    data: { observations, concepts },
  } = useObs(patientUuid);

  const obsByConceptUuid = useMemo(() => {
    return Object.fromEntries(
      config.data
        .map((c) => c.concept)
        .map((conceptUuid) => [conceptUuid, observations.filter((o) => o.conceptUuid == conceptUuid)]),
    );
  }, [config.data, observations]);

  const configByConceptUuid = useMemo(() => {
    return Object.fromEntries(
      observations.map((o) => [o.conceptUuid, config.data.find((c) => c.concept == o.conceptUuid)]),
    );
  }, [observations, config.data]);

  const groupedConfigData = useMemo(
    () =>
      config.data
        .filter((c) => {
          const obs = obsByConceptUuid[c.concept][0];
          return obs && obs.dataType === 'Numeric';
        })
        .reduce((acc, curr) => {
          if (!curr.graphGroup) {
            acc.push({
              groupLabel: curr.label || concepts.find((c) => c.uuid == curr.concept)?.display,
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
    [config.data, obsByConceptUuid, concepts],
  );

  const [selectedMenuItem, setSelectedMenuItem] = useState<ConceptGroupDescriptor>(groupedConfigData[0]);

  const chartDataForConcepts = useCallback(
    (concepts: ConfigObjectSwitchable['data']) => {
      const chartRecords = concepts
        .map((c) => obsByConceptUuid[c.concept])
        .flat()
        .map((obs) => ({
          group: configByConceptUuid[obs.conceptUuid].label
            ? t(configByConceptUuid[obs.conceptUuid].label, configByConceptUuid[obs.conceptUuid].label)
            : obs.code.text,
          key: new Date(obs.effectiveDateTime),
          value: obs.valueQuantity.value,
        }));

      if (config.graphOldestFirst) {
        chartRecords.reverse();
      }

      return chartRecords;
    },
    [obsByConceptUuid, configByConceptUuid, config.graphOldestFirst, t],
  );

  const chartColors = useMemo(
    () => Object.fromEntries(selectedMenuItem.concepts.map((d) => [d.label, d.color])),
    [selectedMenuItem.concepts],
  );

  const chartOptions: LineChartOptions = useMemo(() => {
    return {
      title: t(selectedMenuItem.groupLabel),
      axes: {
        bottom: {
          title: t('date', 'Date'),
          mapsTo: 'key',
          scaleType: ScaleTypes.TIME,
          ticks: {
            formatter: (value: Date) => formatDate(value, { year: true, time: false }),
          },
        },
        left: {
          mapsTo: 'value',
          title: t(selectedMenuItem.groupLabel),
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
      tooltip: {
        alwaysShowRulerTooltip: true,
        showTotal: false,
        valueFormatter: (value: any, label: string) =>
          label == t('date', 'Date') ? formatDate(value, { year: true, time: true }) : value.toString(),
        truncation: {
          numCharacter: 40,
        },
      },
      toolbar: {
        enabled: true,
        numberOfIcons: 4,
        controls: [
          {
            type: 'Zoom in',
          },
          {
            type: 'Zoom out',
          },
          {
            type: 'Reset zoom',
          },
          {
            type: 'Export as CSV',
          },
          {
            type: 'Export as PNG',
          },
          {
            type: 'Make fullscreen',
          },
        ],
      },
      zoomBar: {
        top: {
          enabled: true,
        },
      },
      height: '400px',
    };
  }, [selectedMenuItem.groupLabel, t, chartColors]);

  return (
    <>
      <div className={styles.graphWidgetContainer}>
        {groupedConfigData.length > 1 ? (
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
                        {t(groupLabel, groupLabel)}
                      </Tab>
                    );
                  })}
                </TabListVertical>
                <TabPanels>
                  {groupedConfigData.map(({ groupLabel, concepts }) => (
                    <TabPanel key={groupLabel}>
                      <div className={styles.lineChartContainer}>
                        <LineChart data={chartDataForConcepts(concepts)} options={chartOptions} />
                      </div>
                    </TabPanel>
                  ))}
                </TabPanels>
              </TabsVertical>
            </div>
          </div>
        ) : (
          <div className={styles.lineChartContainer}>
            <LineChart data={chartDataForConcepts(selectedMenuItem.concepts)} options={chartOptions} />
          </div>
        )}
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
