import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SkeletonText } from '@carbon/react';
import { useConfig } from '@openmrs/esm-framework';
import { type Observation } from '../visit.resource';
import styles from './styles.scss';
import { otzUuid, otzOutPut } from '../../../constants';

interface EncounterObservationsProps {
  observations: Array<Observation>;
}

const EncounterObservations: React.FC<EncounterObservationsProps> = ({ observations }) => {
  const { t } = useTranslation();
  const { obsConceptUuidsToHide = [] } = useConfig();
  const { obsConceptDisplayOverrides = { otzUuid: otzOutPut } } = useConfig();

  const getAnswerFromDisplay = useMemo(() => {
    return (display: string, conceptUuid: string): string => {
      const colonIndex = display.indexOf(':');
      if (colonIndex === -1) {
        return '';
      } else {
        const displayValue = display.substring(colonIndex + 1).trim();
        if (obsConceptDisplayOverrides[conceptUuid]) {
          return obsConceptDisplayOverrides[conceptUuid];
        }
        return displayValue;
      }
    };
  }, [obsConceptDisplayOverrides]);

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
                    <span>{getAnswerFromDisplay(member.display, obs.value.uuid)}</span>
                  </React.Fragment>
                ))}
              </React.Fragment>
            );
          } else {
            return (
              <React.Fragment key={index}>
                <span>{obs.concept.display}</span>
                <span>{getAnswerFromDisplay(obs.display, obs.value.uuid)}</span>
              </React.Fragment>
            );
          }
        })}
      </div>
    );
  }
};

export default EncounterObservations;
