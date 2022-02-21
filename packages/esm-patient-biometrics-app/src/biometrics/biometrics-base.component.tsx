import React from 'react';
import Add16 from '@carbon/icons-react/es/add/16';
import ChartLineSmooth16 from '@carbon/icons-react/es/chart--line-smooth/16';
import Table16 from '@carbon/icons-react/es/table/16';
import BiometricsChart from './biometrics-chart.component';
import BiometricsPagination from './biometrics-pagination.component';
import { Button, DataTableSkeleton, InlineLoading } from 'carbon-components-react';
import { useTranslation } from 'react-i18next';
import { formatDatetime, parseDate, useConfig } from '@openmrs/esm-framework';
import { useBiometrics } from './biometrics.resource';
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
      biometrics?.map((data, index) => {
        return {
          ...data,
          id: `${index}`,
          date: formatDatetime(parseDate(data.date.toString()), { mode: 'wide' }),
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
        </CardHeader>
        {chartView ? (
          <BiometricsChart patientBiometrics={biometrics} conceptUnits={conceptUnits} config={config} />
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
