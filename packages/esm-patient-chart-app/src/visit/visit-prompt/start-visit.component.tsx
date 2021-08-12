import React, { useCallback } from 'react';
import styles from './start-visit.component.scss';
import ComposedModal, { ModalHeader, ModalBody } from 'carbon-components-react/es/components/ComposedModal';
import Button from 'carbon-components-react/es/components/Button';
import { useTranslation } from 'react-i18next';
import { attach } from '@openmrs/esm-framework';

interface StartVisitPromptProps {
  openModal: boolean;
  closeModal: () => void;
  state: any;
}

const StartVisitPrompt: React.FC<StartVisitPromptProps> = ({ openModal, closeModal, state }) => {
  const { t } = useTranslation();

  const modalHeaderText =
    state?.type === 'start' ? t('noActiveVisit', 'No Active Visit') : t('addPastVisit', 'Add Past Visit');
  const modalBodyText =
    state?.type === 'start'
      ? t(
          'noActiveVisitText',
          "You can't add data to the patient chart without an active visit. Choose from one of the options below to continue.",
        )
      : t(
          'addPastVisitText',
          'You can add past visit, update past visit or add new past visit, Click on one of the buttons below',
        );

  const handleOpenEditPastVisit = useCallback(() => {
    attach('patient-chart-workspace-slot', 'past-visits-overview');
    closeModal();
  }, [closeModal]);

  const handleOpenStartVisitForm = useCallback(() => {
    attach('patient-chart-workspace-slot', 'start-visit-workspace-form');
    closeModal();
  }, [closeModal]);

  return (
    <ComposedModal open={openModal} onClose={() => closeModal()}>
      <ModalHeader>
        <span className={styles.productiveHeading03}>{modalHeaderText}</span>
      </ModalHeader>
      <ModalBody>
        <p>{modalBodyText}</p>
      </ModalBody>
      <div className={styles.buttonContainer}>
        <div className={styles.left}>
          <Button onClick={closeModal} kind="ghost">
            {t('cancel', 'Cancel')}
          </Button>
        </div>
        <div className={styles.right}>
          <Button onClick={handleOpenEditPastVisit} kind="secondary">
            {t('editPastVisit', 'Edit Past Visit')}
          </Button>
          <Button onClick={handleOpenStartVisitForm} kind="primary">
            {t('startNewVisit', 'Start New Visit')}
          </Button>
        </div>
      </div>
    </ComposedModal>
  );
};

export default StartVisitPrompt;
