import React from 'react';
import styles from './end-visit.component.scss';
import ComposedModal, { ModalHeader, ModalBody } from 'carbon-components-react/es/components/ComposedModal';
import Button from 'carbon-components-react/es/components/Button';
import { useTranslation } from 'react-i18next';
import { getStartedVisit, showNotification, showToast, updateVisit, useVisit } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import { first } from 'rxjs/operators';

interface EndVisitPromptProps {
  patientUuid: string;
  openModal: boolean;
  closeModal: () => void;
}

const EndVisitPrompt: React.FC<EndVisitPromptProps> = ({ patientUuid, openModal, closeModal }) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.toLowerCase().replace('_', '-');
  const { currentVisit } = useVisit(patientUuid);

  const endCurrentVisit = () => {
    const endVisitPayload = {
      location: currentVisit.location.uuid,
      startDatetime: currentVisit.startDatetime,
      visitType: currentVisit.visitType.uuid,
      stopDatetime: new Date(),
    };
    const ac = new AbortController();
    updateVisit(currentVisit.uuid, endVisitPayload, ac)
      .pipe(first())
      .subscribe(
        (response) => {
          if (response.status === 200) {
            getStartedVisit.next(null);
            closeModal();
            showToast({
              kind: 'success',
              description: t('visitEndSuccessfully', 'Ended current visit successfully'),
            });
          }
        },
        (error) => {
          showNotification({
            title: t('endVisitError', 'Error ending current visit'),
            kind: 'error',
            critical: true,
            description: error?.message,
          });
        },
      );
  };

  return (
    <ComposedModal open={openModal} onClose={() => closeModal()}>
      <ModalHeader>
        <span className={styles.productiveHeading03}>{t('noActiveVisit', 'End Current visit')}</span>
      </ModalHeader>
      <ModalBody>
        <p className={styles.customLabel}>
          <span>{t('startDate', 'Start Date')}</span>
          <span>{new Date(currentVisit?.startDatetime).toLocaleDateString(locale, { dateStyle: 'medium' })}</span>
        </p>
        <p className={styles.customLabel}>
          <span>{t('visitType', 'Visit Type')}</span> <span>{currentVisit?.visitType.display}</span>
        </p>
        <p className={styles.customLabel}>
          <span>{t('visitLocation', 'Visit Location')}</span> <span>{currentVisit?.location.display}</span>
        </p>
      </ModalBody>
      <div className={styles.buttonContainer}>
        <div className={styles.left}>
          <Button onClick={closeModal} kind="ghost">
            {t('cancel', 'Cancel')}
          </Button>
        </div>
        <div className={styles.right}>
          <Button onClick={endCurrentVisit} kind="primary">
            {t('endVisit', 'End Visit')}
          </Button>
        </div>
      </div>
    </ComposedModal>
  );
};

export default EndVisitPrompt;
