import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ContentSwitcher, DataTableSkeleton, IconSwitch, InlineLoading } from '@carbon/react';
import { Add, Analytics, Table } from '@carbon/react/icons';
import { formatDatetime, parseDate, useConfig, useLayoutType } from '@openmrs/esm-framework';
import { CardHeader, EmptyState, ErrorState } from '@openmrs/esm-patient-common-lib';
import { useLaunchVitalsAndBiometricsForm } from '../utils';
import { useConceptUnits, useVitalsAndBiometrics, withUnit } from '../common';
import { type ConfigObject } from '../config-schema';
import type { BiometricsTableHeader, BiometricsTableRow } from './types';
import BiometricsChart from './biometrics-chart.component';
import PaginatedBiometrics from './paginated-biometrics.component';
import styles from './biometrics-base.scss';

interface BiometricsBaseProps {
  pageSize: number;
  pageUrl: string;
  patientUuid: string;
  urlLabel: string;
}

const BiometricsBase: React.FC<BiometricsBaseProps> = ({ patientUuid, pageSize, urlLabel, pageUrl }) => {
  const { t } = useTranslation();
  const displayText = t('biometrics_lower', 'biometrics');
  const headerTitle = t('biometrics', 'Biometrics');
  const [chartView, setChartView] = useState(false);
  const isTablet = useLayoutType() === 'tablet';

  const config = useConfig<ConfigObject>();
  const { bmiUnit } = config.biometrics;
  const { data: biometrics, isLoading, error, isValidating } = useVitalsAndBiometrics(patientUuid, 'biometrics');
  const { conceptUnits } = useConceptUnits();
  const launchBiometricsForm = useLaunchVitalsAndBiometricsForm();

  const tableHeaders: Array<BiometricsTableHeader> = [
    {
      key: 'dateRender',
      header: t('dateAndTime', 'Date and time'),
      isSortable: true,
      sortFunc: (valueA, valueB) => new Date(valueA.date).getTime() - new Date(valueB.date).getTime(),
    },
    {
      key: 'weightRender',
      header: withUnit(t('weight', 'Weight'), conceptUnits.get(config.concepts.weightUuid) ?? ''),
      isSortable: true,
      sortFunc: (valueA, valueB) => (valueA.weight && valueB.weight ? valueA.weight - valueB.weight : 0),
    },
    {
      key: 'heightRender',
      header: withUnit(t('height', 'Height'), conceptUnits.get(config.concepts.heightUuid) ?? ''),
      isSortable: true,
      sortFunc: (valueA, valueB) => (valueA.height && valueB.height ? valueA.height - valueB.height : 0),
    },
    {
      key: 'bmiRender',
      header: `${t('bmi', 'BMI')} (${bmiUnit})`,
      isSortable: true,
      sortFunc: (valueA, valueB) => (valueA.bmi && valueB.bmi ? valueA.bmi - valueB.bmi : 0),
    },
    {
      key: 'muacRender',
      header: withUnit(t('muac', 'MUAC'), conceptUnits.get(config.concepts.midUpperArmCircumferenceUuid) ?? ''),
      isSortable: true,
      sortFunc: (valueA, valueB) => (valueA.muac && valueB.muac ? valueA.muac - valueB.muac : 0),
    },
  ];

  const tableRows: Array<BiometricsTableRow> = useMemo(
    () =>
      biometrics?.map((biometricsData, index) => {
        return {
          ...biometricsData,
          dateRender: formatDatetime(parseDate(biometricsData.date.toString()), { mode: 'wide' }),
          weightRender: biometricsData.weight ?? '--',
          heightRender: biometricsData.height ?? '--',
          bmiRender: biometricsData.bmi ?? '--',
          muacRender: biometricsData.muac ?? '--',
        };
      }),
    [biometrics],
  );

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (error) {
    return <ErrorState error={error} headerTitle={headerTitle} />;
  }

  if (biometrics?.length) {
    return (
      <div className={styles.widgetCard}>
        <CardHeader title={headerTitle}>
          <div className={styles.backgroundDataFetchingIndicator}>
            <span>{isValidating ? <InlineLoading /> : null}</span>
          </div>
          <div className={styles.biometricsHeaderActionItems}>
            <ContentSwitcher onChange={(evt) => setChartView(evt.name === 'chartView')} size={isTablet ? 'md' : 'sm'}>
              <IconSwitch name="tableView" text="Table view">
                <Table size={16} />
              </IconSwitch>
              <IconSwitch name="chartView" text="Chart view">
                <Analytics size={16} />
              </IconSwitch>
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
