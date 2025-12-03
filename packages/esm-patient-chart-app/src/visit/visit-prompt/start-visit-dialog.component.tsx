import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { launchWorkspace } from '@openmrs/esm-framework';
import { launchPatientChartWithWorkspaceOpen } from '@openmrs/esm-patient-common-lib';
import { AccessibleModal } from '../../components/accessible-modal';
import styles from './start-visit-dialog.scss';

interface StartVisitDialogProps {
  patientUuid: string;
  closeModal: () => void;
  launchPatientChart?: boolean;
}

const StartVisitDialog: React.FC<StartVisitDialogProps> = ({ patientUuid, closeModal, launchPatientChart }) => {
  const { t } = useTranslation();

  const handleStartNewVisit = useCallback(() => {
    if (launchPatientChart) {
      launchPatientChartWithWorkspaceOpen({
        patientUuid,
        workspaceName: 'start-visit-workspace-form',
        additionalProps: { openedFrom: 'patient-chart-start-visit' },
      });
    } else {
      launchWorkspace('start-visit-workspace-form', { openedFrom: 'patient-chart-start-visit' });
    }

    closeModal();
  }, [closeModal, patientUuid, launchPatientChart]);

  const modalHeaderText = t('noActiveVisit', 'No active visit');

  const modalBodyText = t(
    'noActiveVisitNoRDEText',
    "You can't add data to the patient chart without an active visit. Would you like to start a new visit?",
  );

  return (
    <AccessibleModal
      isOpen={true}
      onClose={closeModal}
      size="sm"
      modalHeadingId="start-visit-modal-heading"
      modalDescriptionId="start-visit-modal-description"
    >
      <ModalHeader closeModal={closeModal}>
        <span id="start-visit-modal-heading" className={styles.header}>
          {modalHeaderText}
        </span>
      </ModalHeader>
      <ModalBody>
        <p id="start-visit-modal-description" className={styles.body}>
          {modalBodyText}
        </p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="primary" onClick={handleStartNewVisit}>
          {t('startNewVisit', 'Start new visit')}
        </Button>
      </ModalFooter>
    </AccessibleModal>
  );
};

export default StartVisitDialog;
