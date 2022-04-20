import React, { useCallback } from 'react';
import styles from './end-visit-dialog.scss';
import { Button, ModalBody, ModalFooter, ModalHeader } from 'carbon-components-react';
import { useTranslation } from 'react-i18next';
import { parseDate, showNotification, showToast, updateVisit, useVisit } from '@openmrs/esm-framework';
import { first } from 'rxjs/operators';

interface EndVisitDialogProps {
  patientUuid: string;
  closeModal: () => void;
}

const EndVisitDialog: React.FC<EndVisitDialogProps> = ({ patientUuid, closeModal }) => {
  const { t } = useTranslation();
  const { currentVisit, mutate } = useVisit(patientUuid);

  const endCurrentVisit = () => {
    const endVisitPayload = {
      location: currentVisit.location.uuid,
      startDatetime: parseDate(currentVisit.startDatetime),
      visitType: currentVisit.visitType.uuid,
      stopDatetime: new Date(),
    };

    const abortController = new AbortController();
    updateVisit(currentVisit.uuid, endVisitPayload, abortController)
      .pipe(first())
      .subscribe(
        (response) => {
          if (response.status === 200) {
            mutate();
            closeModal();

            showToast({
              kind: 'success',
              description: t('visitEndSuccessfully', 'Ended active visit successfully'),
            });
          }
        },
        (error) => {
          showNotification({
            title: t('endVisitError', 'Error ending active visit'),
            kind: 'error',
            critical: true,
            description: error?.message,
          });
        },
      );
  };

  return (
    <div>
      <ModalHeader
        closeModal={closeModal}
        label={t('visit', 'Visit')}
        title={t('endActiveVisit', 'End active visit')}
      />
      <ModalBody>
        <p className={styles.bodyShort02}>
          {t(
            'endVisitWarningMessage',
            'Ending this visit, will not allow you to fill another encounter form for this patient',
          )}
        </p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="danger" onClick={endCurrentVisit}>
          {t('endVisit', 'End Visit')}
        </Button>
      </ModalFooter>
    </div>
  );
};

export default EndVisitDialog;
