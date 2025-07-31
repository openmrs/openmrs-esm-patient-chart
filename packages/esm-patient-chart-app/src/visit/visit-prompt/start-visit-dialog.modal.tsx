import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { launchWorkspace2 } from '@openmrs/esm-framework';
import { launchPatientChartWithWorkspaceOpen } from '@openmrs/esm-patient-common-lib';
import styles from './start-visit-dialog.scss';

interface StartVisitDialogProps {
  patientUuid: string;
  closeModal: () => void;
  launchPatientChart?: boolean;
  onVisitStarted?: () => void;
}

const StartVisitDialog: React.FC<StartVisitDialogProps> = ({ patientUuid, closeModal, launchPatientChart, onVisitStarted }) => {
  const { t } = useTranslation();

  const handleStartNewVisit = useCallback(() => {
    if (launchPatientChart) {
      launchPatientChartWithWorkspaceOpen({
        patientUuid,
        workspaceName: 'start-visit-workspace-form',
        additionalProps: { openedFrom: 'patient-chart-start-visit' },
      });
    } else {
      launchWorkspace2('start-visit-workspace-form', { openedFrom: 'patient-chart-start-visit', onVisitStarted });
    }

    closeModal();
  }, [closeModal, patientUuid, launchPatientChart, onVisitStarted]);

  const modalHeaderText = t('noActiveVisit', 'No active visit');

  const modalBodyText = t(
    'noActiveVisitNoRDEText',
    "You can't add data to the patient chart without an active visit. Would you like to start a new visit?",
  );

  return (
    <div>
      <ModalHeader closeModal={closeModal}>
        <span className={styles.header}>{modalHeaderText}</span>
      </ModalHeader>
      <ModalBody>
        <p className={styles.body}>{modalBodyText}</p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="primary" onClick={handleStartNewVisit}>
          {t('startNewVisit', 'Start new visit')}
        </Button>
      </ModalFooter>
    </div>
  );
};

export default StartVisitDialog;
