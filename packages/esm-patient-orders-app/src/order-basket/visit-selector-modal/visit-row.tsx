import React, { useState } from 'react';
import styles from './visit-row.scss';
import { RadioButton } from '@carbon/react';
import { formatDate, type Visit } from '@openmrs/esm-framework';

export const VisitRow = ({
  visit,
  selectedVisitUuid,
  updateSelectedVisitUuid,
}: {
  visit: Visit;
  selectedVisitUuid: string;
  updateSelectedVisitUuid: (value: string) => void;
}) => {
  const isRetrospectiveVisit = visit.stopDatetime !== null;

  const handleSelect = () => {
    updateSelectedVisitUuid(visit.uuid);
  };

  if (isRetrospectiveVisit) {
    return (
      <button className={styles.retroVisit} onClick={handleSelect}>
        <div>
          {/* <p>{visit.display}</p> */}
          <h5 className={styles.visitHeading}>Test visit</h5>
          <div className={styles.visitAttributes}>
            <p>
              {formatDate(new Date(visit.startDatetime))} - {formatDate(new Date(visit.stopDatetime))}
            </p>
            {/* <Apartment />  */} <span>&middot;</span> <p>{visit.location.display}</p>
          </div>
        </div>
        <RadioButton
          id="retro-spective-visit-radio-button"
          value={visit.uuid}
          onChange={handleSelect}
          checked={selectedVisitUuid === visit.uuid}
        />
      </button>
    );
  }

  // non retro visit
  return (
    <button className={styles.activeVisit} onClick={handleSelect}>
      <div>
        {/* <p>{visit.display}</p> */}
        <h5 className={styles.visitHeading}>Test visit</h5>
        <div className={styles.visitAttributes}>
          <p>Current active visit</p> {/* <Apartment /> */}
          <span>&middot;</span> <p>{visit.location.display}</p>
        </div>
      </div>
      <RadioButton
        id="non-retrospective-visit-radio-button"
        value={visit.uuid}
        onChange={handleSelect}
        checked={selectedVisitUuid === visit.uuid}
      />
    </button>
  );
};
