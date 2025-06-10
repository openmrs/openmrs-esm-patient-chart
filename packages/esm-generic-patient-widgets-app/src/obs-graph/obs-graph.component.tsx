import React, { useMemo } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Tab, TabListVertical, TabPanel, TabPanels, TabsVertical, Tabs } from '@carbon/react';
import { LineChart, ScaleTypes } from '@carbon/charts-react';
import { ExtensionSlot, formatDate, useConfig } from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';
import { useObs } from '../resources/useObs';
import styles from './obs-graph.scss';

interface ConceptDescriptor {
  label: string;
  uuid: string;
}

interface ObsGraphProps {
  patientUuid: string;
}

const ObsGraph: React.FC<ObsGraphProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const config = useConfig<ConfigObject>();
  const { data: observations } = useObs(patientUuid);

  const [selectedConcept, setSelectedConcept] = React.useState<ConceptDescriptor>({
    label: config.data[0]?.label,
    uuid: config.data[0]?.concept,
  });

  const chartData = useMemo(() => {
    const chartRecords = observations
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
  }, [observations, config.graphOldestFirst, selectedConcept.uuid, selectedConcept.label]);

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
          <div className={styles.verticalTabs}>
            <TabsVertical>
              <TabListVertical aria-label="Obs tabs">
                {config.data.map(({ concept, label }, index) => {
                  const tabClasses = classNames(styles.tab, styles.bodyLong01, {
                    [styles.selectedTab]: selectedConcept.label === label,
                  });

                  return (
                    <Tab
                      className={tabClasses}
                      key={concept}
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
              </TabListVertical>
              <TabPanels>
                {config.data.map(({ concept, label }) => (
                  <TabPanel key={concept}>
                    <LineChart data={chartData.flat()} options={chartOptions} />
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
