import React from 'react';
import { Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import styles from './form-error.scss';

interface FormErrorProps {
  closeWorkspace: () => void;
}

const FormError: React.FC<FormErrorProps> = ({ closeWorkspace }) => {
  const { t } = useTranslation();

  const handleOpenFormList = () => {
    closeWorkspace();
    launchPatientWorkspace('clinical-forms-workspace');
  };

  return (
    <div className={styles.errorContainer}>
      <div className={styles.formErrorCard}>
        <p className={styles.errorTitle}>{t('errorTitle', 'There was an error with this form')}</p>
        <div className={styles.errorMessage}>
          <span>{t('tryAgainMessage', 'Try opening another form from')}</span>
          <span className={styles.list} role="button" tabIndex={0} onClick={handleOpenFormList}>
            {t('thisList', 'this list')}
          </span>
        </div>
        <div className={styles.separator}>{t('or', 'or')}</div>
        <Button onClick={closeWorkspace} kind="ghost">
          {t('closeThisPanel', 'Close this panel')}
        </Button>
      </div>
    </div>
  );
};

export default FormError;
