import React, { useState } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Button } from 'carbon-components-react';
import ChevronDown16 from '@carbon/icons-react/es/chevron--down/16';
import ChevronUp16 from '@carbon/icons-react/es/chevron--up/16';
import WarningFilled20 from '@carbon/icons-react/es/warning--filled/20';
import InlineLoading from 'carbon-components-react/es/components/InlineLoading';
import { formatDate, parseDate, useConfig } from '@openmrs/esm-framework';
import {
  ConceptMetadata,
  ObsMetaInfo,
  launchPatientWorkspace,
  useVitalsConceptMetadata,
} from '@openmrs/esm-patient-common-lib';
import { ConfigObject } from '../../config-schema';
import { patientVitalsBiometricsFormWorkspace } from '../../constants';
import { PatientVitals, useVitals } from '../vitals.resource';
import VitalsHeaderItem from './vitals-header-item.component';
import styles from './vitals-header.scss';

export enum ObservationInterpretation {
  CRITICALLY_LOW = 'critically_low',
  CRITICALLY_HIGH = 'critically_high',
  HIGH = 'high',
  LOW = 'low',
  NORMAL = 'normal',
}

interface VitalsHeaderProps {
  patientUuid: string;
  showRecordVitalsButton: boolean;
}

const VitalsHeader: React.FC<VitalsHeaderProps> = ({ patientUuid, showRecordVitalsButton }) => {
  const config = useConfig() as ConfigObject;
  const { t } = useTranslation();
  const { data: conceptUnits, conceptMetadata } = useVitalsConceptMetadata();
  const { vitals, isLoading } = useVitals(patientUuid, true);
  const latestVitals = vitals?.[0];
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const toggleDetailsPanel = () => setShowDetailsPanel(!showDetailsPanel);

  const launchVitalsAndBiometricsForm = React.useCallback((e) => {
    e.stopPropagation();
    launchPatientWorkspace(patientVitalsBiometricsFormWorkspace);
  }, []);

  if (isLoading) {
    return (
      <InlineLoading role="progressbar" className={styles.loading} description={`${t('loading', 'Loading')} ...`} />
    );
  }

  if (!isLoading && latestVitals && Object.keys(latestVitals).length && conceptMetadata?.length) {
    const isNotRecordedToday = !dayjs(latestVitals?.date).isToday();
    const hasAbnormalValues = assessAllValues(latestVitals, config, conceptMetadata).some(
      (value) => value !== ObservationInterpretation.NORMAL,
    );

    return (
      <div
        className={`${
          latestVitals && hasAbnormalValues && isNotRecordedToday
            ? styles['warning-background']
            : styles['default-background']
        }`}
      >
        <div className={styles['vitals-header']} role="button" tabIndex={0} onClick={toggleDetailsPanel}>
          <span className={styles.container}>
            {hasAbnormalValues && isNotRecordedToday ? (
              <WarningFilled20 title={'WarningFilled'} aria-label="Warning" className={styles['warning-icon']} />
            ) : null}
            <span className={styles.heading}>{t('vitalsAndBiometrics', 'Vitals and biometrics')}</span>
            <span className={`${styles.bodyShort01} ${styles.text02}`}>
              {t('lastRecorded', 'Last recorded')}: {formatDate(parseDate(latestVitals?.date), { mode: 'wide' })}
            </span>
          </span>
          <div className={styles['button-container']}>
            <Button
              className={styles['record-vitals']}
              kind="ghost"
              size="small"
              onClick={launchVitalsAndBiometricsForm}
            >
              {t('recordVitals', 'Record vitals')}
            </Button>
            {showDetailsPanel ? (
              <ChevronUp16
                className={styles['collapse-button']}
                title={'ChevronUp'}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDetailsPanel();
                }}
              />
            ) : (
              <ChevronDown16
                className={styles['expand-button']}
                title={'ChevronDown'}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDetailsPanel();
                }}
              />
            )}
          </div>
        </div>
        {showDetailsPanel ? (
          <div
            className={
              hasAbnormalValues && isNotRecordedToday ? `${styles['warning-border']}` : `${styles['default-border']}`
            }
          >
            <div className={styles.row}>
              <VitalsHeaderItem
                unitName={t('temperatureAbbreviated', 'Temp')}
                unitSymbol={conceptUnits.get(config.concepts.temperatureUuid) ?? ''}
                value={latestVitals?.temperature}
              />
              <VitalsHeaderItem
                interpretation={interpretHeartRate(
                  latestVitals?.systolic,
                  latestVitals?.diastolic,
                  config?.concepts,
                  conceptMetadata,
                )}
                unitName={t('bp', 'BP')}
                unitSymbol={conceptUnits.get(config.concepts.systolicBloodPressureUuid) ?? ''}
                value={`${latestVitals?.systolic ?? '-'} / ${latestVitals?.diastolic ?? '-'}`}
              />
              <VitalsHeaderItem
                interpretation={assessValue(
                  latestVitals?.pulse,
                  getReferenceRangesForConcept(config.concepts.pulseUuid, conceptMetadata),
                )}
                unitName={t('heartRate', 'Heart rate')}
                unitSymbol={conceptUnits.get(config.concepts.pulseUuid) ?? ''}
                value={latestVitals?.pulse}
              />
              <VitalsHeaderItem
                interpretation={assessValue(
                  latestVitals?.oxygenSaturation,
                  getReferenceRangesForConcept(config.concepts.oxygenSaturationUuid, conceptMetadata),
                )}
                unitName={t('spo2', 'SpO2')}
                unitSymbol={conceptUnits.get(config.concepts.oxygenSaturationUuid) ?? ''}
                value={latestVitals?.oxygenSaturation}
              />
            </div>
            <div className={styles.row}>
              <VitalsHeaderItem
                interpretation={assessValue(
                  latestVitals?.respiratoryRate,
                  getReferenceRangesForConcept(config.concepts.respiratoryRateUuid, conceptMetadata),
                )}
                unitName={t('respiratoryRate', 'R. Rate')}
                unitSymbol={conceptUnits.get(config.concepts.respiratoryRateUuid) ?? ''}
                value={latestVitals?.respiratoryRate}
              />
              <VitalsHeaderItem
                unitName={t('height', 'Height')}
                unitSymbol={conceptUnits.get(config.concepts.heightUuid) ?? ''}
                value={latestVitals?.height}
              />
              <VitalsHeaderItem
                unitName={t('bmi', 'BMI')}
                unitSymbol={config.biometrics['bmiUnit']}
                value={latestVitals?.bmi}
              />
              <VitalsHeaderItem
                unitName={t('weight', 'Weight')}
                unitSymbol={conceptUnits.get(config.concepts.weightUuid) ?? ''}
                value={latestVitals?.weight}
              />
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={styles['vitals-header']}>
      <span className={styles.container}>
        <span className={styles.heading}>{t('vitalsAndBiometrics', 'Vitals and biometrics')}</span>
        <span className={styles['empty-state']}>
          {t('noDataRecorded', 'No data has been recorded for this patient')}
        </span>
      </span>

      <div className={styles.container}>
        <Button className={styles['button-text']} onClick={launchVitalsAndBiometricsForm} kind="ghost" size="small">
          {t('recordVitals', 'Record vitals')}
        </Button>
      </div>
    </div>
  );
};

export default VitalsHeader;

function assessValue(value: number, range: ObsMetaInfo): ObservationInterpretation {
  if (exists(range?.hiCritical) && value >= range.hiCritical) {
    return ObservationInterpretation.CRITICALLY_HIGH;
  }

  if (exists(range?.hiNormal) && value > range.hiNormal) {
    return ObservationInterpretation.HIGH;
  }

  if (exists(range?.lowCritical) && value <= range.lowCritical) {
    return ObservationInterpretation.CRITICALLY_LOW;
  }

  if (exists(range?.lowNormal) && value < range.lowNormal) {
    return ObservationInterpretation.LOW;
  }

  return ObservationInterpretation.NORMAL;
}

function exists(...args: any[]): boolean {
  for (const y of args) {
    if (y === null || y === undefined) {
      return false;
    }
  }

  return true;
}

function getReferenceRangesForConcept(conceptUuid: string, conceptMetadata: Array<ConceptMetadata>): ConceptMetadata {
  if (!conceptUuid || !conceptMetadata.length) return null;

  return conceptMetadata?.find((metadata) => metadata.uuid === conceptUuid);
}

function assessAllValues(
  vitals: PatientVitals,
  config: ConfigObject,
  conceptMetadata: Array<ConceptMetadata>,
): Array<ObservationInterpretation> {
  return Object.entries(vitals).map((key, value) => {
    return assessValue(value, getReferenceRangesForConcept(config.concepts[`${key[0]}Uuid`], conceptMetadata));
  });
}

function interpretHeartRate(systolic, diastolic, concepts, conceptMetadata) {
  const systolicAssessment = assessValue(
    systolic,
    getReferenceRangesForConcept(concepts?.systolicBloodPressureUuid, conceptMetadata),
  );

  const diastolicAssessment = assessValue(
    diastolic,
    getReferenceRangesForConcept(concepts?.diastolicBloodPressureUuid, conceptMetadata),
  );

  if (
    systolicAssessment === ObservationInterpretation.CRITICALLY_HIGH ||
    diastolicAssessment === ObservationInterpretation.CRITICALLY_HIGH
  ) {
    return ObservationInterpretation.CRITICALLY_HIGH;
  }

  if (
    systolicAssessment === ObservationInterpretation.CRITICALLY_LOW ||
    diastolicAssessment === ObservationInterpretation.CRITICALLY_LOW
  ) {
    return ObservationInterpretation.CRITICALLY_LOW;
  }

  if (systolicAssessment === ObservationInterpretation.HIGH || diastolicAssessment === ObservationInterpretation.HIGH) {
    return ObservationInterpretation.HIGH;
  }

  if (systolicAssessment === ObservationInterpretation.LOW || diastolicAssessment === ObservationInterpretation.LOW) {
    return ObservationInterpretation.LOW;
  }

  return ObservationInterpretation.NORMAL;
}
