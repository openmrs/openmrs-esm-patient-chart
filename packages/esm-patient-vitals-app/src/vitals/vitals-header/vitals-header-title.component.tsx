import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'carbon-components-react';
import ChevronDown16 from '@carbon/icons-react/es/chevron--down/16';
import ChevronUp16 from '@carbon/icons-react/es/chevron--up/16';
import WarningFilled20 from '@carbon/icons-react/es/warning--filled/20';
import { PatientVitals } from '../vitals.resource';
import { patientVitalsBiometricsFormWorkspace } from '../../constants';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import styles from './vitals-header-title.component.scss';
import { formatDate, parseDate } from '@openmrs/esm-framework';

interface VitalsHeaderTitleProps {
  view: string;
  vitals: PatientVitals;
  toggleView(): void;
  showDetails: boolean;
  showRecordVitals: boolean;
}

const VitalsHeaderTitle: React.FC<VitalsHeaderTitleProps> = ({
  view,
  vitals,
  toggleView,
  showDetails,
  showRecordVitals,
}) => {
  const { t } = useTranslation();

  const launchVitalsBiometricsForm = React.useCallback((e) => {
    e.stopPropagation();
    launchPatientWorkspace(patientVitalsBiometricsFormWorkspace);
  }, []);

  return (
    <>
      {vitals && Object.keys(vitals)?.length ? (
        <div className={styles.vitalsHeader} role="button" tabIndex={0} onClick={toggleView}>
          <span className={styles.alignCenter}>
            {view === 'Warning' && (
              <WarningFilled20 title={'WarningFilled'} aria-label="Warning" className={styles.warningIcon} />
            )}
            <span className={styles.vitalName}>Vitals & Biometrics</span>
            <span className={`${styles.bodyShort01} ${styles.text02}`}>
              {t('lastRecorded', 'Last Recorded')}: {formatDate(parseDate(vitals.date.toString()), { mode: 'wide' })}
            </span>
          </span>
          <div className={styles.alignCenter}>
            {showRecordVitals && (
              <Button className={styles.buttonText} kind="ghost" size="small" onClick={launchVitalsBiometricsForm}>
                {t('recordVitals', 'Record Vitals')}
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
      ) : (
        <div className={styles.vitalsHeader}>
          <span className={styles.alignCenter}>
            {view === 'Warning' && <WarningFilled20 aria-label="Warning" className={styles.warningIcon} />}
            <span className={styles.vitalName}>{t('vitalsAndBiometrics', 'Vitals & Biometrics')}</span>
            <span className={styles.bodyShort01}>
              {t('noDataRecorded', 'No data has been recorded for this patient')}
            </span>
          </span>
          {showRecordVitals && (
            <div className={styles.alignCenter}>
              <Button className={styles.buttonText} onClick={launchVitalsBiometricsForm} kind="ghost" size="small">
                {t('recordVitals', 'Record Vitals')}
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default VitalsHeaderTitle;
