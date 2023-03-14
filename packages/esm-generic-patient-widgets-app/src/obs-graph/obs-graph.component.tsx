import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Tab, Tabs, TabList } from '@carbon/react';
import { LineChart } from '@carbon/charts-react';
import { ExtensionSlot, formatDate, useConfig } from '@openmrs/esm-framework';
import { useObs } from '../resources/useObs';
import styles from './obs-graph.scss';

enum ScaleTypes {
  TIME = 'time',
  LINEAR = 'linear',
  LOG = 'log',
  LABELS = 'labels',
  LABELS_RATIO = 'labels-ratio',
}

interface ConceptDescriptor {
  label: string;
  uuid: string;
}

interface ObsGraphProps {
  patientUuid: string;
}

const ObsGraph: React.FC<ObsGraphProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const config = useConfig();
  const { data: obss, error, isLoading, isValidating } = useObs(patientUuid);

  const [selectedConcept, setSelectedConcept] = React.useState<ConceptDescriptor>({
    label: config.data[0]?.label,
    uuid: config.data[0]?.concept,
  });

  const chartData = useMemo(() => {
    const chartRecords = obss
      .filter((obs) => obs.conceptUuid === selectedConcept.uuid && obs.dataType === 'Number')
      .map((obs) => ({
        group: selectedConcept.label,
        key: formatDate(new Date(obs.effectiveDateTime), { year: true, time: false }),
        value: obs.valueQuantity.value,
      }));

    if (config.graphOldestFirst) {
      chartRecords.reverse();
    }
    return chartRecords;
  }, [obss, config.graphOldestFirst, selectedConcept.uuid, selectedConcept.label]);

  const chartColors = Object.fromEntries(config.data.map((d) => [d.label, d.color]));

  const chartOptions = {
    axes: {
      bottom: {
        title: 'Date',
        mapsTo: 'key',
        scaleType: ScaleTypes.LABELS,
      },
      left: {
        mapsTo: 'value',
        title: selectedConcept.label,
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
          <label className={styles.conceptLabel} htmlFor="concept-tab-group">
            {t('displaying', 'Displaying')}
          </label>
          <Tabs id="concept-tab-group" className={styles.verticalTabs} type="default">
            <TabList className={styles.tablist} aria-label="Obs tabs">
              {config.data.map(({ concept, label }, index) => {
                return (
                  <Tab
                    key={index}
                    className={`${styles.tab} ${styles.bodyLong01} ${
                      selectedConcept.label === label && styles.selectedTab
                    }`}
                    onClick={() =>
                      setSelectedConcept({
                        label,
                        uuid: concept,
                      })
                    }
                  >
                    {label}
                  </Tab>
                );
              })}
            </TabList>
          </Tabs>
        </div>
        <div className={styles.lineChartContainer}>
          <LineChart data={chartData.flat()} options={chartOptions} />
        </div>
      </div>
      {config.interpretationSlot ? (
        <div>
          <ExtensionSlot extensionSlotName={config.interpretationSlot} style={{ gridTemplateColumns: '1fr' }} />
        </div>
      ) : null}
    </>
  );
};

export default ObsGraph;
