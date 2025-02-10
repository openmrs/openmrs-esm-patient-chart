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
      <ModalHeader closeModal={onCancel} title={t('emptyForm', 'Empty Form')} className={styles.customModal} />
      <ModalBody>
        <p>{t('emptyFormConfirmation', 'All fields are Empty. Are you sure you want to submit the form?')}</p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={onCancel}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="danger" onClick={onConfirm}>
          {t('confirm', 'Confirm')}
        </Button>
      </ModalFooter>
    </React.Fragment>
  );
};

export default EmptyFormModal;
