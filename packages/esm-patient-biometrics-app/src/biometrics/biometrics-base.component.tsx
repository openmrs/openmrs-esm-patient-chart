import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, DataTableSkeleton, InlineLoading, ContentSwitcher, Switch } from '@carbon/react';
import { Add, ChartLineSmooth, Table } from '@carbon/react/icons';
import { formatDatetime, parseDate, useConfig, useLayoutType } from '@openmrs/esm-framework';
import {
  CardHeader,
  EmptyState,
  ErrorState,
  useVitalsConceptMetadata,
  withUnit,
  useVisitOrOfflineVisit,
} from '@openmrs/esm-patient-common-lib';
import { ConfigObject } from '../config-schema';
import { launchVitalsAndBiometricsForm } from '../biometrics-utils';
import { useBiometrics } from './biometrics.resource';
import BiometricsChart from './biometrics-chart.component';
import PaginatedBiometrics from './paginated-biometrics.component';
import styles from './biometrics-base.scss';

interface BiometricsBaseProps {
  patientUuid: string;
  pageSize: number;
  urlLabel: string;
  pageUrl: string;
}

const BiometricsBase: React.FC<BiometricsBaseProps> = ({ patientUuid, pageSize, urlLabel, pageUrl }) => {
  const { t } = useTranslation();
  const displayText = t('biometrics_lower', 'biometrics');
  const headerTitle = t('biometrics', 'Biometrics');
  const [chartView, setChartView] = React.useState(false);
  const isTablet = useLayoutType() === 'tablet';

  const config = useConfig() as ConfigObject;
  const { bmiUnit } = config.biometrics;
  const { biometrics, isLoading, isError, isValidating } = useBiometrics(patientUuid, config.concepts);
  const { data: conceptUnits } = useVitalsConceptMetadata();
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);

  const launchBiometricsForm = React.useCallback(
    () => launchVitalsAndBiometricsForm(currentVisit, config),
    [config, currentVisit],
  );

  const tableHeaders = [
    { key: 'date', header: t('dateAndTime', 'Date and time') },
    { key: 'weight', header: withUnit(t('weight', 'Weight'), conceptUnits.get(config.concepts.weightUuid) ?? '') },
    { key: 'height', header: withUnit(t('height', 'Height'), conceptUnits.get(config.concepts.heightUuid) ?? '') },
    { key: 'bmi', header: `${t('bmi', 'BMI')} (${bmiUnit})` },
    { key: 'muac', header: withUnit(t('muac', 'MUAC'), conceptUnits.get(config.concepts.muacUuid) ?? '') },
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
      <div className={styles.widgetCard} data-testid="biometrics-table">
        <CardHeader title={headerTitle}>
          <div className={styles.backgroundDataFetchingIndicator}>
            <span>{isValidating ? <InlineLoading /> : null}</span>
          </div>
          <div className={styles.biometricsHeaderActionItems}>
            <ContentSwitcher onChange={(evt) => setChartView(evt.name === 'chartView')} size={isTablet ? 'md' : 'sm'}>
              <Switch name="tableView">
                <Table size={16} />
              </Switch>
              <Switch name="chartView">
                <ChartLineSmooth size={16} />
              </Switch>
            </ContentSwitcher>
            <>
              <span className={styles.divider}>|</span>
              <Button
                kind="ghost"
                renderIcon={(props) => <Add size={16} {...props} />}
                iconDescription="Add biometrics"
                onClick={launchBiometricsForm}
              >
                {t('add', 'Add')}
              </Button>
            </>
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
