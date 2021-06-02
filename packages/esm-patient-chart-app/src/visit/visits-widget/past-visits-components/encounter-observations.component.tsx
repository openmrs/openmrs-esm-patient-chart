import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import SkeletonText from 'carbon-components-react/es/components/SkeletonText';
import { Observation } from '../visit.resource';
import styles from '../visit-detail-overview.scss';

interface EncounterObservationsProps {
  observations: Array<Observation>;
}

const EncounterObservations: React.FC<EncounterObservationsProps> = ({ observations }) => {
  const { t } = useTranslation();

  const observationsList = useMemo(() => {
    return (
      observations &&
      observations.map((obs: Observation) => {
        const qna = obs.display.split(':');
        return {
          question: qna[0],
          answer: qna[1],
        };
      })
    );
  }, [observations]);

  return observationsList ? (
    observationsList.length > 0 ? (
      <div>
        {observationsList.map((obs, ind) => (
          <div key={ind} className={styles.observation}>
            <span className={styles.caption01} style={{ marginRight: '0.125rem' }}>
              {obs.question}:{' '}
            </span>
            <span className={styles.bodyShort02}>{obs.answer}</span>
          </div>
        ))}
      </div>
    ) : (
      <SkeletonText />
    )
  ) : (
    <p>No Observations found.</p>
  );
};

export default EncounterObservations;
