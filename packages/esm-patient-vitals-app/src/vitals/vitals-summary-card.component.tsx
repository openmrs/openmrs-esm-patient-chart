import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTableSkeleton, Layer, Tile } from '@carbon/react';
import { EmptyState, VitalStatusBadge, getBloodPressureInterpretation, getSpO2Interpretation, getPulseInterpretation } from '@openmrs/esm-patient-common-lib';
import { formatDate, parseDate, useConfig, useLayoutType } from '@openmrs/esm-framework';
import { useVitalsAndBiometrics, useConceptUnits } from '../common';
import { type ConfigObject } from '../config-schema';
import styles from './vitals-summary-card.scss';

interface VitalsSummaryCardProps {
  patientUuid: string;
  patient?: fhir.Patient;
}

interface VitalSummaryItem {
  label: string;
  value: string | number;
  unit: string;
  statusBadge?: React.ReactNode;
}

/**
 * Displays the most recent reading for each vital sign with color-coded status badges.
 * Allows clinicians to immediately triage abnormal values during a busy shift.
 */
const VitalsSummaryCard: React.FC<VitalsSummaryCardProps> = memo(({ patientUuid }) => {
  const { t } = useTranslation();
  const config = useConfig<ConfigObject>();
  const { data: vitals, isLoading } = useVitalsAndBiometrics(patientUuid);
  const { conceptUnits } = useConceptUnits();
  const isTablet = useLayoutType() === 'tablet';

  const latest = vitals?.[0];

  const summaryItems = useMemo((): Array<VitalSummaryItem> => {
    if (!latest) return [];

    const bpUnit = conceptUnits.get(config.concepts.systolicBloodPressureUuid) ?? 'mmHg';
    const bpInterpretation = getBloodPressureInterpretation(latest.systolic, latest.diastolic);
    const spo2Interpretation = getSpO2Interpretation(latest.spo2);
    const pulseInterpretation = getPulseInterpretation(latest.pulse);

    return [
      {
        label: t('bloodPressureAbbreviated', 'BP'),
        value: latest.systolic && latest.diastolic ? `${latest.systolic}/${latest.diastolic}` : '--',
        unit: bpUnit,
        statusBadge: <VitalStatusBadge severity={bpInterpretation.severity} label={bpInterpretation.label} />,
      },
      {
        label: t('pulse', 'Pulse'),
        value: latest.pulse ?? '--',
        unit: conceptUnits.get(config.concepts.pulseUuid) ?? 'bpm',
        statusBadge: latest.pulse != null ? <VitalStatusBadge severity={pulseInterpretation.severity} label={pulseInterpretation.label} /> : null,
      },
      {
        label: t('spo2', 'SpO2'),
        value: latest.spo2 != null ? `${latest.spo2}` : '--',
        unit: conceptUnits.get(config.concepts.oxygenSaturationUuid) ?? '%',
        statusBadge: latest.spo2 != null ? <VitalStatusBadge severity={spo2Interpretation.severity} label={spo2Interpretation.label} /> : null,
      },
      {
        label: t('temperatureAbbreviated', 'Temp'),
        value: latest.temperature ?? '--',
        unit: conceptUnits.get(config.concepts.temperatureUuid) ?? '°C',
      },
      {
        label: t('respiratoryRateAbbreviated', 'R. Rate'),
        value: latest.respiratoryRate ?? '--',
        unit: conceptUnits.get(config.concepts.respiratoryRateUuid) ?? '/min',
      },
    ];
  }, [latest, conceptUnits, config.concepts, t]);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" compact={!isTablet} rowCount={1} />;
  }

  if (!vitals?.length || !latest) {
    return (
      <EmptyState
        displayText={t('vitalSigns', 'vital signs')}
        headerTitle={t('latestVitals', 'Latest Vitals')}
      />
    );
  }

  const recordedDate = formatDate(parseDate(latest.date.toString()), { mode: 'wide', time: true });

  return (
    <Layer>
      <Tile className={styles.summaryCard} role="region" aria-label={t('latestVitalsCard', 'Latest vital signs summary')}>
        <div className={styles.cardHeader}>
          <h6 className={styles.title}>{t('latestVitals', 'Latest Vitals')}</h6>
          <span className={styles.recordedDate} aria-label={t('recordedOn', 'Recorded on {{date}}', { date: recordedDate })}>
            {recordedDate}
          </span>
        </div>
        <div className={styles.vitalsGrid}>
          {summaryItems.map((item) => (
            <div key={item.label} className={styles.vitalItem}>
              <span className={styles.vitalLabel}>{item.label}</span>
              <div className={styles.vitalValueRow}>
                <span className={styles.vitalValue}>
                  {item.value}
                  {item.value !== '--' && <span className={styles.vitalUnit}> {item.unit}</span>}
                </span>
                {item.statusBadge}
              </div>
            </div>
          ))}
        </div>
      </Tile>
    </Layer>
  );
});

VitalsSummaryCard.displayName = 'VitalsSummaryCard';

export default VitalsSummaryCard;
