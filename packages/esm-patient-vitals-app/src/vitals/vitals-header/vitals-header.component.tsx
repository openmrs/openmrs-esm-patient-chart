import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import InlineLoading from 'carbon-components-react/es/components/InlineLoading';
import VitalsHeaderItem from './vitals-header-item.component';
import VitalsHeaderTitle from './vitals-header-title.component';
import { useConfig } from '@openmrs/esm-framework';
import { useVitalsConceptMetadata } from '@openmrs/esm-patient-common-lib';
import { useVitals } from '../vitals.resource';
import { ConfigObject } from '../../config-schema';
import styles from './vitals-header.component.scss';

interface VitalsHeaderProps {
  patientUuid: string;
  showRecordVitalsButton: boolean;
}

const VitalsHeader: React.FC<VitalsHeaderProps> = ({ patientUuid, showRecordVitalsButton }) => {
  const config = useConfig() as ConfigObject;
  const { t } = useTranslation();
  const { vitals, isLoading } = useVitals(patientUuid);
  const { data: conceptUnits } = useVitalsConceptMetadata();
  const latestVitals = vitals?.[0];

  const isLowDiastolic = latestVitals?.diastolic < latestVitals?.diastolicRange?.low?.value;
  const isHighDiastolic = latestVitals?.diastolic > latestVitals?.diastolicRange?.high?.value;
  const isLowSystolic = latestVitals?.systolic < latestVitals?.systolicRange?.low?.value;
  const isHighSystolic = latestVitals?.systolic > latestVitals?.systolicRange?.high?.value;
  const isAbnormalBloodPressure = isLowSystolic || isHighSystolic || isLowDiastolic || isHighDiastolic;
  const isAbnormalOxygenSaturation = latestVitals?.oxygenSaturation < latestVitals?.oxygenSaturationRange?.low?.value;

  const hasAbnormalValues =
    latestVitals &&
    Object.keys(latestVitals).length &&
    !dayjs(latestVitals.date).isToday() &&
    (isAbnormalBloodPressure || isAbnormalOxygenSaturation)
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
      className={`${latestVitals && hasAbnormalValues ? styles.warningBackground : styles.defaultBackground} ${
        styles.vitalHeaderStateContainer
      }`}
    >
      <VitalsHeaderTitle
        showDetails={showDetails}
        showRecordVitalsButton={showRecordVitalsButton}
        toggleView={toggleIsDetailsPanelOpen}
        view={hasAbnormalValues ? 'Warning' : 'Default'}
        vitals={latestVitals}
      />
      {showDetails && (
        <div className={hasAbnormalValues ? `${styles.warningBorder}` : `${styles.defaultBorder}`}>
          <div className={styles.row}>
            <VitalsHeaderItem
              unitName={t('temperatureAbbreviated', 'Temp')}
              unitSymbol={conceptUnits.get(config.concepts.temperatureUuid) ?? ''}
              value={latestVitals?.temperature}
            />
            <VitalsHeaderItem
              flaggedAbnormal={isAbnormalBloodPressure}
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
              flaggedAbnormal={isAbnormalOxygenSaturation}
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
