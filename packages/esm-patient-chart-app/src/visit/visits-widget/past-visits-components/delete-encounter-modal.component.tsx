import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalHeader, ModalBody, ModalFooter } from '@carbon/react';
import styles from './delete-encounter-confirmation-modal.scss';

interface DeleteEncounterConfirmationProps {
  encounterTypeName?: string;
  close: Function;
  onConfirmation: Function;
}

const DeleteEncounterConfirmation: React.FC<DeleteEncounterConfirmationProps> = ({
  close,
  onConfirmation,
  encounterTypeName,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <ModalHeader closeModal={close} className={styles.productiveHeading03}>
        {t('deleteEncounter', 'Delete Encounter')} ?
      </ModalHeader>
      <ModalBody>
        <p className={styles.bodyLong01}>
          {t(
            'deleteEncounterConfirmationText',
            `Are you sure you want to delete this {encounter} encounter? This action can't be undone.`,
            { encounter: encounterTypeName },
          )}
        </p>
      </ModalBody>
      <ModalFooter>
        <Button size="lg" kind="secondary" onClick={() => close()}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button size="lg" kind="danger" onClick={() => onConfirmation?.()} autoFocus>
          {t('delete', 'Delete')}
        </Button>
      </ModalFooter>
    </>
  );
};

export default DeleteEncounterConfirmation;
