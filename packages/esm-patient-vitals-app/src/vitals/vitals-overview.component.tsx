import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReactToPrint } from 'react-to-print';
import { Button, ContentSwitcher, DataTableSkeleton, IconSwitch, InlineLoading } from '@carbon/react';
import { Add, ChartLineSmooth, Table, Printer } from '@carbon/react/icons';
import {
  CardHeader,
  EmptyState,
  ErrorState,
  useVisitOrOfflineVisit,
  useVitalsConceptMetadata,
  withUnit,
} from '@openmrs/esm-patient-common-lib';
import { age, formatDate, parseDate, useConfig, useLayoutType, usePatient } from '@openmrs/esm-framework';
import type { ConfigObject } from '../config-schema';
import { launchVitalsAndBiometricsForm } from '../utils';
import { useVitalsAndBiometrics } from '../common';
import PaginatedVitals from './paginated-vitals.component';
import PrintComponent from './print/print.component';
import VitalsChart from './vitals-chart.component';
import styles from './vitals-overview.scss';

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
  const { conceptUnits } = useVitalsConceptMetadata();
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
      name: `${patient?.patient?.name?.[0]?.given?.join(' ')} ${patient?.patient?.name?.[0].family}`,
      age: age(patient?.patient?.birthDate),
      gender: getGender(patient?.patient?.gender),
      location: patient?.patient?.address?.[0].city,
      identifiers: identifiers?.length ? identifiers.map(({ value, type }) => value) : [],
    };
  }, [patient, t, excludePatientIdentifierCodeTypes?.uuids]);

  const tableHeaders = [
    { key: 'date', header: t('dateAndTime', 'Date and time'), isSortable: true },
    {
      key: 'temperature',
      header: withUnit(t('temperature', 'Temp'), conceptUnits.get(config.concepts.temperatureUuid) ?? ''),
    },
    {
      key: 'bloodPressure',
      header: withUnit(t('bloodPressure', 'BP'), conceptUnits.get(config.concepts.systolicBloodPressureUuid) ?? ''),
    },
    { key: 'pulse', header: withUnit(t('pulse', 'Pulse'), conceptUnits.get(config.concepts.pulseUuid) ?? '') },
    {
      key: 'respiratoryRate',
      header: withUnit(t('respiratoryRate', 'R. Rate'), conceptUnits.get(config.concepts.respiratoryRateUuid) ?? ''),
    },
    {
      key: 'spo2',
      header: withUnit(t('spo2', 'SPO2'), conceptUnits.get(config.concepts.oxygenSaturationUuid) ?? ''),
    },
  ];

  const tableRows = useMemo(
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
                <div ref={contentToPrintRef}>
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
