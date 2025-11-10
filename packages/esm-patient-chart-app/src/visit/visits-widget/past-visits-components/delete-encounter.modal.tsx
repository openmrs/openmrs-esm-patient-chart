import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalHeader, ModalBody, ModalFooter } from '@carbon/react';
import { AccessibleModal } from '../../../components/accessible-modal';
import styles from './delete-encounter.scss';

interface DeleteEncounterConfirmationProps {
  encounterTypeName?: string;
  close: (event: React.MouseEvent<Element, MouseEvent>) => void;
  onConfirmation: Function;
}

const DeleteEncounterConfirmation: React.FC<DeleteEncounterConfirmationProps> = ({
  close,
  onConfirmation,
  encounterTypeName,
}) => {
  const { t } = useTranslation();
  const handleCancel = (event: React.MouseEvent<Element, MouseEvent>) => close(event);
  const handleDelete = () => onConfirmation?.();
  const handleClose = () => close({} as React.MouseEvent<Element, MouseEvent>);

  return (
    <AccessibleModal
      isOpen={true}
      onClose={handleClose}
      size="sm"
      modalHeadingId="delete-encounter-modal-heading"
      modalDescriptionId="delete-encounter-modal-description"
    >
      <ModalHeader closeModal={close} className={styles.productiveHeading03}>
        <span id="delete-encounter-modal-heading">{t('deleteEncounter', 'Delete Encounter')}?</span>
      </ModalHeader>
      <ModalBody>
        <p id="delete-encounter-modal-description" className={styles.bodyLong01}>
          {t(
            'deleteEncounterConfirmationText',
            `Are you sure you want to delete this encounter? This action can't be undone.`,
            { encounter: encounterTypeName },
          )}
        </p>
      </ModalBody>
      <ModalFooter>
        <Button size="lg" kind="secondary" onClick={handleCancel}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button autoFocus kind="danger" onClick={handleDelete} size="lg">
          {t('delete', 'Delete')}
        </Button>
      </ModalFooter>
    </AccessibleModal>
  );
};

export default DeleteEncounterConfirmation;
