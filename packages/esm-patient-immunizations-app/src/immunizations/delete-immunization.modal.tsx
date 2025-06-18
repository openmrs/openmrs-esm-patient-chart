import React, { useMemo, useState } from 'react';
import { ModalHeader, ModalBody, ModalFooter, Button, InlineLoading } from '@carbon/react';
import { useImmunizationsConceptSet } from '../hooks/useImmunizationsConceptSet';
import { type ConfigObject } from '../config-schema';
import { getCoreTranslation, showSnackbar, useConfig } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import styles from './delete-immunization.scss';
import { deletePatientImmunization, useImmunizations } from '../hooks/useImmunizations';

interface DeleteConfirmModelProps {
  close: () => void;
  doseNumber: number;
  vaccineUuid: string;
  immunizationId: string;
  patientUuid: string;
}

const DeleteImmunization: React.FC<DeleteConfirmModelProps> = ({
  close,
  doseNumber,
  vaccineUuid,
  immunizationId,
  patientUuid,
}) => {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);
  const { immunizationsConfig } = useConfig<ConfigObject>();
  const { immunizationsConceptSet } = useImmunizationsConceptSet(immunizationsConfig);
  const { mutate } = useImmunizations(patientUuid);

  const vaccineName = useMemo(() => {
    return (
      immunizationsConceptSet?.answers.find((answer) => answer.uuid === vaccineUuid)?.display ??
      t('unknownVaccine', 'Unknown vaccine')
    );
  }, [immunizationsConceptSet, vaccineUuid, t]);

  const handleDeleteDose = async (immunizationId: string) => {
    setIsDeleting(true);
    try {
      await deletePatientImmunization(immunizationId);

      showSnackbar({
        title: t('immunizationDeleted', 'Immunization deleted'),
        subtitle: t('immunizationDeletedSuccess', 'The immunization dose has been successfully deleted'),
        kind: 'success',
      });

      await mutate();
      close();
    } catch (error) {
      showSnackbar({
        title: t('error', 'Error'),
        subtitle: t('immunizationDeleteError', 'Failed to delete immunization: ') + error.message,
        kind: 'error',
      });
    }
    setIsDeleting(false);
  };

  return (
    <>
      <ModalHeader
        closeModal={close}
        title={t('immunizationDelete', 'Delete immunization')}
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
          {getCoreTranslation('cancel')}
        </Button>
        <Button kind="danger" disabled={isDeleting} onClick={() => handleDeleteDose(immunizationId)}>
          {isDeleting ? (
            <InlineLoading className={styles.spinner} description={t('deleting', 'Deleting') + '...'} />
          ) : (
            <span>{getCoreTranslation('delete')}</span>
          )}
        </Button>
      </ModalFooter>
    </>
  );
};

export default DeleteImmunization;
