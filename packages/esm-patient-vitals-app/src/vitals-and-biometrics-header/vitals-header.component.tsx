import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
dayjs.extend(isToday);
import { useTranslation } from 'react-i18next';
import { Button, InlineLoading, Tag } from '@carbon/react';
import { ArrowRight, Time } from '@carbon/react/icons';
import { ConfigurableLink, formatDate, parseDate, useConfig } from '@openmrs/esm-framework';
import { useVisitOrOfflineVisit, useWorkspaces } from '@openmrs/esm-patient-common-lib';
import {
  assessValue,
  getReferenceRangesForConcept,
  interpretBloodPressure,
  useVitalsAndBiometrics,
  useVitalsConceptMetadata,
} from '../common';
import { type ConfigObject } from '../config-schema';
import { launchVitalsAndBiometricsForm as launchForm } from '../utils';
import VitalsHeaderItem from './vitals-header-item.component';
import styles from './vitals-header.scss';

interface VitalsHeaderProps {
  patientUuid: string;
}

const VitalsHeader: React.FC<VitalsHeaderProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const config = useConfig<ConfigObject>();
  const { data: conceptUnits, conceptMetadata } = useVitalsConceptMetadata();
  const { data: vitals, isLoading, isValidating } = useVitalsAndBiometrics(patientUuid, 'both');
  const latestVitals = vitals?.[0];
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const toggleDetailsPanel = () => setShowDetailsPanel(!showDetailsPanel);
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);
  const { workspaces } = useWorkspaces();

  const isWorkspaceOpen = useCallback(() => {
    return Boolean(workspaces?.length);
  }, [workspaces]);

  const launchVitalsAndBiometricsForm = useCallback(
    (e: Event) => {
      e.stopPropagation();
      launchForm(currentVisit, config);
    },
    [config, currentVisit],
  );

  if (isLoading) {
    return (
      <InlineLoading role="progressbar" className={styles.loading} description={`${t('loading', 'Loading')} ...`} />
    );
  }

  if (latestVitals && Object.keys(latestVitals)?.length && conceptMetadata?.length) {
    const hasActiveVisit = Boolean(currentVisit?.uuid);
    const vitalsTakenToday = Boolean(dayjs(latestVitals?.date).isToday());
    const vitalsOverdue = hasActiveVisit && !vitalsTakenToday;

    return (
      <div className={styles['background']}>
        <div className={styles['vitals-header']} role="button" tabIndex={0} onClick={toggleDetailsPanel}>
          <span className={styles.container}>
            <span className={styles.heading}>{t('vitalsAndBiometrics', 'Vitals and biometrics')}</span>
            <span className={styles['body-text']}>
              {formatDate(parseDate(latestVitals?.date), { day: true, time: true })}
            </span>
            {vitalsOverdue ? (
              <div className={styles.tag}>
                <Tag type="red">
                  <span className={styles.overdueIndicator}>
                    <Time />
                    {t('overdue', 'Overdue')}
                  </span>
                </Tag>
              </div>
            ) : null}
            <ConfigurableLink
              className={styles.link}
              to={`\${openmrsSpaBase}/patient/${patientUuid}/chart/Vitals & Biometrics`}
            >
              {t('vitalsHistory', 'Vitals history')}
            </ConfigurableLink>
          </span>
          {isValidating ? (
            <div className={styles.backgroundDataFetchingIndicator}>
              <span>{isValidating ? <InlineLoading /> : null}</span>
            </div>
          ) : null}
          <div className={styles['button-container']}>
            <Button
              className={classNames(styles['record-vitals'], styles['arrow-up-icon'])}
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
          className={classNames(styles['row-container'], {
            [styles['workspace-open']]: isWorkspaceOpen(),
          })}
        >
          <div className={styles.row}>
            <VitalsHeaderItem
              interpretation={interpretBloodPressure(
                latestVitals?.systolic,
                latestVitals?.diastolic,
                config?.concepts,
                conceptMetadata,
              )}
              unitName={t('bp', 'BP')}
              unitSymbol={(latestVitals?.systolic && conceptUnits.get(config.concepts.systolicBloodPressureUuid)) ?? ''}
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
                latestVitals?.respiratoryRate,
                getReferenceRangesForConcept(config.concepts.respiratoryRateUuid, conceptMetadata),
              )}
              unitName={t('respiratoryRate', 'R. rate')}
              unitSymbol={
                (latestVitals?.respiratoryRate && conceptUnits.get(config.concepts.respiratoryRateUuid)) ?? ''
              }
              value={latestVitals?.respiratoryRate ?? '--'}
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
            <VitalsHeaderItem
              interpretation={assessValue(
                latestVitals.temperature,
                getReferenceRangesForConcept(config.concepts.temperatureUuid, conceptMetadata),
              )}
              unitName={t('temperatureAbbreviated', 'Temp')}
              unitSymbol={(latestVitals?.temperature && conceptUnits.get(config.concepts.temperatureUuid)) ?? ''}
              value={latestVitals?.temperature ?? '--'}
            />
            <VitalsHeaderItem
              unitName={t('weight', 'Weight')}
              unitSymbol={(latestVitals?.weight && conceptUnits.get(config.concepts.weightUuid)) ?? ''}
              value={latestVitals?.weight ?? '--'}
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
        <Button
          className={classNames(styles['record-vitals'], styles['arrow-up-icon'])}
          onClick={launchVitalsAndBiometricsForm}
          kind="ghost"
          size="sm"
        >
          {t('recordVitals', 'Record vitals')}
          <ArrowRight size={16} className={styles['arrow-up-button']} title={'ArrowRight'} />
        </Button>
      </div>
    </div>
  );
};

export default VitalsHeader;
