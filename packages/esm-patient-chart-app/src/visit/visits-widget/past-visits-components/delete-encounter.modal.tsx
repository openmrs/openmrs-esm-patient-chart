import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalHeader, ModalBody, ModalFooter } from '@carbon/react';
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

  return (
    <>
      <ModalHeader closeModal={close} className={styles.productiveHeading03}>
        {t('deleteEncounter', 'Delete Encounter')}?
      </ModalHeader>
      <ModalBody>
        <p className={styles.bodyLong01}>
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
    </>
  );
};

export default DeleteEncounterConfirmation;
