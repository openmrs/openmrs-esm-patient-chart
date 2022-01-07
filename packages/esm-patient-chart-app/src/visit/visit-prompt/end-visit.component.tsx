import React from 'react';
import styles from './end-visit.component.scss';
import { ComposedModal, Button, ModalBody, ModalFooter, ModalHeader } from 'carbon-components-react';
import { useTranslation } from 'react-i18next';
import { getStartedVisit, parseDate, showNotification, showToast, updateVisit, useVisit } from '@openmrs/esm-framework';
import { first } from 'rxjs/operators';

interface EndVisitPromptProps {
  patientUuid: string;
  isModalOpen: boolean;
  closeModal: () => void;
}

const EndVisitPrompt: React.FC<EndVisitPromptProps> = ({ patientUuid, isModalOpen, closeModal }) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.toLowerCase().replace('_', '-');
  const { currentVisit } = useVisit(patientUuid);

  const endCurrentVisit = () => {
    const endVisitPayload = {
      location: currentVisit.location.uuid,
      startDatetime: parseDate(currentVisit.startDatetime),
      stopDatetime: new Date(),
      visitType: currentVisit.visitType.uuid,
    };

    const abortController = new AbortController();
    updateVisit(currentVisit.uuid, endVisitPayload, abortController)
      .pipe(first())
      .subscribe(
        (response) => {
          if (response.status === 200) {
            getStartedVisit.next(null);
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
    <ComposedModal open={isModalOpen} onClose={closeModal}>
      <ModalHeader>
        <span className={styles.header}>{t('endActiveVisit', 'End active visit')}</span>
      </ModalHeader>
      <ModalBody className={styles.body}>
        <p className={styles.customLabel}>
          <span>{t('startDate', 'Start Date')}</span>
          <span>{new Date(currentVisit?.startDatetime).toLocaleDateString(locale, { dateStyle: 'medium' })}</span>
        </p>
        <p className={styles.customLabel}>
          <span>{t('visitType', 'Visit Type')}</span> <span>{currentVisit?.visitType?.display}</span>
        </p>
        <p className={styles.customLabel}>
          <span>{t('visitLocation', 'Visit Location')}</span> <span>{currentVisit?.location?.display}</span>
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
    </ComposedModal>
  );
};

export default EndVisitPrompt;
