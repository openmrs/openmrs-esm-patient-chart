import React from 'react';
import { Button, ModalHeader, ModalBody, ModalFooter } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { AccessibleModal } from '../../components/accessible-modal';
import styles from './start-visit-dialog.scss';

interface ModifyVisitDateConfirmationModalProps {
  onDiscard: () => void;
  onConfirmation: () => void;
}

const ModifyVisitDateConfirmationModal: React.FC<ModifyVisitDateConfirmationModalProps> = ({
  onDiscard,
  onConfirmation,
}) => {
  const { t } = useTranslation();

  return (
    <AccessibleModal
      isOpen={true}
      onClose={onDiscard}
      size="sm"
      modalHeadingId="modify-visit-date-modal-heading"
      modalDescriptionId="modify-visit-date-modal-description"
    >
      <ModalHeader
        closeModal={onDiscard}
        title={<span id="modify-visit-date-modal-heading">{t('modifyVisitDate', 'Modify visit date')}</span>}
      />
      <ModalBody>
        <p id="modify-visit-date-modal-description" className={styles.body}>
          {t(
            'confirmModifyingVisitDateToAccomodateEncounter',
            'The encounter date falls outside the designated visit date range. Would you like to modify the visit date to accommodate the new encounter date?',
          )}
        </p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={onDiscard}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="danger" onClick={onConfirmation}>
          {t('confirm', 'Confirm')}
        </Button>
      </ModalFooter>
    </AccessibleModal>
  );
};

export default ModifyVisitDateConfirmationModal;
