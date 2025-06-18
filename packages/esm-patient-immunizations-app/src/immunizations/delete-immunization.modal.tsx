import React from 'react';
import { ModalHeader, ModalBody, ModalFooter, Button, InlineLoading } from '@carbon/react';
import { useImmunizationsConceptSet } from '../hooks/useImmunizationsConceptSet';
import { type ConfigObject } from '../config-schema';
import { showSnackbar, useConfig } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import styles from './delete-immunization.scss';
import { deletePatientImmunization } from '../hooks/useImmunizations';

interface DeleteConfirmModelProps {
  close: () => void;
  handleDeleteDose: () => void;
  doseNumber: number;
  vaccineUuid: string;
  immunizationId: string;
}

const DeleteImmunization: React.FC<DeleteConfirmModelProps> = ({ close, doseNumber, vaccineUuid, immunizationId }) => {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const { immunizationsConfig } = useConfig<ConfigObject>();
  const { immunizationsConceptSet } = useImmunizationsConceptSet(immunizationsConfig);

  const vaccineName =
    immunizationsConceptSet?.answers.find((answer) => answer.uuid === vaccineUuid)?.display ??
    t('unknownVaccine', 'Unknown vaccine');

  const handleDeleteDose = async (immunizationId: string) => {
    setIsDeleting(true);
    try {
      await deletePatientImmunization(immunizationId);

      showSnackbar({
        title: t('immunizationDeleted', 'Immunization Deleted'),
        description: t('immunizationDeletedSuccess', 'The immunization dose has been successfully deleted'),
        kind: 'success',
      } as any);

      close();
    } catch (error) {
      showSnackbar({
        title: t('error', 'Error'),
        description: t('immunizationDeleteError', 'Failed to delete immunization: ') + error.message,
        kind: 'error',
      } as any);
    }
    setIsDeleting(false);
  };

  return (
    <>
      <ModalHeader
        closeModal={close}
        title={t('immunizationDelete', 'Delete Immunization')}
        className={styles.modalHeader}
      />
      <ModalBody>
        <p>
          {t('immunizationDeleteConfirm', 'Are you sure you want to delete dose {{doseNumber}} of {{vaccineName}}?', {
            doseNumber,
            vaccineName,
          })}
        </p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={close}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="danger" disabled={isDeleting} onClick={() => handleDeleteDose(immunizationId)}>
          {isDeleting ? (
            <InlineLoading className={styles.spinner} description={t('deleting', 'Deleting') + '...'} />
          ) : (
            <span>{t('delete', 'Delete')}</span>
          )}
        </Button>
      </ModalFooter>
    </>
  );
};

export default DeleteImmunization;
