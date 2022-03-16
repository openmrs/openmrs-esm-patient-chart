import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ComposedModal, Button, ModalBody, ModalHeader, ModalFooter } from 'carbon-components-react';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import styles from './start-visit-dialog.scss';
import { useVisitDialog } from '../useVisitDialog';

interface StartVisitDialogProps {
  patientUuid: string;
}

const StartVisitDialog: React.FC<StartVisitDialogProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { state } = useVisitDialog(patientUuid);
  const closeModal = useCallback(
    () => window.dispatchEvent(new CustomEvent('visit-dialog', { detail: { type: 'close' } })),
    [],
  );

  const handleEditPastVisit = useCallback(() => {
    launchPatientWorkspace('past-visits-overview');
    closeModal();
  }, []);

  const handleStartNewVisit = useCallback(() => {
    launchPatientWorkspace('start-visit-workspace-form');
    closeModal();
  }, []);

  const modalHeaderText =
    state?.type === 'past' ? t('addPastVisit', 'Add a past visit') : t('noActiveVisit', 'No active visit');

  const modalBodyText =
    state?.type === 'past'
      ? t(
          'addPastVisitText',
          'You can add a new past visit or update an old one. Choose from one of the options below to continue.',
        )
      : t(
          'noActiveVisitText',
          "You can't add data to the patient chart without an active visit. Choose from one of the options below to continue.",
        );

  return (
    <ComposedModal open onClose={closeModal}>
      <ModalHeader>
        <span className={styles.header}>{modalHeaderText}</span>
      </ModalHeader>
      <ModalBody>
        <p className={styles.body}>{modalBodyText}</p>
      </ModalBody>
      <ModalFooter className={styles.footer}>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="secondary" onClick={handleEditPastVisit}>
          {t('editPastVisit', 'Edit past visit')}
        </Button>
        <Button kind="primary" onClick={handleStartNewVisit}>
          {t('startNewVisit', 'Start new visit')}
        </Button>
      </ModalFooter>
    </ComposedModal>
  );
};

export default StartVisitDialog;
