import React, { useCallback, useState } from 'react';
import { useVisit, openmrsFetch, showToast, showNotification } from '@openmrs/esm-framework';
import styles from './cancel-visit.scss';
import { Button, ComposedModal, InlineLoading, ModalBody, ModalFooter, ModalHeader } from 'carbon-components-react';
import { useTranslation } from 'react-i18next';
import { useVisitDialog } from '../useVisitDialog';

interface CancelVisitProps {
  patientUuid: string;
}

const CancelVisit: React.FC<CancelVisitProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { type } = useVisitDialog(patientUuid);
  const { currentVisit, mutate } = useVisit(patientUuid);
  const [submitting, setSubmitting] = useState(false);

  const closeModal = useCallback(
    () => window.dispatchEvent(new CustomEvent('visit-dialog', { detail: { type: 'close' } })),
    [],
  );

  const cancelActiveVisit = useCallback(() => {
    // TO DO expand updateVisit function in esm-api to support this request
    setSubmitting(true);
    openmrsFetch(`/ws/rest/v1/visit/${currentVisit.uuid}`, {
      headers: {
        'Content-type': 'application/json',
      },
      method: 'POST',
      body: { voided: true },
    }).then(
      () => {
        mutate();
        showToast({
          title: t('cancelVisit', 'Cancel visit'),
          kind: 'success',
          description: t('visitCanceled', 'Canceled active visit successfully'),
        });
        closeModal();
        setSubmitting(false);
      },
      (error) => {
        showNotification({
          title: t('cancelVisitError', 'Error canceling active visit'),
          kind: 'error',
          critical: true,
          description: error?.message,
        });
        setSubmitting(false);
      },
    );
  }, [currentVisit]);

  return (
    <ComposedModal open={type === 'cancel'} onClose={closeModal}>
      <ModalHeader label={t('visit', 'Visit')} title={t('cancelActiveVisit', 'Cancel active visit')} />
      <ModalBody>
        <p className={styles.bodyShort02}>
          {t('cancelVisitWarningMessage', 'Canceling this visit will delete all associated encounter(s)')}
        </p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button disabled={submitting} kind="danger" onClick={cancelActiveVisit}>
          {submitting ? <InlineLoading description={t('loading', 'Loading...')} /> : t('cancelVisit', 'Cancel Visit')}
        </Button>
      </ModalFooter>
    </ComposedModal>
  );
};

export default CancelVisit;
