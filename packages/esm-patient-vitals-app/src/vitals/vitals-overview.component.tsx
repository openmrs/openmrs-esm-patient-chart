import React from 'react';
import dayjs from 'dayjs';
import Add16 from '@carbon/icons-react/es/add/16';
import ChartLineSmooth16 from '@carbon/icons-react/es/chart--line-smooth/16';
import Table16 from '@carbon/icons-react/es/table/16';
import styles from './vitals-overview.scss';
import VitalsChart from './vitals-chart.component';
import VitalsPagination from './vitals-pagination.component';
import { DataTableSkeleton, Button, InlineLoading } from 'carbon-components-react';
import {
  EmptyState,
  ErrorState,
  launchPatientWorkspace,
  useVitalsConceptMetadata,
  withUnit,
} from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import { attach } from '@openmrs/esm-framework';
import { patientVitalsBiometricsFormWorkspace } from '../constants';
import { useVitals } from './vitals.resource';

interface VitalsOverviewProps {
  patientUuid: string;
  showAddVitals: boolean;
  pageSize: number;
  urlLabel: string;
  pageUrl: string;
}

const VitalsOverview: React.FC<VitalsOverviewProps> = ({ patientUuid, showAddVitals, pageSize, urlLabel, pageUrl }) => {
  const { t } = useTranslation();
  const displayText = t('vitalSigns', 'Vital signs');
  const headerTitle = t('vitals', 'Vitals');
  const [chartView, setChartView] = React.useState<boolean>();

  const { data: vitals, isError, isLoading, isValidating } = useVitals(patientUuid);
  const { data: conceptData } = useVitalsConceptMetadata();
  const conceptUnits = conceptData ? conceptData.conceptUnits : null;

  const launchVitalsBiometricsForm = React.useCallback(
    () => launchPatientWorkspace(patientVitalsBiometricsFormWorkspace),
    [],
  );

  const tableHeaders = [
    { key: 'date', header: 'Date and time', isSortable: true },
    {
      key: 'bloodPressure',
      header: withUnit('BP', conceptUnits?.[0] ?? ''),
    },
    {
      key: 'respiratoryRate',
      header: withUnit('R. Rate', conceptUnits?.[8] ?? ''),
    },
    { key: 'pulse', header: withUnit('Pulse', conceptUnits?.[5] ?? '') },
    {
      key: 'spo2',
      header: withUnit('SPO2', conceptUnits?.[6] ?? ''),
    },
    {
      key: 'temperature',
      header: withUnit('Temp', conceptUnits?.[2] ?? ''),
    },
  ];

  const tableRows = React.useMemo(
    () =>
      vitals?.map((vital, index) => {
        return {
          id: `${index}`,
          date: dayjs(vital.date).format(`DD - MMM - YYYY, hh:mm`),
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
            <div className={styles.vitalsWidgetContainer}>
              <div className={styles.vitalsHeaderContainer}>
                <h4>{headerTitle}</h4>
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
                      onClick={launchVitalsBiometricsForm}>
                      {t('add', 'Add')}
                    </Button>
                  )}
                </div>
              </div>
              {chartView ? (
                <VitalsChart patientVitals={vitals} conceptUnits={conceptUnits} />
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
