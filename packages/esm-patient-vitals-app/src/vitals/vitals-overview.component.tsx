import React from 'react';
import dayjs from 'dayjs';
import Add16 from '@carbon/icons-react/es/add/16';
import ChartLineSmooth16 from '@carbon/icons-react/es/chart--line-smooth/16';
import Table16 from '@carbon/icons-react/es/table/16';
import Button from 'carbon-components-react/es/components/Button';
import DataTableSkeleton from 'carbon-components-react/es/components/DataTableSkeleton';
import styles from './vitals-overview.scss';
import VitalsChart from './vitals-chart.component';
import { EmptyState, ErrorState } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import { useConfig, attach } from '@openmrs/esm-framework';
import { useVitalsSignsConceptMetaData, withUnit } from './vitals-biometrics-form/use-vitalsigns';
import { patientVitalsBiometricsFormWorkspace } from '../constants';
import { PatientVitals, performPatientsVitalsSearch } from './vitals-biometrics.resource';
import VitalsPagination from './vitalsPagination.component';

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

  const config = useConfig();
  const { conceptsUnits } = useVitalsSignsConceptMetaData();
  const [bloodPressureUnit, , temperatureUnit, , , pulseUnit, oxygenSaturationUnit, , respiratoryRateUnit] =
    conceptsUnits;
  const [vitals, setVitals] = React.useState<Array<PatientVitals>>(null);
  const [chartView, setChartView] = React.useState<boolean>();
  const [error, setError] = React.useState(null);

  const tableHeaders = [
    { key: 'date', header: 'Date and time', isSortable: true },
    {
      key: 'bloodPressure',
      header: withUnit('BP', bloodPressureUnit),
    },
    {
      key: 'respiratoryRate',
      header: withUnit('R. Rate', respiratoryRateUnit),
    },
    { key: 'pulse', header: withUnit('Pulse', pulseUnit) },
    {
      key: 'spo2',
      header: withUnit('SPO2', oxygenSaturationUnit),
    },
    {
      key: 'temperature',
      header: withUnit('Temp', temperatureUnit),
    },
  ];

  const launchVitalsBiometricsForm = React.useCallback(
    () => attach('patient-chart-workspace-slot', patientVitalsBiometricsFormWorkspace),
    [],
  );

  React.useEffect(() => {
    if (patientUuid) {
      const subscription = performPatientsVitalsSearch(config.concepts, patientUuid, 100).subscribe(
        (vitals) => {
          setVitals(vitals);
        },
        (err) => setError(err),
      );
      return () => subscription.unsubscribe();
    }
  }, [patientUuid, config.concepts]);

  const tableRows = React.useMemo(
    () =>
      vitals
        ?.sort((a, b) => (b.date > a.date ? 1 : -1))
        .map((vital, index) => {
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
        if (tableRows && !tableRows?.length)
          return (
            <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={launchVitalsBiometricsForm} />
          );
        if (error) return <ErrorState error={error} headerTitle={headerTitle} />;
        if (tableRows?.length) {
          return (
            <div className={styles.vitalsWidgetContainer}>
              <div className={styles.vitalsHeaderContainer}>
                <h4 className={`${styles.productiveHeading03} ${styles.text02}`}>{headerTitle}</h4>
                <div className={styles.toggleButtons}>
                  <Button
                    className={styles.toggle}
                    size="field"
                    kind={chartView ? 'ghost' : 'secondary'}
                    hasIconOnly
                    renderIcon={Table16}
                    iconDescription={t('tableView', 'Table View')}
                    onClick={() => setChartView(false)}
                  />
                  <Button
                    className={styles.toggle}
                    size="field"
                    kind={chartView ? 'secondary' : 'ghost'}
                    hasIconOnly
                    renderIcon={ChartLineSmooth16}
                    iconDescription={t('chartView', 'Chart View')}
                    onClick={() => setChartView(true)}
                  />
                </div>
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
              {chartView ? (
                <VitalsChart patientVitals={vitals} conceptsUnits={conceptsUnits} />
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
        return <DataTableSkeleton rowCount={pageSize} />;
      })()}
    </>
  );
};

export default VitalsOverview;
