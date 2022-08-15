import React, { useState } from 'react';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import { useTranslation } from 'react-i18next';
import { Button, InlineLoading } from '@carbon/react';
import { ChevronDown, ChevronUp, WarningFilled } from '@carbon/react/icons';
import { formatDate, parseDate, useConfig } from '@openmrs/esm-framework';
import { launchPatientWorkspace, useVitalsConceptMetadata } from '@openmrs/esm-patient-common-lib';
import { ConfigObject } from '../../config-schema';
import { patientVitalsBiometricsFormWorkspace } from '../../constants';
import {
  assessAllValues,
  assessValue,
  getReferenceRangesForConcept,
  interpretBloodPressure,
  useVitals,
} from '../vitals.resource';
import VitalsHeaderItem from './vitals-header-item.component';
import styles from './vitals-header.scss';

dayjs.extend(isToday);

interface VitalsHeaderProps {
  patientUuid: string;
  showRecordVitalsButton: boolean;
}

const VitalsHeader: React.FC<VitalsHeaderProps> = ({ patientUuid, showRecordVitalsButton }) => {
  const config = useConfig() as ConfigObject;
  const { t } = useTranslation();
  const { data: conceptUnits, conceptMetadata } = useVitalsConceptMetadata();
  const { vitals, isLoading, isValidating } = useVitals(patientUuid, true);
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
      (value) => value !== 'normal',
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
              <WarningFilled
                size={20}
                title={'WarningFilled'}
                aria-label="Warning"
                className={styles['warning-icon']}
              />
            ) : null}
            <span className={styles.heading}>{t('vitalsAndBiometrics', 'Vitals and biometrics')}</span>
            <span className={styles['body-text']}>
              {t('lastRecorded', 'Last recorded')}: {formatDate(parseDate(latestVitals?.date), { mode: 'wide' })}
            </span>
          </span>
          <div className={styles.backgroundDataFetchingIndicator}>
            <span>{isValidating ? <InlineLoading /> : null}</span>
          </div>
          <div className={styles['button-container']}>
            <Button className={styles['record-vitals']} kind="ghost" size="sm" onClick={launchVitalsAndBiometricsForm}>
              {t('recordVitals', 'Record vitals')}
            </Button>
            {showDetailsPanel ? (
              <ChevronUp
                size={16}
                className={styles['collapse-button']}
                title={'ChevronUp'}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDetailsPanel();
                }}
              />
            ) : (
              <ChevronDown
                size={16}
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
                unitSymbol={(latestVitals?.temperature && conceptUnits.get(config.concepts.temperatureUuid)) ?? ''}
                value={latestVitals?.temperature ?? '--'}
              />
              <VitalsHeaderItem
                interpretation={interpretBloodPressure(
                  latestVitals?.systolic,
                  latestVitals?.diastolic,
                  config?.concepts,
                  conceptMetadata,
                )}
                unitName={t('bp', 'BP')}
                unitSymbol={
                  (latestVitals?.systolic && conceptUnits.get(config.concepts.systolicBloodPressureUuid)) ?? ''
                }
                value={`${latestVitals?.systolic ?? '--'} / ${latestVitals?.diastolic ?? '--'}`}
              />
              <VitalsHeaderItem
                interpretation={assessValue(
                  latestVitals?.pulse,
                  getReferenceRangesForConcept(config.concepts.pulseUuid, conceptMetadata),
                )}
                unitName={t('heartRate', 'Heart rate')}
                unitSymbol={(latestVitals?.pulse && conceptUnits.get(config.concepts.pulseUuid)) ?? ''}
                value={latestVitals?.pulse ?? '--'}
              />
              <VitalsHeaderItem
                interpretation={assessValue(
                  latestVitals?.spo2,
                  getReferenceRangesForConcept(config.concepts.oxygenSaturationUuid, conceptMetadata),
                )}
                unitName={t('spo2', 'SpO2')}
                unitSymbol={(latestVitals?.spo2 && conceptUnits.get(config.concepts.oxygenSaturationUuid)) ?? ''}
                value={latestVitals?.spo2 ?? '--'}
              />
            </div>
            <div className={styles.row}>
              <VitalsHeaderItem
                interpretation={assessValue(
                  latestVitals?.respiratoryRate,
                  getReferenceRangesForConcept(config.concepts.respiratoryRateUuid, conceptMetadata),
                )}
                unitName={t('respiratoryRate', 'R. Rate')}
                unitSymbol={
                  (latestVitals?.respiratoryRate && conceptUnits.get(config.concepts.respiratoryRateUuid)) ?? ''
                }
                value={latestVitals?.respiratoryRate ?? '--'}
              />
              <VitalsHeaderItem
                unitName={t('height', 'Height')}
                unitSymbol={(latestVitals?.height && conceptUnits.get(config.concepts.heightUuid)) ?? ''}
                value={latestVitals?.height ?? '--'}
              />
              <VitalsHeaderItem
                unitName={t('bmi', 'BMI')}
                unitSymbol={latestVitals?.bmi && config.biometrics['bmiUnit']}
                value={latestVitals?.bmi ?? '--'}
              />
              <VitalsHeaderItem
                unitName={t('weight', 'Weight')}
                unitSymbol={(latestVitals?.weight && conceptUnits.get(config.concepts.weightUuid)) ?? ''}
                value={latestVitals?.weight ?? '--'}
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
        <span className={styles['body-text']}>{t('noDataRecorded', 'No data has been recorded for this patient')}</span>
      </span>

      <div className={styles.container}>
        <Button className={styles['button-text']} onClick={launchVitalsAndBiometricsForm} kind="ghost" size="sm">
          {t('recordVitals', 'Record vitals')}
        </Button>
      </div>
    </div>
  );
};

export default VitalsHeader;
