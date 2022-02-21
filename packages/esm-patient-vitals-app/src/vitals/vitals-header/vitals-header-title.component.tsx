import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'carbon-components-react';
import ChevronDown16 from '@carbon/icons-react/es/chevron--down/16';
import ChevronUp16 from '@carbon/icons-react/es/chevron--up/16';
import WarningFilled20 from '@carbon/icons-react/es/warning--filled/20';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { formatDate, parseDate } from '@openmrs/esm-framework';
import { patientVitalsBiometricsFormWorkspace } from '../../constants';
import { PatientVitals } from '../vitals.resource';
import styles from './vitals-header-title.component.scss';

interface VitalsHeaderTitleProps {
  view: string;
  vitals: PatientVitals;
  toggleView(): void;
  showDetails: boolean;
  showRecordVitalsButton: boolean;
}

const VitalsHeaderTitle: React.FC<VitalsHeaderTitleProps> = ({
  view,
  vitals,
  toggleView,
  showDetails,
  showRecordVitalsButton,
}) => {
  const { t } = useTranslation();
  const launchVitalsBiometricsForm = React.useCallback((e) => {
    e.stopPropagation();
    launchPatientWorkspace(patientVitalsBiometricsFormWorkspace);
  }, []);

  if (vitals && Object.keys(vitals)?.length) {
    return (
      <div className={styles.vitalsHeader} role="button" tabIndex={0} onClick={toggleView}>
        <span className={styles.container}>
          {view === 'Warning' && (
            <WarningFilled20 title={'WarningFilled'} aria-label="Warning" className={styles.warningIcon} />
          )}
          <span className={styles.heading}>{t('vitalsAndBiometrics', 'Vitals and biometrics')}</span>
          <span className={`${styles.bodyShort01} ${styles.text02}`}>
            {t('lastRecorded', 'Last recorded')}: {formatDate(parseDate(vitals.date.toString()), { mode: 'wide' })}
          </span>
        </span>
        <div className={styles.buttonContainer}>
          {showRecordVitalsButton && (
            <Button className={styles.buttonText} kind="ghost" size="small" onClick={launchVitalsBiometricsForm}>
              {t('recordVitals', 'Record vitals')}
            </Button>
          )}
          {showDetails ? (
            <ChevronUp16
              className={styles.expandButton}
              title={'ChevronUp'}
              onClick={(e) => {
                e.stopPropagation();
                toggleView();
              }}
            />
          ) : (
            <ChevronDown16
              className={styles.expandButton}
              title={'ChevronDown'}
              onClick={(e) => {
                e.stopPropagation();
                toggleView();
              }}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.vitalsHeader}>
      <span className={styles.container}>
        <span className={styles.heading}>{t('vitalsAndBiometrics', 'Vitals and biometrics')}</span>
        <span className={`${styles.bodyShort01} ${styles.text02}`}>
          {t('noDataRecorded', 'No data has been recorded for this patient')}
        </span>
      </span>
      {showRecordVitalsButton && (
        <div className={styles.container}>
          <Button className={styles.buttonText} onClick={launchVitalsBiometricsForm} kind="ghost" size="small">
            {t('recordVitals', 'Record vitals')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default VitalsHeaderTitle;
