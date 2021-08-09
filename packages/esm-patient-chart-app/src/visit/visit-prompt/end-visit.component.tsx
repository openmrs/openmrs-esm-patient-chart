import React from 'react';
import styles from './end-visit.component.scss';
import ComposedModal, { ModalHeader, ModalBody } from 'carbon-components-react/es/components/ComposedModal';
import Button from 'carbon-components-react/es/components/Button';
import { useTranslation } from 'react-i18next';
import { createErrorHandler, getStartedVisit, showToast, updateVisit, useVisit } from '@openmrs/esm-framework';
import dayjs from 'dayjs';

interface EndVisitPromptProps {
  patientUuid: string;
  openModal: boolean;
  closeModal: () => void;
}

const EndVisitPrompt: React.FC<EndVisitPromptProps> = ({ patientUuid, openModal, closeModal }) => {
  const { t } = useTranslation();
  const dateFormat = 'DD - MMM - YYYY';

  const { currentVisit } = useVisit(patientUuid);

  const endCurrentVisit = () => {
    const endVisitPayload = {
      location: currentVisit.location.uuid,
      startDatetime: currentVisit.startDatetime,
      visitType: currentVisit.visitType.uuid,
      stopDatetime: new Date(),
    };
    const ac = new AbortController();
    const sub = updateVisit(currentVisit.uuid, endVisitPayload, ac).subscribe(
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
        createErrorHandler();
        showToast({
          kind: 'success',
          description: t('visitEndError', 'Error ending current visit'),
        });
      },
    );

    return () => sub && sub.unsubscribe();
  };

  return (
    <ComposedModal open={openModal} onClose={() => closeModal()}>
      <ModalHeader>
        <span className={styles.productiveHeading03}>{t('noActiveVisit', 'End Current visit')}</span>
      </ModalHeader>
      <ModalBody>
        <p className={styles.customLabel}>
          <span>{t('startDate', 'Start Date')}</span>{' '}
          <span>{dayjs(currentVisit?.startDatetime).format(dateFormat)}</span>
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
