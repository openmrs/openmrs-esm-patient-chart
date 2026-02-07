import React, { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReactToPrint } from 'react-to-print';
import { Button, ContentSwitcher, DataTableSkeleton, IconSwitch, InlineLoading } from '@carbon/react';
import { Analytics, Table } from '@carbon/react/icons';
import { CardHeader, EmptyState, ErrorState } from '@openmrs/esm-patient-common-lib';
import {
  AddIcon,
  PrinterIcon,
  age,
  getPatientName,
  formatDate,
  parseDate,
  useConfig,
  useLayoutType,
} from '@openmrs/esm-framework';
import type { ConfigObject } from '../config-schema';
import { useLaunchVitalsAndBiometricsForm } from '../utils';
import { useVitalsAndBiometrics, useConceptUnits, withUnit } from '../common';
import PaginatedVitals from './paginated-vitals.component';
import VitalsChart from './vitals-chart.component';
import styles from './vitals-overview.scss';

interface VitalsOverviewProps {
  patientUuid: string;
  patient: fhir.Patient;
  pageSize: number;
  urlLabel: string;
  pageUrl: string;
}

const VitalsOverview: React.FC<VitalsOverviewProps> = ({ patientUuid, patient, pageSize, urlLabel, pageUrl }) => {
  const { t } = useTranslation();
  const config = useConfig<ConfigObject>();
  const headerTitle = t('vitals', 'Vitals');
  const [chartView, setChartView] = useState(false);
  const isTablet = useLayoutType() === 'tablet';
  const contentToPrintRef = useRef(null);
  const launchVitalsBiometricsForm = useLaunchVitalsAndBiometricsForm(patientUuid);

  const { excludePatientIdentifierCodeTypes } = useConfig();
  const { data: vitals, error, isLoading, isValidating } = useVitalsAndBiometrics(patientUuid);
  const { conceptUnits } = useConceptUnits();

  const patientDetails = useMemo(() => {
    const identifiers =
      patient?.identifier?.filter(
        (id: any) => !excludePatientIdentifierCodeTypes?.uuids.includes(id.type?.coding?.[0]?.code),
      ) ?? [];

    return {
      name: patient ? getPatientName(patient) : '',
      age: age(patient?.birthDate),
      gender: patient?.gender,
      location: patient?.address?.[0]?.city,
      identifiers: identifiers.map((id: any) => id.value),
    };
  }, [patient, excludePatientIdentifierCodeTypes?.uuids]);

  const tableHeaders: any[] = [
    { key: 'dateRender', header: t('dateAndTime', 'Date and time'), isSortable: false, sortFunc: () => 0 },
    {
      key: 'temperatureRender',
      header: withUnit(t('temperatureAbbreviated', 'Temp'), conceptUnits.get(config.concepts.temperatureUuid)),
      isSortable: false,
      sortFunc: () => 0,
    },
    {
      key: 'bloodPressureRender',
      header: withUnit(
        t('bloodPressureAbbreviated', 'BP'),
        conceptUnits.get(config.concepts.systolicBloodPressureUuid),
      ),
      isSortable: false,
      sortFunc: () => 0,
    },
    {
      key: 'pulseRender',
      header: withUnit(t('pulse', 'Pulse'), conceptUnits.get(config.concepts.pulseUuid)),
      isSortable: false,
      sortFunc: () => 0,
    },
    {
      key: 'respiratoryRateRender',
      header: withUnit(
        t('respiratoryRateAbbreviated', 'R. Rate'),
        conceptUnits.get(config.concepts.respiratoryRateUuid),
      ),
      isSortable: false,
      sortFunc: () => 0,
    },
    {
      key: 'spo2Render',
      header: withUnit(t('spo2', 'SpO2'), conceptUnits.get(config.concepts.oxygenSaturationUuid)),
      isSortable: false,
      sortFunc: () => 0,
    },
  ];

  const tableRows: any[] = useMemo(
    () =>
      vitals?.map((vitalSigns: any) => {
        const formatRange = (range: any) => {
          if (!range || (range.lowNormal === undefined && range.hiNormal === undefined)) return '';
          return ` (${range.lowNormal ?? '?'} - ${range.hiNormal ?? '?'})`;
        };

        return {
          ...vitalSigns,
          dateRender: formatDate(parseDate(vitalSigns.date.toString()), { mode: 'wide', time: true }),
          bloodPressureRender: `${vitalSigns.systolic ?? '--'} / ${vitalSigns.diastolic ?? '--'}`,
          pulseRender: `${vitalSigns.pulse ?? '--'}${formatRange(vitalSigns.pulseReferenceRanges)}`,
          spo2Render: `${vitalSigns.spo2 ?? '--'}${formatRange(vitalSigns.spo2ReferenceRanges)}`,
          temperatureRender: `${vitalSigns.temperature ?? '--'}${formatRange(vitalSigns.temperatureReferenceRanges)}`,
          respiratoryRateRender: `${vitalSigns.respiratoryRate ?? '--'}${formatRange(vitalSigns.respiratoryRateReferenceRanges)}`,
        };
      }) ?? [],
    [vitals],
  );

  const handlePrint = useReactToPrint({
    content: () => contentToPrintRef.current,
    documentTitle: `OpenMRS - ${patientDetails.name} - ${headerTitle}`,
  });

  if (isLoading) return <DataTableSkeleton role="progressbar" compact={!isTablet} zebra />;
  if (error) return <ErrorState error={error} headerTitle={headerTitle} />;

  return (
    <div className={styles.widgetCard}>
      <CardHeader title={headerTitle}>
        <div className={styles.vitalsHeaderActionItems}>
          <ContentSwitcher
            onChange={(evt: any) => setChartView(evt.name === 'chartView')}
            selectedIndex={chartView ? 1 : 0}
            size={isTablet ? 'md' : 'sm'}
          >
            <IconSwitch name="tableView" text="Table view">
              <Table size={16} />
            </IconSwitch>
            <IconSwitch name="chartView" text="Chart view">
              <Analytics size={16} />
            </IconSwitch>
          </ContentSwitcher>
          <Button kind="ghost" renderIcon={AddIcon} onClick={launchVitalsBiometricsForm}>
            {t('add', 'Add')}
          </Button>
        </div>
      </CardHeader>
      {chartView ? (
        <VitalsChart patientVitals={vitals} conceptUnits={conceptUnits} config={config} />
      ) : (
        <PaginatedVitals
          pageSize={pageSize}
          pageUrl={pageUrl}
          tableHeaders={tableHeaders}
          tableRows={tableRows}
          urlLabel={urlLabel}
          patient={patient}
        />
      )}
    </div>
  );
};

export default VitalsOverview;
