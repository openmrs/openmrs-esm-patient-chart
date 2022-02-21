import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import InlineLoading from 'carbon-components-react/es/components/InlineLoading';
import VitalsHeaderItem from './vitals-header-item.component';
import VitalsHeaderTitle from './vitals-header-title.component';
import { useConfig } from '@openmrs/esm-framework';
import { ObsMetaInfo, useVitalsConceptMetadata } from '@openmrs/esm-patient-common-lib';
import { useVitals } from '../vitals.resource';
import { ConfigObject } from '../../config-schema';
import styles from './vitals-header.component.scss';

export enum ObservationInterpretation {
  LOW = 'low',
  CRITICALLY_LOW = 'critically_low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICALLY_HIGH = 'critically_high',
}

interface VitalsHeaderProps {
  patientUuid: string;
  showRecordVitalsButton: boolean;
}

const VitalsHeader: React.FC<VitalsHeaderProps> = ({ patientUuid, showRecordVitalsButton }) => {
  const config = useConfig() as ConfigObject;
  const { t } = useTranslation();
  const { vitals, isLoading } = useVitals(patientUuid, true);
  const { data: conceptUnits, conceptMetadata } = useVitalsConceptMetadata();
  const latestVitals = vitals?.[0];

  const isAbnormalDiastolicValue =
    assessValue(
      latestVitals?.diastolic,
      conceptMetadata?.find((metadata) => metadata.uuid === config.concepts.diastolicBloodPressureUuid),
    ) !== ObservationInterpretation.NORMAL;

  const isAbnormalSystolicValue =
    assessValue(
      latestVitals?.systolic,
      conceptMetadata?.find((metadata) => metadata.uuid === config.concepts.systolicBloodPressureUuid),
    ) !== ObservationInterpretation.NORMAL;

  const isAbnormalOxygenSaturationValue =
    assessValue(
      latestVitals?.oxygenSaturation,
      conceptMetadata?.find((metadata) => metadata.uuid === config.concepts.oxygenSaturationUuid),
    ) !== ObservationInterpretation.NORMAL;

  const isNotRecentAndHasAbnormalValues =
    latestVitals &&
    Object.keys(latestVitals).length &&
    !dayjs(latestVitals.date).isToday() &&
    (isAbnormalDiastolicValue || isAbnormalSystolicValue || isAbnormalOxygenSaturationValue)
      ? true
      : false;

  const [showDetails, setShowDetails] = useState(false);
  const toggleIsDetailsPanelOpen = () => setShowDetails(!showDetails);

  if (isLoading) {
    return (
      <InlineLoading role="progressbar" className={styles.loading} description={`${t('loading', 'Loading')} ...`} />
    );
  }

  return (
    <div
      className={`${
        latestVitals && isNotRecentAndHasAbnormalValues ? styles.warningBackground : styles.defaultBackground
      } ${styles.vitalHeaderStateContainer}`}
    >
      <VitalsHeaderTitle
        showDetails={showDetails}
        showRecordVitalsButton={showRecordVitalsButton}
        toggleView={toggleIsDetailsPanelOpen}
        view={isNotRecentAndHasAbnormalValues ? 'Warning' : 'Default'}
        vitals={latestVitals}
      />
      {showDetails && (
        <div className={isNotRecentAndHasAbnormalValues ? `${styles.warningBorder}` : `${styles.defaultBorder}`}>
          <div className={styles.row}>
            <VitalsHeaderItem
              unitName={t('temperatureAbbreviated', 'Temp')}
              unitSymbol={conceptUnits.get(config.concepts.temperatureUuid) ?? ''}
              value={latestVitals?.temperature}
            />
            <VitalsHeaderItem
              flaggedAbnormal={isAbnormalDiastolicValue || isAbnormalSystolicValue}
              unitName={t('bp', 'BP')}
              unitSymbol={conceptUnits.get(config.concepts.systolicBloodPressureUuid) ?? ''}
              value={`${latestVitals?.systolic ?? '-'} / ${latestVitals?.diastolic ?? '-'}`}
            />
            <VitalsHeaderItem
              unitName={t('heartRate', 'Heart rate')}
              unitSymbol={conceptUnits.get(config.concepts.pulseUuid) ?? ''}
              value={latestVitals?.pulse}
            />
            <VitalsHeaderItem
              flaggedAbnormal={isAbnormalOxygenSaturationValue}
              interpretation={assessValue(
                latestVitals?.oxygenSaturation,
                conceptMetadata?.find((metadata) => metadata.uuid === config.concepts.oxygenSaturationUuid),
              )}
              unitName={t('spo2', 'SpO2')}
              unitSymbol={conceptUnits.get(config.concepts.oxygenSaturationUuid) ?? ''}
              value={latestVitals?.oxygenSaturation}
            />
          </div>
          <div className={styles.row}>
            <VitalsHeaderItem
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
      )}
    </div>
  );
};

export default VitalsHeader;

function assessValue(value: number, range: ObsMetaInfo): ObservationInterpretation {
  if (exists(range?.hiCritical) && value > range.hiCritical) {
    return ObservationInterpretation.CRITICALLY_HIGH;
  }

  if (exists(range?.highNormal) && value > range.highNormal) {
    return ObservationInterpretation.HIGH;
  }

  if (exists(range?.lowCritical) && value < range.lowCritical) {
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
