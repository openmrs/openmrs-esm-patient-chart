import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';

interface DuplicateConditionModalProps {
  closeModal: () => void;
  conditionName: string;
  existingOnsetDate: string;
  existingStatus: string;
  onConfirm: () => void;
}

const DuplicateConditionModal: React.FC<DuplicateConditionModalProps> = ({
  closeModal,
  conditionName,
  existingOnsetDate,
  existingStatus,
  onConfirm,
}) => {
  const { t } = useTranslation();

  const handleConfirm = () => {
    closeModal();
    onConfirm();
  };

  return (
    <div>
      <ModalHeader closeModal={closeModal} title={t('duplicateCondition', 'Duplicate condition')} />
      <ModalBody>
        <p>
          {t('duplicateConditionWarning', {
            defaultValue:
              "{{conditionName}} is already on this patient's problem list (onset {{onsetDate}}, {{status}}). Are you sure you want to add it again?",
            conditionName,
            onsetDate: existingOnsetDate,
            status: existingStatus,
          })}
        </p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="primary" onClick={handleConfirm}>
          {t('addAnyway', 'Add anyway')}
        </Button>
      </ModalFooter>
    </div>
  );
};

export default DuplicateConditionModal;
