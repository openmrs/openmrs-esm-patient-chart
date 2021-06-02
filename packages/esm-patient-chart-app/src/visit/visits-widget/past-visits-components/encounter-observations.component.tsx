import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import SkeletonText from 'carbon-components-react/es/components/SkeletonText';
import { Observation, fetchEncounterObservations } from '../visit.resource';
import styles from '../visit-detail-overview.scss';

interface EncounterObservationsProps {
  encounterUuid: string;
}

const EncounterObservations: React.FC<EncounterObservationsProps> = ({ encounterUuid }) => {
  const { t } = useTranslation();
  const [observations, setObservations] = useState<Array<Observation>>([]);

  useEffect(() => {
    const sub = fetchEncounterObservations(encounterUuid).subscribe((data) => setObservations(data.obs));
    return () => {
      sub.unsubscribe();
    };
  }, [encounterUuid]);

  const observationsList = useMemo(() => {
    return observations.map((obs: Observation) => {
      const qna = obs.display.split(':');
      return {
        question: qna[0],
        answer: qna[1],
      };
    });
  }, [observations]);

  return observationsList.length > 0 ? (
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
  );
};

export default EncounterObservations;
