import React, { useState } from 'react';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import { useTranslation } from 'react-i18next';
import { Button, InlineLoading } from '@carbon/react';
import { ArrowRight, WarningFilled } from '@carbon/react/icons';
import { ConfigurableLink, formatDate, parseDate, useConfig } from '@openmrs/esm-framework';
import {
  formEntrySub,
  launchPatientWorkspace,
  useVisitOrOfflineVisit,
  useVitalsConceptMetadata,
} from '@openmrs/esm-patient-common-lib';
import { ConfigObject } from '../../config-schema';
import {
  assessValue,
  getReferenceRangesForConcept,
  hasAbnormalValues,
  interpretBloodPressure,
  useVitals,
} from '../vitals.resource';
import VitalsHeaderItem from './vitals-header-item.component';
import styles from './vitals-header.scss';
import { launchVitalsForm } from '../vitals-utils';

dayjs.extend(isToday);

interface VitalsHeaderProps {
  patientUuid: string;
  showRecordVitalsButton: boolean;
}

export function launchFormEntry(formUuid: string, encounterUuid?: string, formName?: string) {
  formEntrySub.next({ formUuid, encounterUuid });
  launchPatientWorkspace('patient-form-entry-workspace', { workspaceTitle: formName });
}

const VitalsHeader: React.FC<VitalsHeaderProps> = ({ patientUuid, showRecordVitalsButton }) => {
  const config = useConfig() as ConfigObject;
  const { t } = useTranslation();
  const { data: conceptUnits, conceptMetadata } = useVitalsConceptMetadata();
  const { vitals, isLoading, isValidating } = useVitals(patientUuid, true);
  const latestVitals = vitals?.[0];
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const toggleDetailsPanel = () => setShowDetailsPanel(!showDetailsPanel);
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);

  const launchVitalsAndBiometricsForm = React.useCallback(
    (e) => {
      e.stopPropagation();
      launchVitalsForm(currentVisit, config);
    },
    [config, currentVisit],
  );

  if (isLoading) {
    return (
      <InlineLoading role="progressbar" className={styles.loading} description={`${t('loading', 'Loading')} ...`} />
    );
  }

  if (!isLoading && latestVitals && Object.keys(latestVitals).length && conceptMetadata?.length) {
    const isNotRecordedToday = !dayjs(latestVitals?.date).isToday();

    return (
      <div
        className={`${
          Object.keys(latestVitals).length && hasAbnormalValues(latestVitals) && isNotRecordedToday
            ? styles['warning-background']
            : styles['default-background']
        }`}
      >
        <div className={styles['vitals-header']} role="button" tabIndex={0} onClick={toggleDetailsPanel}>
          <span className={styles.container}>
            {hasAbnormalValues(latestVitals) && isNotRecordedToday ? (
              <WarningFilled
                size={20}
                title={'WarningFilled'}
                aria-label="Warning"
                className={styles['warning-icon']}
              />
            ) : null}
            <span className={styles.heading}>{t('vitalsAndBiometrics', 'Vitals and biometrics')}</span>
            <span className={styles['body-text']}>{formatDate(parseDate(latestVitals?.date))}</span>
            <ConfigurableLink
              className={styles.link}
              to={`\${openmrsSpaBase}/patient/${patientUuid}/chart/Vitals & Biometrics`}
            >
              {t('vitalsHistory', 'Vitals history')}
            </ConfigurableLink>
          </span>
          <div className={styles.backgroundDataFetchingIndicator}>
            <span>{isValidating ? <InlineLoading /> : null}</span>
          </div>
          <div className={styles['button-container']}>
            <Button
              className={`${styles['record-vitals']} ${styles['arrow-up-icon']}`}
              kind="ghost"
              size="sm"
              onClick={launchVitalsAndBiometricsForm}
            >
              {t('recordVitals', 'Record vitals')}
              <ArrowRight size={16} className={styles['arrow-up-button']} title={'ArrowRight'} />
            </Button>
          </div>
        </div>
        <div
          className={
            hasAbnormalValues(latestVitals) && isNotRecordedToday
              ? `${styles['warning-border']}`
              : `${styles['default-border']}`
          }
        >
          <div className={styles['container-row']}>
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
        </div>
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
