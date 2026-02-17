import React from 'react';
import { useTranslation } from 'react-i18next';
import { ModalHeader, ModalBody, ModalFooter, Button } from '@carbon/react';
import { useFocusTrap } from '@openmrs/esm-patient-common-lib';

interface DeleteModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ onConfirm, onCancel }) => {
  const { t } = useTranslation();
  const containerRef = useFocusTrap();

  return (
    <div role="dialog" aria-modal="true" ref={containerRef}>
      <ModalHeader
        closeModal={onCancel}
        title={t('deleteQuestionConfirmation', 'Are you sure you want to delete this question?')}
      />
      <ModalBody>
        <p>{t('deleteQuestionExplainerText', 'This action cannot be undone.')}</p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={onCancel}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="danger" onClick={onConfirm}>
          {t('deleteQuestion', 'Delete question')}
        </Button>
      </ModalFooter>
    </div>
  );
};

export default DeleteModal;
