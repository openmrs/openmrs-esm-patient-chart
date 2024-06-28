import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReactToPrint } from 'react-to-print';
import { Button, ContentSwitcher, DataTableSkeleton, IconSwitch, InlineLoading } from '@carbon/react';
import { Add, ChartLineSmooth, Table, Printer } from '@carbon/react/icons';
import { CardHeader, EmptyState, ErrorState, useVisitOrOfflineVisit } from '@openmrs/esm-patient-common-lib';
import {
  age,
  getPatientName,
  formatDate,
  parseDate,
  useConfig,
  useLayoutType,
  usePatient,
} from '@openmrs/esm-framework';
import type { ConfigObject } from '../config-schema';
import { launchVitalsAndBiometricsForm } from '../utils';
import { useVitalsAndBiometrics, useVitalsConceptMetadata, withUnit } from '../common';
import PaginatedVitals from './paginated-vitals.component';
import PrintComponent from './print/print.component';
import VitalsChart from './vitals-chart.component';
import styles from './vitals-overview.scss';
import type { VitalsTableHeader, VitalsTableRow } from './types';

interface VitalsOverviewProps {
  patientUuid: string;
  pageSize: number;
  urlLabel: string;
  pageUrl: string;
}

const VitalsOverview: React.FC<VitalsOverviewProps> = ({ patientUuid, pageSize, urlLabel, pageUrl }) => {
  const { t } = useTranslation();
  const config = useConfig<ConfigObject>();
  const headerTitle = t('vitals', 'Vitals');
  const [chartView, setChartView] = useState(false);
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);
  const isTablet = useLayoutType() === 'tablet';
  const [isPrinting, setIsPrinting] = useState(false);
  const contentToPrintRef = useRef(null);
  const patient = usePatient(patientUuid);

  const { excludePatientIdentifierCodeTypes } = useConfig();
  const { data: vitals, error, isLoading, isValidating } = useVitalsAndBiometrics(patientUuid);
  const { data: conceptUnits } = useVitalsConceptMetadata();
  const showPrintButton = config.vitals.showPrintButton && !chartView;

  const launchVitalsBiometricsForm = useCallback(() => {
    launchVitalsAndBiometricsForm(currentVisit, config);
  }, [config, currentVisit]);

  const patientDetails = useMemo(() => {
    const getGender = (gender: string): string => {
      switch (gender) {
        case 'male':
          return t('male', 'Male');
        case 'female':
          return t('female', 'Female');
        case 'other':
          return t('other', 'Other');
        case 'unknown':
          return t('unknown', 'Unknown');
        default:
          return gender;
      }
    };

    const identifiers =
      patient?.patient?.identifier?.filter(
        (identifier) => !excludePatientIdentifierCodeTypes?.uuids.includes(identifier.type.coding[0].code),
      ) ?? [];

    return {
      name: patient?.patient ? getPatientName(patient?.patient) : '',
      age: age(patient?.patient?.birthDate),
      gender: getGender(patient?.patient?.gender),
      location: patient?.patient?.address?.[0].city,
      identifiers: identifiers?.length ? identifiers.map(({ value, type }) => value) : [],
    };
  }, [patient, t, excludePatientIdentifierCodeTypes?.uuids]);

  const tableHeaders: Array<VitalsTableHeader> = [
    {
      key: 'dateRender',
      header: t('dateAndTime', 'Date and time'),
      isSortable: true,
      sortFunc: (valueA, valueB) => new Date(valueA.date).getTime() - new Date(valueB.date).getTime(),
    },
    {
      key: 'temperatureRender',
      header: withUnit(t('temperatureAbbreviated', 'Temp'), conceptUnits.get(config.concepts.temperatureUuid) ?? ''),
      isSortable: true,

      sortFunc: (valueA, valueB) =>
        valueA.temperature && valueB.temperature ? valueA.temperature - valueB.temperature : 0,
    },
    {
      key: 'bloodPressureRender',
      header: withUnit(
        t('bloodPressureAbbreviated', 'BP'),
        conceptUnits.get(config.concepts.systolicBloodPressureUuid) ?? '',
      ),
      isSortable: true,

      sortFunc: (valueA, valueB) =>
        valueA.systolic && valueB.systolic && valueA.diastolic && valueB.diastolic
          ? valueA.systolic !== valueB.systolic
            ? valueA.systolic - valueB.systolic
            : valueA.diastolic - valueB.diastolic
          : 0,
    },
    {
      key: 'pulseRender',
      header: withUnit(t('pulse', 'Pulse'), conceptUnits.get(config.concepts.pulseUuid) ?? ''),
      isSortable: true,

      sortFunc: (valueA, valueB) => (valueA.pulse && valueB.pulse ? valueA.pulse - valueB.pulse : 0),
    },
    {
      key: 'respiratoryRateRender',
      header: withUnit(
        t('respiratoryRateAbbreviated', 'R. Rate'),
        conceptUnits.get(config.concepts.respiratoryRateUuid) ?? '',
      ),
      isSortable: true,

      sortFunc: (valueA, valueB) =>
        valueA.respiratoryRate && valueB.respiratoryRate ? valueA.respiratoryRate - valueB.respiratoryRate : 0,
    },
    {
      key: 'spo2Render',
      header: withUnit(t('spo2', 'SpO2'), conceptUnits.get(config.concepts.oxygenSaturationUuid) ?? ''),
      isSortable: true,

      sortFunc: (valueA, valueB) => (valueA.spo2 && valueB.spo2 ? valueA.spo2 - valueB.spo2 : 0),
    },
  ];

  const tableRows: Array<VitalsTableRow> = useMemo(
    () =>
      vitals?.map((vitalSigns, index) => {
        return {
          ...vitalSigns,
          id: `${index}`,
          dateRender: formatDate(parseDate(vitalSigns.date.toString()), { mode: 'wide', time: true }),
          bloodPressureRender: `${vitalSigns.systolic ?? '--'} / ${vitalSigns.diastolic ?? '--'}`,
          pulseRender: vitalSigns.pulse ?? '--',
          spo2Render: vitalSigns.spo2 ?? '--',
          temperatureRender: vitalSigns.temperature ?? '--',
          respiratoryRateRender: vitalSigns.respiratoryRate ?? '--',
        };
      }),
    [vitals],
  );

  const onBeforeGetContentResolve = useRef(null);

  useEffect(() => {
    if (isPrinting && onBeforeGetContentResolve.current) {
      onBeforeGetContentResolve.current();
    }
  }, [isPrinting]);

  const handlePrint = useReactToPrint({
    content: () => contentToPrintRef.current,
    documentTitle: `OpenMRS - ${patientDetails.name} - ${headerTitle}`,
    onBeforeGetContent: () =>
      new Promise((resolve) => {
        if (patient && patient.patient && headerTitle) {
          onBeforeGetContentResolve.current = resolve;
          setIsPrinting(true);
        }
      }),
    onAfterPrint: () => {
      onBeforeGetContentResolve.current = null;
      setIsPrinting(false);
    },
  });

  return (
    <>
      {(() => {
        if (isLoading) return <DataTableSkeleton role="progressbar" compact={!isTablet} zebra />;
        if (error) return <ErrorState error={error} headerTitle={headerTitle} />;
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
                    <IconSwitch name="tableView" text="Table view">
                      <Table size={16} />
                    </IconSwitch>
                    <IconSwitch name="chartView" text="Chart view">
                      <ChartLineSmooth size={16} />
                    </IconSwitch>
                  </ContentSwitcher>
                  <>
                    <span className={styles.divider}>|</span>
                    {showPrintButton && (
                      <Button
                        kind="ghost"
                        renderIcon={Printer}
                        iconDescription="Add vitals"
                        className={styles.printButton}
                        onClick={handlePrint}
                      >
                        {t('print', 'Print')}
                      </Button>
                    )}
                    <Button
                      kind="ghost"
                      renderIcon={Add}
                      iconDescription="Add vitals"
                      onClick={launchVitalsBiometricsForm}
                    >
                      {t('add', 'Add')}
                    </Button>
                  </>
                </div>
              </CardHeader>
              {chartView ? (
                <VitalsChart patientVitals={vitals} conceptUnits={conceptUnits} config={config} />
              ) : (
                <div ref={contentToPrintRef} className={styles.vitalsTable}>
                  <PrintComponent subheader={headerTitle} patientDetails={patientDetails} />
                  <PaginatedVitals
                    isPrinting={isPrinting}
                    tableRows={tableRows}
                    pageSize={pageSize}
                    urlLabel={urlLabel}
                    pageUrl={pageUrl}
                    tableHeaders={tableHeaders}
                  />
                </div>
              )}
            </div>
          );
        }
        return (
          <EmptyState
            displayText={t('vitalSigns', 'Vital signs')}
            headerTitle={headerTitle}
            launchForm={launchVitalsBiometricsForm}
          />
        );
      })()}
    </>
  );
};

export default VitalsOverview;
