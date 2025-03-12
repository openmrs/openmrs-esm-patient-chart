import { formatDate, showModal, useAppContext, useVisit } from '@openmrs/esm-framework';
import React, { useEffect } from 'react';
import styles from './order-basket.scss';
import { Button } from '@carbon/react';
import { type SelectedVisitContext } from '../types/visit';
import { useVisits } from './visit-selector-modal/visit-resource';
// import { Apartment } from '@carbon/react/icons';

export const VisitBanner = ({ patientUuid }: { patientUuid: string }) => {
  const { currentVisit } = useVisit(patientUuid);
  const { visits, isLoading, isValidating, error } = useVisits(patientUuid);

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

  if (!selectedVisit) {
    // TODO replace with a better loading skeleton
    return <div>'loading'</div>;
  }

  if (selectedVisitIsRetrospective) {
    return (
      // Question: button cannot be a child of button
      <button className={styles.retroVisit} onClick={handleShowingVisitSelectorModal}>
        <p className={styles.addingToText}>Adding to:</p>
        <div className={styles.visitInfo}>
          {/* <p>{selectedVisit.display}</p> */}
          {/* Question: how to shorten this name */}
          <h5 className={styles.visitHeading}>Test visit</h5>
          <div className={styles.visitAttributes}>
            <p>
              {formatDate(new Date(selectedVisit.startDatetime))} - {formatDate(new Date(selectedVisit.stopDatetime))}
            </p>
            {/* Question: cant find this icon. */}
            {/* <Apartment />  */} <span>&middot;</span> <p>{selectedVisit.location.display}</p>
          </div>
        </div>
      </button>
    );
  }

  //   non retro
  return (
    <button className={styles.activeVisit} onClick={handleShowingVisitSelectorModal}>
      <p className={styles.addingToText}>Adding to:</p>
      <div className={styles.visitInfo}>
        <div className={styles.visitTitle}>
          {/* <p>{selectedVisit.display}</p> */}
          <h5 className={styles.visitHeading}>Test visit</h5>
          <Button kind="ghost">Change</Button>
        </div>
        <div className={styles.visitAttributes}>
          <p>Current active visit</p> {/* <Apartment /> */}
          <span>&middot;</span> <p>{selectedVisit.location.display}</p>
        </div>
      </div>
    </button>
  );
};
