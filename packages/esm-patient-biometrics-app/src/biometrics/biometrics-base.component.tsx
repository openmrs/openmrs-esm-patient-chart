import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, DataTableSkeleton, InlineLoading } from '@carbon/react';
import { Add, ChartLineSmooth, Table } from '@carbon/react/icons';
import { formatDatetime, parseDate, useConfig } from '@openmrs/esm-framework';
import {
  CardHeader,
  EmptyState,
  ErrorState,
  useVitalsConceptMetadata,
  launchPatientWorkspace,
  withUnit,
} from '@openmrs/esm-patient-common-lib';
import { ConfigObject } from '../config-schema';
import { patientVitalsBiometricsFormWorkspace } from '../constants';
import { useBiometrics } from './biometrics.resource';
import BiometricsChart from './biometrics-chart.component';
import PaginatedBiometrics from './paginated-biometrics.component';
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
  const { biometrics, isLoading, isError, isValidating } = useBiometrics(patientUuid, config.concepts);
  const { data: conceptUnits } = useVitalsConceptMetadata();

  const launchBiometricsForm = React.useCallback(
    () => launchPatientWorkspace(patientVitalsBiometricsFormWorkspace),
    [],
  );

  const tableHeaders = [
    { key: 'date', header: 'Date and time' },
    { key: 'weight', header: withUnit('Weight', conceptUnits.get(config.concepts.weightUuid) ?? '') },
    { key: 'height', header: withUnit('Height', conceptUnits.get(config.concepts.heightUuid) ?? '') },
    { key: 'bmi', header: `BMI (${bmiUnit})` },
    { key: 'muac', header: withUnit('MUAC', conceptUnits.get(config.concepts.muacUuid) ?? '') },
  ];

  const tableRows = React.useMemo(
    () =>
      biometrics?.map((biometricsData, index) => {
        return {
          ...biometricsData,
          id: `${index}`,
          date: formatDatetime(parseDate(biometricsData.date.toString()), { mode: 'wide' }),
          weight: biometricsData.weight ?? '--',
          height: biometricsData.height ?? '--',
          bmi: biometricsData.bmi ?? '--',
          muac: biometricsData.muac ?? '--',
        };
      }),
    [biometrics],
  );

  if (isLoading) return <DataTableSkeleton role="progressbar" />;
  if (isError) return <ErrorState error={isError} headerTitle={headerTitle} />;
  if (biometrics?.length) {
    return (
      <div className={styles.widgetCard}>
        <CardHeader title={headerTitle}>
          <div className={styles.backgroundDataFetchingIndicator}>
            <span>{isValidating ? <InlineLoading /> : null}</span>
          </div>
          <div className={styles.biometricsHeaderActionItems}>
            <div className={styles.toggleButtons}>
              <Button
                className={styles.tableViewToggle}
                size="sm"
                hasIconOnly
                kind={chartView ? 'ghost' : 'tertiary'}
                renderIcon={(props) => <Table size={16} {...props} />}
                iconDescription={t('tableView', 'Table View')}
                onClick={() => setChartView(false)}
              />
              <Button
                className={styles.chartViewToggle}
                size="sm"
                kind={chartView ? 'tertiary' : 'ghost'}
                hasIconOnly
                renderIcon={(props) => <ChartLineSmooth size={16} {...props} />}
                iconDescription={t('chartView', 'Chart View')}
                onClick={() => setChartView(true)}
              />
            </div>
            <span className={styles.divider}>|</span>
            {showAddBiometrics && (
              <Button
                kind="ghost"
                renderIcon={(props) => <Add size={16} {...props} />}
                iconDescription="Add biometrics"
                onClick={launchBiometricsForm}
              >
                {t('add', 'Add')}
              </Button>
            )}
          </div>
        </CardHeader>
        {chartView ? (
          <BiometricsChart patientBiometrics={biometrics} conceptUnits={conceptUnits} config={config} />
        ) : (
          <PaginatedBiometrics
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
