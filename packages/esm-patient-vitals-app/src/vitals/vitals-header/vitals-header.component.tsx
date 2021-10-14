import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import InlineLoading from 'carbon-components-react/es/components/InlineLoading';
import VitalsHeaderItem from './vitals-header-item.component';
import VitalsHeaderTitle from './vitals-header-title.component';
import { useConfig } from '@openmrs/esm-framework';
import { useVitalsConceptMetadata } from '@openmrs/esm-patient-common-lib';
import { useVitals } from '../vitals.resource';
import styles from './vitals-header.component.scss';

interface VitalsHeaderProps {
  patientUuid: string;
  showRecordVitals: boolean;
}

const VitalsHeader: React.FC<VitalsHeaderProps> = ({ patientUuid, showRecordVitals }) => {
  const config = useConfig();
  const { t } = useTranslation();
  const { data: vitals, isLoading } = useVitals(patientUuid);
  const { data: conceptData } = useVitalsConceptMetadata();
  const conceptUnits = conceptData?.conceptUnits ? conceptData.conceptUnits : null;
  const latestVitals = vitals?.[0];

  const [showDetails, setShowDetails] = useState(false);

  const toggleView = () => setShowDetails((prevState) => !prevState);

  return (
    <>
      {isLoading ? (
        <InlineLoading role="progressbar" className={styles.loading} description={`${t('loading', 'Loading')} ...`} />
      ) : (
        <div
          className={`${
            latestVitals && Object.keys(latestVitals)?.length && !dayjs(latestVitals.date).isToday()
              ? styles.warningBackground
              : styles.defaultBackground
          } ${styles.vitalHeaderStateContainer}`}
        >
          <VitalsHeaderTitle
            showDetails={showDetails}
            showRecordVitals={showRecordVitals}
            toggleView={toggleView}
            view={''}
            vitals={latestVitals}
          />
          {showDetails && (
            <div>
              <div className={styles.row}>
                <VitalsHeaderItem
                  unitName={t('temperatureAbbreviated', 'Temp')}
                  unitSymbol={conceptUnits?.[2] ?? ''}
                  value={latestVitals?.temperature}
                />
                <VitalsHeaderItem
                  unitName={t('bp', 'BP')}
                  unitSymbol={conceptUnits?.[0] ?? ''}
                  value={`${latestVitals?.systolic} / ${latestVitals?.diastolic}`}
                />
                <VitalsHeaderItem
                  unitName={t('heartRate', 'Heart Rate')}
                  unitSymbol={conceptUnits?.[5] ?? ''}
                  value={latestVitals?.pulse}
                />
                <VitalsHeaderItem
                  unitName={t('spo2', 'SpO2')}
                  unitSymbol={conceptUnits?.[6] ?? ''}
                  value={latestVitals?.oxygenSaturation}
                />
              </div>
              <div className={styles.row}>
                <VitalsHeaderItem
                  unitName={t('respiratoryRate', 'R. Rate')}
                  unitSymbol={conceptUnits?.[8] ?? ''}
                  value={latestVitals?.respiratoryRate}
                />
                <VitalsHeaderItem
                  unitName={t('height', 'Height')}
                  unitSymbol={conceptUnits?.[3] ?? ''}
                  value={latestVitals?.height}
                />
                <VitalsHeaderItem
                  unitName={t('bmi', 'BMI')}
                  unitSymbol={config.biometrics['bmiUnit']}
                  value={latestVitals?.bmi}
                />
                <VitalsHeaderItem
                  unitName={t('weight', 'Weight')}
                  unitSymbol={conceptUnits?.[4] ?? ''}
                  value={latestVitals?.weight}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default VitalsHeader;
