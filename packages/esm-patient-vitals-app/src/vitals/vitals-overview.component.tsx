import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataTableSkeleton, Button, InlineLoading, ContentSwitcher, Switch } from '@carbon/react';
import { Add, ChartLineSmooth, Table } from '@carbon/react/icons';
import {
  CardHeader,
  EmptyState,
  ErrorState,
  formEntrySub,
  launchPatientWorkspace,
  useVisitOrOfflineVisit,
  useVitalsConceptMetadata,
  withUnit,
} from '@openmrs/esm-patient-common-lib';
import { formatDate, parseDate, useConfig, useLayoutType } from '@openmrs/esm-framework';
import PaginatedVitals from './paginated-vitals.component';
import VitalsChart from './vitals-chart.component';
import { ConfigObject } from '../config-schema';
import { useVitals } from './vitals.resource';
import styles from './vitals-overview.scss';
import { launchVitalsForm } from './vitals-utils';

interface VitalsOverviewProps {
  patientUuid: string;
  showAddVitals: boolean;
  pageSize: number;
  urlLabel: string;
  pageUrl: string;
}

export function launchFormEntry(formUuid: string, encounterUuid?: string, formName?: string) {
  formEntrySub.next({ formUuid, encounterUuid });
  launchPatientWorkspace('patient-form-entry-workspace', { workspaceTitle: formName });
}

const VitalsOverview: React.FC<VitalsOverviewProps> = ({ patientUuid, showAddVitals, pageSize, urlLabel, pageUrl }) => {
  const { t } = useTranslation();
  const config = useConfig() as ConfigObject;
  const displayText = t('vitalSigns', 'Vital signs');
  const headerTitle = t('vitals', 'Vitals');
  const [chartView, setChartView] = React.useState<boolean>();
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);
  const isTablet = useLayoutType() === 'tablet';

  const { vitals, isError, isLoading, isValidating } = useVitals(patientUuid);
  const { data: conceptUnits } = useVitalsConceptMetadata();

  const launchVitalsBiometricsForm = React.useCallback(() => {
    launchVitalsForm(currentVisit, config);
  }, [config, currentVisit]);

  const tableHeaders = [
    { key: 'date', header: 'Date and time', isSortable: true },
    {
      key: 'temperature',
      header: withUnit('Temp', conceptUnits.get(config.concepts.temperatureUuid) ?? ''),
    },
    {
      key: 'bloodPressure',
      header: withUnit('BP', conceptUnits.get(config.concepts.systolicBloodPressureUuid) ?? ''),
    },
    { key: 'pulse', header: withUnit('Pulse', conceptUnits.get(config.concepts.pulseUuid) ?? '') },
    {
      key: 'respiratoryRate',
      header: withUnit('R. Rate', conceptUnits.get(config.concepts.respiratoryRateUuid) ?? ''),
    },
    {
      key: 'spo2',
      header: withUnit('SPO2', conceptUnits.get(config.concepts.oxygenSaturationUuid) ?? ''),
    },
  ];

  const tableRows = React.useMemo(
    () =>
      vitals?.map((vitalSigns, index) => {
        return {
          ...vitalSigns,
          id: `${index}`,
          date: formatDate(parseDate(vitalSigns.date.toString()), { mode: 'wide', time: true }),
          bloodPressure: `${vitalSigns.systolic ?? '--'} / ${vitalSigns.diastolic ?? '--'}`,
          pulse: vitalSigns.pulse ?? '--',
          spo2: vitalSigns.spo2 ?? '--',
          temperature: vitalSigns.temperature ?? '--',
          respiratoryRate: vitalSigns.respiratoryRate ?? '--',
        };
      }),
    [vitals],
  );

  return (
    <>
      {(() => {
        if (isLoading) return <DataTableSkeleton role="progressbar" compact={!isTablet} zebra />;
        if (isError) return <ErrorState error={isError} headerTitle={headerTitle} />;
        if (vitals?.length) {
          return (
            <div className={styles.widgetCard}>
              <CardHeader title={headerTitle}>
                <div className={styles.backgroundDataFetchingIndicator}>
                  <span>{isValidating ? <InlineLoading /> : null}</span>
                </div>
                <div className={styles.vitalsHeaderActionItems}>
                  <ContentSwitcher
                    onChange={(evt) => setChartView(evt.name === 'chartView')}
                    size={isTablet ? 'md' : 'sm'}
                  >
                    <Switch name="tableView">
                      <Table size={16} />
                    </Switch>
                    <Switch name="chartView">
                      <ChartLineSmooth size={16} />
                    </Switch>
                  </ContentSwitcher>
                  {showAddVitals && (
                    <>
                      <span className={styles.divider}>|</span>
                      <Button
                        kind="ghost"
                        renderIcon={Add}
                        iconDescription="Add vitals"
                        onClick={launchVitalsBiometricsForm}
                      >
                        {t('add', 'Add')}
                      </Button>
                    </>
                  )}
                </div>
              </CardHeader>
              {chartView ? (
                <VitalsChart patientVitals={vitals} conceptUnits={conceptUnits} config={config} />
              ) : (
                <PaginatedVitals
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
        // Ensure we have the emptyStateText translation key
        // t('emptyStateText', 'There are no {{displayText}} to display for this patient')
        return (
          <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={launchVitalsBiometricsForm} />
        );
      })()}
    </>
  );
};

export default VitalsOverview;
