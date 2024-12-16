import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalBody, ModalHeader, ModalFooter } from '@carbon/react';
import { launchPatientWorkspace, launchPatientChartWithWorkspaceOpen } from '@openmrs/esm-patient-common-lib';
import { useFeatureFlag } from '@openmrs/esm-framework';
import styles from './start-visit-dialog.scss';

interface StartVisitDialogProps {
  patientUuid: string;
  closeModal: () => void;
  visitType: string;
  launchPatientChart?: boolean;
}

const StartVisitDialog: React.FC<StartVisitDialogProps> = ({
  patientUuid,
  closeModal,
  visitType,
  launchPatientChart,
}) => {
  const { t } = useTranslation();
  const rdeFeatureEnabled = useFeatureFlag('rde');

  const handleEditPastVisit = useCallback(() => {
    if (launchPatientChart) {
      launchPatientChartWithWorkspaceOpen({
        patientUuid,
        workspaceName: 'past-visits-overview',
      });
    } else {
      launchPatientWorkspace('past-visits-overview');
    }
    closeModal();
  }, [closeModal, patientUuid, launchPatientChart]);

  const handleStartNewVisit = useCallback(() => {
    if (launchPatientChart) {
      launchPatientChartWithWorkspaceOpen({
        patientUuid,
        workspaceName: 'start-visit-workspace-form',
        additionalProps: { openedFrom: 'patient-chart-start-visit' },
      });
    } else {
      launchPatientWorkspace('start-visit-workspace-form', { openedFrom: 'patient-chart-start-visit' });
    }

    closeModal();
  }, [closeModal, patientUuid, launchPatientChart]);

  const modalHeaderText =
    rdeFeatureEnabled && visitType === 'past'
      ? t('addAPastVisit', 'Add a past visit')
      : t('noActiveVisit', 'No active visit');

  const modalBodyText = rdeFeatureEnabled
    ? visitType === 'past'
      ? t(
          'addPastVisitText',
          'You can add a new past visit or update an old one. Choose from one of the options below to continue.',
        )
      : t(
          'noActiveVisitText',
          "You can't add data to the patient chart without an active visit. Choose from one of the options below to continue.",
        )
    : t(
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
        {rdeFeatureEnabled && (
          <Button kind="secondary" onClick={handleEditPastVisit}>
            {t('editPastVisit', 'Edit past visit')}
          </Button>
        )}
        <Button kind="primary" onClick={handleStartNewVisit}>
          {t('startNewVisit', 'Start new visit')}
        </Button>
      </ModalFooter>
    </div>
  );
};

export default StartVisitDialog;
