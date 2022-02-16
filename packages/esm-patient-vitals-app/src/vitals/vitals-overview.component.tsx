import React from 'react';
import Add16 from '@carbon/icons-react/es/add/16';
import ChartLineSmooth16 from '@carbon/icons-react/es/chart--line-smooth/16';
import Table16 from '@carbon/icons-react/es/table/16';
import styles from './vitals-overview.scss';
import VitalsChart from './vitals-chart.component';
import VitalsPagination from './vitals-pagination.component';
import { DataTableSkeleton, Button, InlineLoading } from 'carbon-components-react';
import {
  CardHeader,
  EmptyState,
  ErrorState,
  launchPatientWorkspace,
  useVitalsConceptMetadata,
  withUnit,
} from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import { patientVitalsBiometricsFormWorkspace } from '../constants';
import { useVitals } from './vitals.resource';
import { ConfigObject } from '../config-schema';
import { formatDate, parseDate, useConfig } from '@openmrs/esm-framework';

interface VitalsOverviewProps {
  patientUuid: string;
  showAddVitals: boolean;
  pageSize: number;
  urlLabel: string;
  pageUrl: string;
}

const VitalsOverview: React.FC<VitalsOverviewProps> = ({ patientUuid, showAddVitals, pageSize, urlLabel, pageUrl }) => {
  const { t } = useTranslation();
  const config = useConfig() as ConfigObject;
  const displayText = t('vitalSigns', 'Vital signs');
  const headerTitle = t('vitals', 'Vitals');
  const [chartView, setChartView] = React.useState<boolean>();

  const { data: vitals, isError, isLoading, isValidating } = useVitals(patientUuid);
  const { data: conceptUnits } = useVitalsConceptMetadata();

  const launchVitalsBiometricsForm = React.useCallback(
    () => launchPatientWorkspace(patientVitalsBiometricsFormWorkspace),
    [],
  );

  const tableHeaders = [
    { key: 'date', header: 'Date and time', isSortable: true },
    {
      key: 'bloodPressure',
      header: withUnit('BP', conceptUnits.get(config.concepts.systolicBloodPressureUuid) ?? ''),
    },
    {
      key: 'respiratoryRate',
      header: withUnit('R. Rate', conceptUnits.get(config.concepts.respiratoryRateUuid) ?? ''),
    },
    { key: 'pulse', header: withUnit('Pulse', conceptUnits.get(config.concepts.pulseUuid) ?? '') },
    {
      key: 'spo2',
      header: withUnit('SPO2', conceptUnits.get(config.concepts.oxygenSaturationUuid) ?? ''),
    },
    {
      key: 'temperature',
      header: withUnit('Temp', conceptUnits.get(config.concepts.temperatureUuid) ?? ''),
    },
  ];

  const tableRows = React.useMemo(
    () =>
      vitals?.map((vital, index) => {
        return {
          id: `${index}`,
          date: formatDate(parseDate(vital.date.toString()), { mode: 'wide', time: true }),
          bloodPressure: `${vital.systolic ?? '-'} / ${vital.diastolic ?? '-'}`,
          pulse: vital.pulse,
          spo2: vital.oxygenSaturation,
          temperature: vital.temperature,
          respiratoryRate: vital.respiratoryRate,
        };
      }),
    [vitals],
  );

  return (
    <>
      {(() => {
        if (isLoading) return <DataTableSkeleton role="progressbar" />;
        if (isError) return <ErrorState error={isError} headerTitle={headerTitle} />;
        if (vitals?.length) {
          return (
            <div className={styles.widgetCard}>
              <CardHeader title={headerTitle}>
                <div className={styles.backgroundDataFetchingIndicator}>
                  <span>{isValidating ? <InlineLoading /> : null}</span>
                </div>
                <div className={styles.vitalsHeaderActionItems}>
                  <div className={styles.toggleButtons}>
                    <Button
                      className={styles.toggle}
                      size="field"
                      kind={chartView ? 'ghost' : 'tertiary'}
                      hasIconOnly
                      renderIcon={Table16}
                      iconDescription={t('tableView', 'Table View')}
                      onClick={() => setChartView(false)}
                    />
                    <Button
                      className={styles.toggle}
                      size="field"
                      kind={chartView ? 'tertiary' : 'ghost'}
                      hasIconOnly
                      renderIcon={ChartLineSmooth16}
                      iconDescription={t('chartView', 'Chart View')}
                      onClick={() => setChartView(true)}
                    />
                  </div>
                  <span className={styles.divider}>|</span>
                  {showAddVitals && (
                    <Button
                      kind="ghost"
                      renderIcon={Add16}
                      iconDescription="Add vitals"
                      onClick={launchVitalsBiometricsForm}
                    >
                      {t('add', 'Add')}
                    </Button>
                  )}
                </div>
              </CardHeader>
              {chartView ? (
                <VitalsChart patientVitals={vitals} conceptUnits={conceptUnits} config={config} />
              ) : (
                <VitalsPagination
                  tableRows={tableRows}
                  pageSize={pageSize}
                  urlLabel={urlLabel}
                  pageUrl={pageUrl}
                  tableHeaders={tableHeaders}
                />
              )}
            </div>
          );
        }
        return (
          <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={launchVitalsBiometricsForm} />
        );
      })()}
    </>
  );
};

export default VitalsOverview;
