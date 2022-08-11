import React, { useMemo } from 'react';
import styles from './obs-graph.scss';
import { useTranslation } from 'react-i18next';
import { Tab, Tabs } from 'carbon-components-react';
import { LineChart } from '@carbon/charts-react';
import { LineChartOptions } from '@carbon/charts/interfaces/charts';
import { ScaleTypes } from '@carbon/charts/interfaces/enums';
import '@carbon/charts/styles.css';
import { formatDate, useConfig } from '@openmrs/esm-framework';
import { useObs } from '../resources/useObs';

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

  const chartData = useMemo(
    () =>
      obss
        .filter((obs) => obs.conceptUuid === selectedConcept.uuid && obs.dataType === 'Number')
        .map((obs) => ({
          group: selectedConcept.label,
          key: formatDate(new Date(obs.issued), { year: false, time: false }),
          value: obs.valueQuantity.value,
        })),
    [obss, selectedConcept.uuid, selectedConcept.label],
  );

  const chartColors = Object.fromEntries(config.data.map((d) => [d.label, d.color]));

  const chartOptions: LineChartOptions = {
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
  };

  return (
    <div className={styles.graphContainer}>
      <div className={styles.conceptPickerTabs} style={{ flex: 1 }}>
        <label className={styles.conceptLabel} htmlFor="concept-tab-group">
          {t('displaying', 'Displaying')}
        </label>
        <Tabs id="concept-tab-group" className={styles.verticalTabs} type="default">
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
                label={label}
              />
            );
          })}
        </Tabs>
      </div>
      <div className={styles.lineChartContainer} style={{ flex: 4 }}>
        <LineChart data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default ObsGraph;
