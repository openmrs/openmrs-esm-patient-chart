import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SkeletonText } from '@carbon/react';
import { Observation } from '../visit.resource';
import styles from './styles.scss';

interface EncounterObservationsProps {
  observations: Array<Observation>;
}

const EncounterObservations: React.FC<EncounterObservationsProps> = ({ observations }) => {
  const { t } = useTranslation();

  const obsWithGroupMembers = useMemo(
    () =>
      observations
        ?.filter((obs) => obs.groupMembers)
        .map(({ groupMembers }) => ({
          members: groupMembers,
        })),
    [observations],
  );

  const obsWithoutGroupMembers = useMemo(() => observations?.filter((obs) => !obs.groupMembers), [observations]);

  function splitObsDisplay(display) {
    const colonIndex = display.indexOf(':');
    if (colonIndex === -1) {
      return [display, ''];
    } else {
      const title = display.substring(0, colonIndex).trim();
      const text = display.substring(colonIndex + 1).trim();
      return [title, text];
    }
  }

  const observationsList = useMemo(
    () =>
      observations?.map(({ display }) => {
        const [question, answer] = splitObsDisplay(display);
        return { question, answer };
      }),
    [observations],
  );

  if (!observations) {
    return <SkeletonText />;
  }

  if (obsWithoutGroupMembers.length) {
    return (
      <div className={styles.observation}>
        {observationsList?.map(({ question, answer }, i) => (
          <React.Fragment key={i}>
            <span className={styles.caption01}>{question}</span>
            <span className={`${styles.bodyShort02} ${styles.text01}`}>{answer}</span>
          </React.Fragment>
        ))}
      </div>
    );
  }

  if (obsWithGroupMembers.length) {
    const groupMembers = obsWithGroupMembers.flatMap(({ members }) =>
      members.map(({ display }) => {
        const [question, answer] = splitObsDisplay(display);
        return { question, answer };
      }),
    );

    return (
      <div className={styles.observation}>
        {groupMembers?.map(({ question, answer }, i) => (
          <React.Fragment key={i}>
            <span className={styles.caption01}>{question}</span>
            <span className={`${styles.bodyShort02} ${styles.text01}`}>{answer}</span>
          </React.Fragment>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.observation}>
      <p>{t('noObservationsFound', 'No observations found')}</p>
    </div>
  );
};

export default EncounterObservations;
