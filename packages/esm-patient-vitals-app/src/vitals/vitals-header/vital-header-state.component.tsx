import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import isEmpty from 'lodash-es/isEmpty';
import first from 'lodash-es/first';
import VitalHeaderStateDetails from './vital-header-details.component';
import VitalsHeaderStateTitle from './vital-header-title.component';
import InlineLoading from 'carbon-components-react/es/components/InlineLoading';
import styles from './vital-header-state.component.scss';
import { useTranslation } from 'react-i18next';
import { useConfig, createErrorHandler } from '@openmrs/esm-framework';
import { PatientVitals, performPatientsVitalsSearch } from '../vitals-biometrics.resource';
import { useVitalsSignsConceptMetaData } from '../vitals-biometrics-form/use-vitalsigns';

interface ViewState {
  view: 'Default' | 'Warning';
}

interface VitalHeaderProps {
  patientUuid: string;
  showRecordVitals: boolean;
}

const VitalHeader: React.FC<VitalHeaderProps> = ({ patientUuid, showRecordVitals }) => {
  const { t } = useTranslation();
  const config = useConfig();
  const [vital, setVital] = useState<PatientVitals>();
  const [displayState, setDisplayState] = useState<ViewState>({
    view: 'Default',
  });
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const toggleView = () => setShowDetails((prevState) => !prevState);
  const cls = displayState.view === 'Warning' ? styles.warningBackground : styles.defaultBackground;
  const { conceptsUnits } = useVitalsSignsConceptMetaData();
  const [
    bloodPressureUnit,
    ,
    temperatureUnit,
    heightUnit,
    weightUnit,
    pulseUnit,
    oxygenSaturationUnit,
    midUpperArmCircumferenceUnit,
    respiratoryRateUnit,
  ] = conceptsUnits;
  useEffect(() => {
    if (patientUuid) {
      const subscription = performPatientsVitalsSearch(config.concepts, patientUuid, 10).subscribe((vitals) => {
        setVital(first(vitals));
        setIsLoading(false);
      }, createErrorHandler);
      return () => subscription.unsubscribe();
    }
  }, [patientUuid, config.concepts]);

  useEffect(() => {
    if (vital && !dayjs(vital.date).isToday()) {
      setDisplayState({ view: 'Warning' });
    }

    if (!isLoading && isEmpty(vital)) {
      setDisplayState({ view: 'Warning' });
    }
  }, [vital, isLoading]);

  return (
    <>
      {!isLoading ? (
        <div className={`${cls} ${styles.vitalHeaderStateContainer}`}>
          <VitalsHeaderStateTitle
            toggleView={toggleView}
            showDetails={showDetails}
            view={displayState.view}
            vitals={vital}
            showRecordVitals={showRecordVitals}
          />
          {showDetails && (
            <div className={`${cls} ${styles.overlay}`}>
              <div className={styles.row}>
                <VitalHeaderStateDetails
                  unitName={t('temperatureAbbreviated', 'Temp')}
                  unitSymbol={temperatureUnit}
                  value={vital.temperature}
                />
                <VitalHeaderStateDetails
                  unitName={t('bp', 'BP')}
                  unitSymbol={bloodPressureUnit}
                  value={`${vital.systolic} / ${vital.diastolic}`}
                />
                <VitalHeaderStateDetails
                  unitName={t('heartRate', 'Heart Rate')}
                  unitSymbol={pulseUnit}
                  value={vital.pulse}
                />
                <VitalHeaderStateDetails
                  unitName={t('spo2', 'SpO2')}
                  unitSymbol={oxygenSaturationUnit}
                  value={vital.oxygenSaturation}
                />
              </div>
              <div className={styles.row}>
                <VitalHeaderStateDetails
                  unitName={t('respiratoryRate', 'R. Rate')}
                  unitSymbol={respiratoryRateUnit}
                  value={vital.respiratoryRate}
                />
                <VitalHeaderStateDetails
                  unitName={t('height', 'Height')}
                  unitSymbol={heightUnit}
                  value={vital.height}
                />
                <VitalHeaderStateDetails
                  unitName={t('bmi', 'BMI')}
                  unitSymbol={config.biometrics['bmiUnit']}
                  value={vital.bmi}
                />
                <VitalHeaderStateDetails
                  unitName={t('weight', 'Weight')}
                  unitSymbol={weightUnit}
                  value={vital.weight}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <InlineLoading className={styles.loading} description={`${t('loading', 'Loading')} ...`} />
      )}
    </>
  );
};

export default VitalHeader;
