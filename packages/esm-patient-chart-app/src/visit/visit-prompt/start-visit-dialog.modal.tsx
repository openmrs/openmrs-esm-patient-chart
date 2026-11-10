import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { getPatientChartWindowProps, launchPatientChartWithWorkspaceOpen } from '@openmrs/esm-patient-common-lib';
import { launchStartVisitWorkspace } from '../visit-form/launch-start-visit-workspace';
import styles from './start-visit-dialog.scss';

interface StartVisitDialogProps {
  patientUuid: string;
  closeModal: () => void;
  onCancel?: () => void;
  launchPatientChart?: boolean;
  onVisitStarted?: () => void;
}

const StartVisitDialog: React.FC<StartVisitDialogProps> = ({
  patientUuid,
  closeModal,
  onCancel,
  launchPatientChart,
  onVisitStarted,
}) => {
  const { t } = useTranslation();
  const handleCancel = onCancel ?? closeModal;

  const handleStartNewVisit = useCallback(() => {
    if (launchPatientChart) {
      launchPatientChartWithWorkspaceOpen({
        patientUuid,
        workspaceName: 'start-visit-workspace-form',
        additionalProps: { openedFrom: 'patient-chart-start-visit' },
        windowProps: {
          patient: getPatientChartWindowProps(patientUuid).patient,
          patientUuid,
          visitContext: null,
        },
      });
    } else {
      launchStartVisitWorkspace({ openedFrom: 'patient-chart-start-visit', onVisitStarted }, patientUuid);
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
      <ModalHeader closeModal={handleCancel}>
        <span className={styles.header}>{modalHeaderText}</span>
      </ModalHeader>
      <ModalBody>
        <p className={styles.body}>{modalBodyText}</p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={handleCancel}>
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
