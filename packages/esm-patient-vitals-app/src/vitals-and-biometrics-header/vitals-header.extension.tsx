import React, { useCallback, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import isToday from 'dayjs/plugin/isToday';
dayjs.extend(isToday);
dayjs.extend(duration);
import { Trans, useTranslation } from 'react-i18next';
import { Button, InlineLoading, Tag, Toggletip, ToggletipButton, ToggletipContent } from '@carbon/react';
import { ArrowRight, Information } from '@carbon/react/icons';
import { ConfigurableLink, formatDate, parseDate, useConfig, type Visit } from '@openmrs/esm-framework';
import { interpretBloodPressure, useConceptUnits, useVitalsAndBiometrics, useVitalsConceptMetadata } from '../common';
import { type ConfigObject } from '../config-schema';
import { useLaunchVitalsAndBiometricsForm } from '../utils';
import VitalsHeaderItem from './vitals-header-item.component';
import styles from './vitals-header.scss';
import { shouldShowBmi } from '../common/helpers';

interface VitalsHeaderProps {
  patientUuid: string;
  visitContext: Visit;
  patient: fhir.Patient;

  /**
   * custom function to launch the vitals form. Use this in places outside of the patient chart
   * to launch the exported vitals form.
   */
  launchCustomVitalsForm?: () => void;

  /**
   * This is useful for extensions slots using the Vitals Header
   */
  hideLinks?: boolean;
}

const VitalsHeader: React.FC<VitalsHeaderProps> = ({
  patientUuid,
  patient,
  visitContext,
  launchCustomVitalsForm,
  hideLinks = false,
}) => {
  const { t } = useTranslation();
  const config = useConfig<ConfigObject>();
  const { conceptUnits } = useConceptUnits();
  const { data: vitals, isLoading, isValidating } = useVitalsAndBiometrics(patientUuid, 'both');
  const { conceptRanges, conceptRangeMap } = useVitalsConceptMetadata(patientUuid);
  const latestVitals = vitals?.[0];
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const toggleDetailsPanel = () => setShowDetailsPanel(!showDetailsPanel);
  const isActiveVisit = Boolean(visitContext && !visitContext.stopDatetime);
  const launchForm = useLaunchVitalsAndBiometricsForm(patientUuid);
  const showBmi = useMemo(() => shouldShowBmi(patient, config.biometrics), [patient, config.biometrics]);

  const launchVitalsAndBiometricsForm = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      if (launchCustomVitalsForm) {
        launchCustomVitalsForm();
      } else {
        launchForm();
      }
    },
    [launchForm, launchCustomVitalsForm],
  );

  if (isLoading) {
    return (
      <InlineLoading role="progressbar" className={styles.loading} description={`${t('loading', 'Loading')} ...`} />
    );
  }

  if (latestVitals && Object.keys(latestVitals)?.length && conceptRanges?.length) {
    const now = dayjs();
    const vitalsTakenTimeAgo = dayjs.duration(now.diff(latestVitals?.date));
    const vitalsOverdueThresholdHours = config.vitals.vitalsOverdueThresholdHours;
    const areVitalsOverdue = isActiveVisit && vitalsTakenTimeAgo.asHours() >= vitalsOverdueThresholdHours;
    const vitalsOverdueDayCount = Math.round(vitalsTakenTimeAgo.asDays());
    const hoursSinceVitalsTaken = Math.round(vitalsTakenTimeAgo.asHours());
    let overdueVitalsTagContent: React.ReactNode = null;

    if (vitalsOverdueDayCount < 1) {
      overdueVitalsTagContent = (
        <Trans i18nKey="hoursOldVitals" count={hoursSinceVitalsTaken}>
          <span>
            {/* @ts-ignore https://github.com/i18next/react-i18next/issues/1543 */}
            These vitals are <strong>{{ count: hoursSinceVitalsTaken }} hour old</strong>
          </span>
        </Trans>
      );
    } else if (vitalsOverdueDayCount >= 1 && vitalsOverdueDayCount < 7) {
      overdueVitalsTagContent = (
        <Trans i18nKey="daysOldVitals" count={vitalsOverdueDayCount}>
          <span>
            {/* @ts-ignore https://github.com/i18next/react-i18next/issues/1543 */}
            These vitals are <strong>{{ count: vitalsOverdueDayCount }} day old</strong>
          </span>
        </Trans>
      );
    } else if (vitalsOverdueDayCount >= 8 && vitalsOverdueDayCount <= 14) {
      overdueVitalsTagContent = (
        <Trans i18nKey="overOneWeekOldVitals">
          <span>
            These vitals are <strong>over one week old</strong>
          </span>
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

    const formatRange = (range: { lowNormal: number | null; hiNormal: number | null }) =>
      range.lowNormal != null && range.hiNormal != null
        ? `${range.lowNormal}–${range.hiNormal}`
        : range.lowNormal != null
          ? `≥ ${range.lowNormal}`
          : range.hiNormal != null
            ? `≤ ${range.hiNormal}`
            : '-';

    const sysRange = conceptRangeMap?.get(config.concepts.systolicBloodPressureUuid);
    const diaRange = conceptRangeMap?.get(config.concepts.diastolicBloodPressureUuid);
    const bpUnit = conceptUnits.get(config.concepts.systolicBloodPressureUuid);

    return (
      <div className={styles.container}>
        <div className={styles.vitalsHeader} role="button" tabIndex={0} onClick={toggleDetailsPanel}>
          <div className={styles.headerItems}>
            <span className={styles.heading}>{t('vitalsAndBiometrics', 'Vitals and biometrics')}</span>
            <span className={styles.bodyText}>
              {formatDate(parseDate(latestVitals?.date), { day: true, time: true })}
            </span>
            {areVitalsOverdue ? (
              <Tag className={styles.tag} type="red">
                <span className={styles.overdueIndicator}>{overdueVitalsTagContent}</span>
              </Tag>
            ) : null}
            {!hideLinks && (
              <ConfigurableLink
                className={styles.link}
                to={`\${openmrsSpaBase}/patient/${patientUuid}/chart/vitals-and-biometrics`}
              >
                {t('vitalsHistory', 'Vitals history')}
              </ConfigurableLink>
            )}
            {conceptRangeMap?.size > 0 && (
              <Toggletip align="bottom-start" autoAlign className={styles.referenceRangeToggletip}>
                <ToggletipButton
                  className={styles.referenceRangeButton}
                  label={t('viewNormalRanges', 'View normal ranges')}
                >
                  <Information size={16} />
                </ToggletipButton>
                <ToggletipContent className={styles.referenceRangeContent}>
                  <p className={styles.referenceRangeHeading}>{t('normalRanges', 'Normal ranges')}</p>
                  <div className={styles.referenceRangeTable}>
                    {sysRange && diaRange && (
                      <div className={styles.referenceRangeRow}>
                        <span className={styles.referenceRangeLabel}>{t('bloodPressureAbbreviated', 'BP')}</span>
                        <span className={styles.referenceRangeValue}>
                          {`${formatRange(sysRange)} / ${formatRange(diaRange)} ${bpUnit ?? ''}`}
                        </span>
                      </div>
                    )}
                    {[
                      {
                        label: t('heartRate', 'Heart rate'),
                        uuid: config.concepts.pulseUuid,
                        unit: conceptUnits.get(config.concepts.pulseUuid),
                      },
                      {
                        label: t('respiratoryRate', 'R. rate'),
                        uuid: config.concepts.respiratoryRateUuid,
                        unit: conceptUnits.get(config.concepts.respiratoryRateUuid),
                      },
                      {
                        label: t('spo2', 'SpO2'),
                        uuid: config.concepts.oxygenSaturationUuid,
                        unit: conceptUnits.get(config.concepts.oxygenSaturationUuid),
                      },
                      {
                        label: t('temperatureAbbreviated', 'Temp'),
                        uuid: config.concepts.temperatureUuid,
                        unit: conceptUnits.get(config.concepts.temperatureUuid),
                      },
                    ]
                      .filter(({ uuid }) => uuid && conceptRangeMap?.get(uuid))
                      .map(({ label, uuid, unit }) => {
                        const rangeValue = formatRange(conceptRangeMap.get(uuid));
                        return (
                          <div key={uuid} className={styles.referenceRangeRow}>
                            <span className={styles.referenceRangeLabel}>{label}</span>
                            <span className={styles.referenceRangeValue}>
                              {unit ? `${rangeValue} ${unit}` : rangeValue}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </ToggletipContent>
              </Toggletip>
            )}
          </div>
          {isValidating ? (
            <div className={styles.backgroundDataFetchingIndicator}>
              <span>{isValidating ? <InlineLoading /> : null}</span>
            </div>
          ) : null}
          {!hideLinks && (
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
          )}
        </div>
        <div className={styles.rowContainer}>
          <div className={styles.row}>
            <VitalsHeaderItem
              interpretation={interpretBloodPressure(
                latestVitals?.systolic,
                latestVitals?.diastolic,
                config?.concepts,
                conceptRanges,
                latestVitals?.systolicRenderInterpretation,
                latestVitals?.diastolicRenderInterpretation,
              )}
              patientUuid={patientUuid}
              unitName={t('bp', 'BP')}
              unitSymbol={
                latestVitals?.systolic != null ? conceptUnits.get(config.concepts.systolicBloodPressureUuid) ?? '' : ''
              }
              value={`${latestVitals?.systolic ?? '--'} / ${latestVitals?.diastolic ?? '--'}`}
            />
            <VitalsHeaderItem
              conceptUuid={config.concepts.pulseUuid}
              interpretation={latestVitals?.pulseRenderInterpretation}
              patientUuid={patientUuid}
              unitName={t('heartRate', 'Heart rate')}
              unitSymbol={latestVitals?.pulse != null ? conceptUnits.get(config.concepts.pulseUuid) ?? '' : ''}
              value={latestVitals?.pulse ?? '--'}
            />
            <VitalsHeaderItem
              conceptUuid={config.concepts.respiratoryRateUuid}
              interpretation={latestVitals?.respiratoryRateRenderInterpretation}
              patientUuid={patientUuid}
              unitName={t('respiratoryRate', 'R. rate')}
              unitSymbol={
                latestVitals?.respiratoryRate != null ? conceptUnits.get(config.concepts.respiratoryRateUuid) ?? '' : ''
              }
              value={latestVitals?.respiratoryRate ?? '--'}
            />
            <VitalsHeaderItem
              conceptUuid={config.concepts.oxygenSaturationUuid}
              interpretation={latestVitals?.spo2RenderInterpretation}
              patientUuid={patientUuid}
              unitName={t('spo2', 'SpO2')}
              unitSymbol={
                latestVitals?.spo2 != null ? conceptUnits.get(config.concepts.oxygenSaturationUuid) ?? '' : ''
              }
              value={latestVitals?.spo2 ?? '--'}
            />
            <VitalsHeaderItem
              conceptUuid={config.concepts.temperatureUuid}
              interpretation={latestVitals?.temperatureRenderInterpretation}
              patientUuid={patientUuid}
              unitName={t('temperatureAbbreviated', 'Temp')}
              unitSymbol={
                latestVitals?.temperature != null ? conceptUnits.get(config.concepts.temperatureUuid) ?? '' : ''
              }
              value={latestVitals?.temperature ?? '--'}
            />
            <VitalsHeaderItem
              patientUuid={patientUuid}
              unitName={t('weight', 'Weight')}
              unitSymbol={latestVitals?.weight != null ? conceptUnits.get(config.concepts.weightUuid) ?? '' : ''}
              value={latestVitals?.weight ?? '--'}
            />
            <VitalsHeaderItem
              patientUuid={patientUuid}
              unitName={t('height', 'Height')}
              unitSymbol={latestVitals?.height != null ? conceptUnits.get(config.concepts.heightUuid) ?? '' : ''}
              value={latestVitals?.height ?? '--'}
            />
            {showBmi && (
              <VitalsHeaderItem
                patientUuid={patientUuid}
                unitName={t('bmi', 'BMI')}
                unitSymbol={latestVitals?.bmi != null ? config.biometrics['bmiUnit'] ?? '' : ''}
                value={latestVitals?.bmi ?? '--'}
              />
            )}
            {latestVitals?.muac != null && (
              <VitalsHeaderItem
                patientUuid={patientUuid}
                unitName={t('muac', 'MUAC')}
                unitSymbol={
                  latestVitals?.muac != null ? conceptUnits.get(config.concepts.midUpperArmCircumferenceUuid) ?? '' : ''
                }
                value={latestVitals?.muac ?? '--'}
              />
            )}
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

      {!hideLinks && (
        <Button className={styles.recordVitalsButton} kind="ghost" onClick={launchVitalsAndBiometricsForm} size="sm">
          {t('recordVitals', 'Record vitals')}
          <ArrowRight size={16} className={styles.recordVitalsIconButton} />
        </Button>
      )}
    </div>
  );
};

export default VitalsHeader;
