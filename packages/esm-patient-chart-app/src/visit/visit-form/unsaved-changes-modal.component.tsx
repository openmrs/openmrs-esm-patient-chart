import { ModalHeader, ModalBody, ModalFooter, Button } from 'carbon-components-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface VisitFormModalProps {
  closeModal: () => void;
  closeForm: () => void;
}

const UnsavedChangesModal: React.FC<VisitFormModalProps> = ({ closeModal, closeForm }) => {
  const { t } = useTranslation();

  const handleCloseVisitForm = () => {
    closeModal();
    closeForm();
  };
  return (
    <div>
      <ModalHeader closeModal={closeModal} title={t('unsavedChanges', 'Unsaved changes')} />
      <ModalBody>
        <p>
          {t('unsavedChangesText', 'You have unsaved changes in the side panel. Do you want to discard these changes?')}
        </p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button onClick={handleCloseVisitForm} kind="danger">
          {t('discard', 'Discard')}
        </Button>
      </ModalFooter>
    </div>
  );
};

export default UnsavedChangesModal;
