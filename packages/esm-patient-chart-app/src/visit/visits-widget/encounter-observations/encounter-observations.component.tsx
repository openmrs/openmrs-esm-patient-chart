import React from 'react';
import { useTranslation } from 'react-i18next';
import { SkeletonText } from '@carbon/react';
import { type Obs, useConfig } from '@openmrs/esm-framework';
import styles from './styles.scss';

interface EncounterObservationsProps {
  observations: Array<Obs>;
}

const EncounterObservations: React.FC<EncounterObservationsProps> = ({ observations }) => {
  const { t } = useTranslation();
  const { obsConceptUuidsToHide = [] } = useConfig();

  function getAnswerFromDisplay(display: string): string {
    const colonIndex = display.indexOf(':');
    if (colonIndex === -1) {
      return '';
    } else {
      return display.substring(colonIndex + 1).trim();
    }
  }

  if (!observations) {
    return <SkeletonText />;
  }

  if (observations) {
    const filteredObservations = !!obsConceptUuidsToHide.length
      ? observations?.filter((obs) => {
          return !obsConceptUuidsToHide.includes(obs?.concept?.uuid);
        })
      : observations;
    return (
      <div className={styles.observation}>
        {filteredObservations?.map((obs, index) => {
          if (obs.groupMembers) {
            return (
              <React.Fragment key={index}>
                <span className={styles.parentConcept}>{obs.concept.display}</span>
                <span />
                {obs.groupMembers.map((member) => (
                  <React.Fragment key={index}>
                    <span className={styles.childConcept}>{member.concept.display}</span>
                    <span>{getAnswerFromDisplay(member.display)}</span>
                  </React.Fragment>
                ))}
              </React.Fragment>
            );
          } else {
            return (
              <React.Fragment key={index}>
                <span>{obs.concept.display}</span>
                <span>{getAnswerFromDisplay(obs.display)}</span>
              </React.Fragment>
            );
          }
        })}
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
