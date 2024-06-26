import React from 'react';
import { Button, ModalHeader, ModalBody, ModalFooter } from '@carbon/react';
import { useTranslation } from 'react-i18next';
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
    <div>
      <ModalHeader closeModal={onDiscard} title={t('modifyVisitDate', 'Modify visit date')} />
      <ModalBody>
        <p className={styles.body}>
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
    </div>
  );
};

export default ModifyVisitDateConfirmationModal;
