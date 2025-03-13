import { formatDate, showModal, useAppContext, useVisit } from '@openmrs/esm-framework';
import React, { useEffect } from 'react';
import styles from './order-basket.scss';
import { Button, InlineNotification, SkeletonText } from '@carbon/react';
import { type SelectedVisitContext } from '../types/visit';
import { useVisits } from './visit-selector-modal/visit-resource';
import { RetrospectiveDatePicker } from './retrospective-date-picker.component';
import { useTranslation } from 'react-i18next';
// import { Apartment } from '@carbon/react/icons';

export const VisitBanner = ({ patientUuid }: { patientUuid: string }) => {
  const { currentVisit } = useVisit(patientUuid);
  const { visits, isLoading, isValidating, error } = useVisits(patientUuid);
  const { t } = useTranslation();

  const { selectedVisitUuid, setSelectedVisitUuid } = useAppContext<SelectedVisitContext>('selected-visit-uuid') ?? {
    // Fallback values used when the app context is undefined
    selectedVisitUuid: null,
    setSelectedVisitUuid: () => {},
  };

  const selectedVisit = visits?.find((v) => v.uuid === selectedVisitUuid);
  const selectedVisitIsRetrospective = selectedVisit?.stopDatetime !== null;

  useEffect(() => {
    if (!selectedVisitUuid) {
      setSelectedVisitUuid(currentVisit.uuid);
    }
  }, [currentVisit, selectedVisitUuid, setSelectedVisitUuid]);

  const handleShowingVisitSelectorModal = () => {
    const dispose = showModal('visit-selector-modal', {
      closeModal: () => dispose(),
      patientUuid,
    });
  };

  if (error) {
    return (
      <InlineNotification
        hideCloseButton
        kind="warning"
        lowContrast
        style={{ minWidth: '100%' }}
        subtitle={t('visitFetchErrorDescription', 'An error occurred fetching visits for the patient')}
        title={t('anErrorOccurred', 'An error occurred')}
      />
    );
  }

  if (!selectedVisit || isLoading || isValidating) {
    return (
      <div className={styles.skeletonWrapper}>
        <SkeletonText className={styles.loaderPtag} width="20%" />
        <div>
          <div className={styles.skeletonHeader}>
            <SkeletonText width="50%" />
            <SkeletonText width="50%" />
          </div>
          <div className={styles.skeletonDescription}>
            <SkeletonText width="30%" />
            <SkeletonText width="30%" />
            <SkeletonText width="30%" />
          </div>
        </div>
      </div>
    );
  }

  if (selectedVisitIsRetrospective) {
    return (
      <>
        <button className={styles.retroVisit} onClick={handleShowingVisitSelectorModal}>
          <p className={styles.addingToText}>Adding to:</p>
          <div className={styles.visitInfo}>
            {/* <h5 className={styles.visitHeading}>{selectedVisit.display}</h5> */}
            <h5 className={styles.visitHeading}>Test visit</h5>
            <div className={styles.visitAttributes}>
              <p>
                {formatDate(new Date(selectedVisit.startDatetime))} - {formatDate(new Date(selectedVisit.stopDatetime))}
              </p>
              <span>&middot;</span> {/* <Apartment />  */} <p>{selectedVisit.location.display}</p>
            </div>
          </div>
        </button>
        <RetrospectiveDatePicker
          maxDate={new Date(selectedVisit.stopDatetime)}
          minDate={new Date(selectedVisit.startDatetime)}
        />
      </>
    );
  }

  //   non retro
  return (
    <button className={styles.activeVisit} onClick={handleShowingVisitSelectorModal}>
      <p className={styles.addingToText}>Adding to:</p>
      <div className={styles.visitInfo}>
        <div className={styles.visitTitle}>
          {/* <h5 className={styles.visitHeading}>{selectedVisit.display}</h5> */}
          <h5 className={styles.visitHeading}>Test visit</h5>
          <Button kind="ghost">Change</Button>
        </div>
        <div className={styles.visitAttributes}>
          <p>Current active visit</p>
          <span>&middot;</span> {/* <Apartment /> */} <p>{selectedVisit.location.display}</p>
        </div>
      </div>
    </button>
  );
};
