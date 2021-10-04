import React from 'react';
import dayjs from 'dayjs';
import Add16 from '@carbon/icons-react/es/add/16';
import ChartLineSmooth16 from '@carbon/icons-react/es/chart--line-smooth/16';
import Table16 from '@carbon/icons-react/es/table/16';
import BiometricsChart from './biometrics-chart.component';
import BiometricsPagination from './biometrics-pagination.component';
import { Button, DataTableSkeleton, InlineLoading } from 'carbon-components-react';
import { useTranslation } from 'react-i18next';
import { EmptyState, ErrorState, useVitalsConceptMetadata, withUnit } from '@openmrs/esm-patient-common-lib';
import { attach, useConfig } from '@openmrs/esm-framework';
import { useBiometrics } from './biometrics.resource';
import { ConfigObject } from '../config-schema';
import { patientVitalsBiometricsFormWorkspace } from '../constants';
import styles from './biometrics-overview.scss';

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
  const { t } = useTranslation();
  const displayText = t('biometrics', 'biometrics');
  const headerTitle = t('biometrics', 'Biometrics');
  const [chartView, setChartView] = React.useState(false);

  const config = useConfig() as ConfigObject;
  const { bmiUnit } = config.biometrics;

  const { data: conceptData } = useVitalsConceptMetadata();
  const conceptUnits = conceptData ? conceptData.conceptUnits : null;

  const { data: biometrics, isLoading, isError, isValidating } = useBiometrics(patientUuid);

  const launchBiometricsForm = React.useCallback(() => {
    attach('patient-chart-workspace-slot', patientVitalsBiometricsFormWorkspace);
  }, []);

  const tableHeaders = [
    { key: 'date', header: 'Date and time' },
    { key: 'weight', header: withUnit('Weight', conceptUnits?.[3] ?? '') },
    { key: 'height', header: withUnit('Weight', conceptUnits?.[4] ?? '') },
    { key: 'bmi', header: `BMI (${bmiUnit})` },
    { key: 'muac', header: withUnit('MUAC', conceptUnits?.[7] ?? '') },
  ];
  const tableRows = React.useMemo(
    () =>
      biometrics?.map((data, index) => {
        return {
          ...data,
          id: `${index}`,
          date: dayjs(data.date).format(`DD - MMM - YYYY, hh:mm`),
        };
      }),
    [biometrics],
  );

  if (isLoading) return <DataTableSkeleton role="progressbar" />;
  if (isError) return <ErrorState error={isError} headerTitle={headerTitle} />;
  if (biometrics?.length) {
    return (
      <div className={styles.biometricsWidgetContainer}>
        <div className={styles.biometricsHeaderContainer}>
          <h4 className={`${styles.productiveHeading03} ${styles.text02}`}>{headerTitle}</h4>
          <div className={styles.backgroundDataFetchingIndicator}>
            <span>{isValidating ? <InlineLoading /> : null}</span>
          </div>
          <div className={styles.biometricsHeaderActionItems}>
            <div className={styles.toggleButtons}>
              <Button
                className={styles.toggle}
                size="field"
                hasIconOnly
                kind={chartView ? 'ghost' : 'tertiary'}
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
            {showAddBiometrics && (
              <Button kind="ghost" renderIcon={Add16} iconDescription="Add biometrics" onClick={launchBiometricsForm}>
                {t('add', 'Add')}
              </Button>
            )}
          </div>
        </div>
        {chartView ? (
          <BiometricsChart patientBiometrics={biometrics} conceptsUnits={conceptUnits} />
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

export default BiometricsBase;
