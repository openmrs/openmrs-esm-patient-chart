import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import isToday from 'dayjs/plugin/isToday';
dayjs.extend(isToday);
dayjs.extend(duration);
import { Trans, useTranslation } from 'react-i18next';
import { Button, InlineLoading, Tag } from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';
import { ConfigurableLink, formatDate, parseDate, useConfig, useWorkspaces } from '@openmrs/esm-framework';
import { useVisitOrOfflineVisit } from '@openmrs/esm-patient-common-lib';
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

  const isWorkspaceOpen = useCallback(() => Boolean(workspaces?.length), [workspaces]);

  const launchVitalsAndBiometricsForm = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
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
    const now = dayjs();
    const vitalsOverdueDayCount = Math.round(dayjs.duration(now.diff(latestVitals?.date)).asDays());

    let overdueVitalsTagContent: React.ReactNode = null;

    if (vitalsOverdueDayCount >= 1 && vitalsOverdueDayCount < 7) {
      overdueVitalsTagContent = (
        <Trans i18nKey="daysOldVitals" count={vitalsOverdueDayCount}>
          <span>
            {/* @ts-ignore Workaround for i18next types issue (see https://github.com/i18next/react-i18next/issues/1543 and https://github.com/i18next/react-i18next/issues/465). Additionally, I can't find a way to get the proper plural suffix to be used in the translation file without amending the translation file by hand. */}
            These vitals are <strong>{{ count: vitalsOverdueDayCount }} day old</strong>
          </span>
        </Trans>
      );
    } else if (vitalsOverdueDayCount >= 8 && vitalsOverdueDayCount <= 14) {
      overdueVitalsTagContent = (
        <Trans i18nKey="overOneWeekOldVitals">
          <span>These vitals are</span>
        </Trans>
      );
    } else {
      overdueVitalsTagContent = (
        <Trans i18nKey="outOfDateVitals">
          <span>
            These vitals are <strong>out of date</strong>
          </span>
        </Trans>
      );
    }

    return (
      <div className={styles.container}>
        <div className={styles.vitalsHeader} role="button" tabIndex={0} onClick={toggleDetailsPanel}>
          <div className={styles.headerItems}>
            <span className={styles.heading}>{t('vitalsAndBiometrics', 'Vitals and biometrics')}</span>
            <span className={styles.bodyText}>
              {formatDate(parseDate(latestVitals?.date), { day: true, time: true })}
            </span>
            {vitalsOverdue ? (
              <Tag className={styles.tag} type="red">
                <span className={styles.overdueIndicator}>{overdueVitalsTagContent}</span>
              </Tag>
            ) : null}
            <ConfigurableLink
              className={styles.link}
              to={`\${openmrsSpaBase}/patient/${patientUuid}/chart/Vitals & Biometrics`}
            >
              {t('vitalsHistory', 'Vitals history')}
            </ConfigurableLink>
          </div>
          {isValidating ? (
            <div className={styles.backgroundDataFetchingIndicator}>
              <span>{isValidating ? <InlineLoading /> : null}</span>
            </div>
          ) : null}
          <div className={styles.buttonContainer}>
            <Button
              className={styles.recordVitalsButton}
              data-openmrs-role="Record Vitals"
              kind="ghost"
              onClick={launchVitalsAndBiometricsForm}
              size="sm"
            >
              {t('recordVitals', 'Record vitals')}
              <ArrowRight size={16} className={styles.recordVitalsIconButton} />
            </Button>
          </div>
        </div>
        <div
          className={classNames(styles.rowContainer, {
            [styles.workspaceOpen]: isWorkspaceOpen(),
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
                latestVitals?.temperature,
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
    <div className={styles.emptyStateVitalsHeader}>
      <div className={styles.container}>
        <span className={styles.heading}>{t('vitalsAndBiometrics', 'Vitals and biometrics')}</span>
        <span className={styles.bodyText}>{t('noDataRecorded', 'No data has been recorded for this patient')}</span>
      </div>

      <Button className={styles.recordVitalsButton} kind="ghost" onClick={launchVitalsAndBiometricsForm} size="sm">
        {t('recordVitals', 'Record vitals')}
        <ArrowRight size={16} className={styles.recordVitalsIconButton} />
      </Button>
    </div>
  );
};

export default VitalsHeader;
