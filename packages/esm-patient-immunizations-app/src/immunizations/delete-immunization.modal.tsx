import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InlineLoading, ModalHeader, ModalBody, ModalFooter } from '@carbon/react';
import { getCoreTranslation, showSnackbar, useConfig } from '@openmrs/esm-framework';
import { useFocusTrap } from '@openmrs/esm-patient-common-lib';
import { deletePatientImmunization, useImmunizations } from '../hooks/useImmunizations';
import { useImmunizationsConceptSet } from '../hooks/useImmunizationsConceptSet';
import { type ImmunizationConfigObject } from '../config-schema';
import styles from './delete-immunization.scss';

interface DeleteConfirmModelProps {
  close: () => void;
  doseNumber: number;
  immunizationId: string;
  patientUuid: string;
  vaccineUuid: string;
}

const DeleteImmunization: React.FC<DeleteConfirmModelProps> = ({
  close,
  doseNumber,
  immunizationId,
  patientUuid,
  vaccineUuid,
}) => {
  const { t } = useTranslation();
  const containerRef = useFocusTrap();
  const config = useConfig<ImmunizationConfigObject>();
  const { immunizationsConceptSet } = useImmunizationsConceptSet(config);
  const { mutate } = useImmunizations(patientUuid);
  const [isDeleting, setIsDeleting] = useState(false);

  const vaccineName = useMemo(
    () =>
      immunizationsConceptSet?.answers.find((answer) => answer.uuid === vaccineUuid)?.display ??
      t('unknownVaccine', 'Unknown vaccine'),
    [immunizationsConceptSet, vaccineUuid, t],
  );

  const handleDeleteDose = async (immunizationId: string) => {
    setIsDeleting(true);
    try {
      await deletePatientImmunization(immunizationId);

      showSnackbar({
        title: t('immunizationDeleted', 'Immunization dose deleted'),
        subtitle: t('immunizationDeletedSuccess', 'Immunization dose deleted successfully'),
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
    <div role="dialog" aria-modal="true" ref={containerRef}>
      <ModalHeader
        closeModal={close}
        title={t('deleteImmunization', 'Delete immunization')}
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
    </div>
  );
};

export default DeleteImmunization;
