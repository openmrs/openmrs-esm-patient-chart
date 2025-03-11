import { formatDate, showModal, useVisit } from '@openmrs/esm-framework';
import React from 'react';
import styles from './order-basket.scss';
import { Button } from '@carbon/react';
// import { Apartment } from '@carbon/react/icons';

export const VisitBanner = ({ patientUuid }: { patientUuid: string }) => {
  const { currentVisit, currentVisitIsRetrospective } = useVisit(patientUuid);

  const handleShowingVisitSelectorModal = () => {
    const dispose = showModal('visit-selector-modal', {
      close: () => dispose(),
    });
  };

  if (currentVisitIsRetrospective) {
    return (
      <button className={styles.retroVisit} onClick={handleShowingVisitSelectorModal}>
        <p>Adding to:</p>
        <div className={styles.visitInfo}>
          <div className={styles.visitTitle}>
            {/* <p>{currentVisit.display}</p> */}
            {/* Question: how to shorten this name */}
            <h5 className={styles.visitHeading}>Test visit</h5>
            <Button kind="ghost">Change</Button>
          </div>
          <div className={styles.visitAttributes}>
            <p>
              {formatDate(new Date(currentVisit.startDatetime))} - {formatDate(new Date(currentVisit.stopDatetime))}
            </p>
            {/* Question: cant find this icon. */}
            {/* <Apartment />  */} <span>&middot;</span> <p>{currentVisit.location.display}</p>
          </div>
        </div>
      </button>
    );
  }

  //   non retro
  return (
    <button className={styles.activeVisit} onClick={handleShowingVisitSelectorModal}>
      <p>Adding to:</p>
      <div className={styles.visitInfo}>
        <div className={styles.visitTitle}>
          {/* <p>{currentVisit.display}</p> */}
          <h5 className={styles.visitHeading}>Test visit</h5>
          <Button kind="ghost">Change</Button>
        </div>
        <div className={styles.visitAttributes}>
          <p>Current active visit</p> {/* <Apartment /> */}
          <span>&middot;</span> <p>{currentVisit.location.display}</p>
        </div>
      </div>
    </button>
  );
};
