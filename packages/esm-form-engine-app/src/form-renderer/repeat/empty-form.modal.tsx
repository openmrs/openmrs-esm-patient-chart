import React from 'react';
import { useTranslation } from 'react-i18next';
import { ModalHeader, ModalBody, ModalFooter, Button } from '@carbon/react';
import styles from './empty-form.modal.scss';

interface EmptyFormModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const EmptyFormModal: React.FC<EmptyFormModalProps> = ({ onConfirm, onCancel }) => {
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <ModalHeader
        closeModal={onCancel}
        title={t('incompleteForm', 'Incomplete form')}
        className={styles.customModal}
      />
      <ModalBody>
        <p>
          {t(
            'emptyFormIndication',
            'The form contains empty fields or no data has been entered. Please complete the necessary information before proceeding.',
          )}
        </p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={onCancel}>
          {t('continueEditing', 'Continue editing')}
        </Button>
        <Button kind="danger" onClick={onConfirm}>
          {t('discardForm', 'Discard form')}
        </Button>
      </ModalFooter>
    </React.Fragment>
  );
};

export default EmptyFormModal;
