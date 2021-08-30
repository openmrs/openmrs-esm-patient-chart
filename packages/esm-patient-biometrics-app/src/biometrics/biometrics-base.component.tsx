import React from 'react';
import dayjs from 'dayjs';
import Add16 from '@carbon/icons-react/es/add/16';
import ChartLineSmooth16 from '@carbon/icons-react/es/chart--line-smooth/16';
import Table16 from '@carbon/icons-react/es/table/16';
import styles from './biometrics-overview.scss';
import Button from 'carbon-components-react/es/components/Button';
import DataTableSkeleton from 'carbon-components-react/es/components/DataTableSkeleton';
import BiometricsChart from './biometrics-chart.component';
import { useTranslation } from 'react-i18next';
import { EmptyState, ErrorState } from '@openmrs/esm-patient-common-lib';
import { attach, useConfig } from '@openmrs/esm-framework';
import { getPatientBiometrics } from './biometric.resource';
import { useVitalsSignsConceptMetaData } from './use-vitalsigns';
import { ConfigObject } from '../config-schema';
import { patientVitalsBiometricsFormWorkspace } from '../constants';
import BiometricsPagination from './biometricsPagination.component';

interface RenderBiometricsProps {
  headerTitle: string;
  tableRows: Array<PatientBiometrics>;
  bmiUnit: string;
  biometrics: Array<any>;
  showAddBiometrics: boolean;
  pageSize: number;
  urlLabel: string;
  pageUrl: string;
}

const RenderBiometrics: React.FC<RenderBiometricsProps> = ({
  headerTitle,
  tableRows,
  bmiUnit,
  showAddBiometrics,
  biometrics,
  pageSize,
  urlLabel,
  pageUrl,
}) => {
  const { t } = useTranslation();
  const { conceptsUnits } = useVitalsSignsConceptMetaData();
  const displayText = t('biometrics', 'biometrics');
  const [, , , heightUnit, weightUnit, , , muacUnit] = conceptsUnits;
  const [chartView, setChartView] = React.useState<boolean>();

  const tableHeaders = [
    { key: 'date', header: 'Date and time' },
    { key: 'weight', header: `Weight (${weightUnit})` },
    { key: 'height', header: `Height (${heightUnit})` },
    { key: 'bmi', header: `BMI (${bmiUnit})` },
    { key: 'muac', header: `MUAC (${muacUnit})` },
  ];

  const launchBiometricsForm = React.useCallback(() => {
    attach('patient-chart-workspace-slot', patientVitalsBiometricsFormWorkspace);
  }, []);

  if (tableRows.length) {
    return (
      <div className={styles.biometricsWidgetContainer}>
        <div className={styles.biometricsHeaderContainer}>
          <h4 className={`${styles.productiveHeading03} ${styles.text02}`}>{headerTitle}</h4>
          <div className={styles.toggleButtons}>
            <Button
              className={styles.toggle}
              size="field"
              hasIconOnly
              kind={chartView ? 'ghost' : 'secondary'}
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
          {showAddBiometrics && (
            <Button kind="ghost" renderIcon={Add16} iconDescription="Add biometrics" onClick={launchBiometricsForm}>
              {t('add', 'Add')}
            </Button>
          )}
        </div>
        {chartView ? (
          <BiometricsChart patientBiometrics={biometrics} conceptsUnits={conceptsUnits} />
        ) : (
          <BiometricsPagination
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
  return <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={launchBiometricsForm} />;
};

export interface PatientBiometrics {
  id: string;
  date: string;
  weight: number;
  height: number;
  bmi: number;
  muac: number;
}

interface BiometricsBaseProps {
  patientUuid: string;
  showAddBiometrics: boolean;
  pageSize: number;
  urlLabel: string;
  pageUrl: string;
}

const BiometricsBase: React.FC<BiometricsBaseProps> = ({
  patientUuid,
  showAddBiometrics,
  pageSize,
  urlLabel,
  pageUrl,
}) => {
  const config = useConfig() as ConfigObject;
  const { bmiUnit } = config.biometrics;
  const { t } = useTranslation();
  const [biometrics, setBiometrics] = React.useState<Array<any>>();
  const [error, setError] = React.useState(null);
  const headerTitle = t('biometrics', 'Biometrics');

  React.useEffect(() => {
    if (patientUuid) {
      const sub = getPatientBiometrics(
        config.concepts.weightUuid,
        config.concepts.heightUuid,
        patientUuid,
        config.concepts.muacUuid,
      ).subscribe(setBiometrics, setError);
      return () => sub.unsubscribe();
    }
  }, [patientUuid, config.concepts.weightUuid, config.concepts.heightUuid, config.concepts.muacUuid]);

  const tableRows = React.useMemo(
    () =>
      biometrics?.map((biometric: PatientBiometrics, index) => {
        return {
          id: `${index}`,
          date: dayjs(biometric.date).format(`DD - MMM - YYYY, hh:mm`),
          weight: biometric.weight,
          height: biometric.height,
          bmi: biometric.bmi,
          muac: biometric.muac,
        };
      }),
    [biometrics],
  );

  return (
    <>
      {tableRows ? (
        <RenderBiometrics
          headerTitle={headerTitle}
          biometrics={biometrics}
          tableRows={tableRows}
          showAddBiometrics={showAddBiometrics}
          bmiUnit={bmiUnit}
          pageSize={pageSize}
          urlLabel={urlLabel}
          pageUrl={pageUrl}
        />
      ) : error ? (
        <ErrorState error={error} headerTitle={headerTitle} />
      ) : (
        <DataTableSkeleton rowCount={pageSize} />
      )}
    </>
  );
};

export default BiometricsBase;
