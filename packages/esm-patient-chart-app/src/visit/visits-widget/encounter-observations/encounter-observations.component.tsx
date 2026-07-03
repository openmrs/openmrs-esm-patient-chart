import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate, formatDatetime, parseDate, type Obs, useConfig } from '@openmrs/esm-framework';
import styles from './styles.scss';

interface EncounterObservationsProps {
  observations: Array<Obs>;
}

function getAnswerFromDisplay(display: string): string {
  const colonIndex = display.indexOf(':');
  if (colonIndex === -1) {
    return '';
  } else {
    return display.substring(colonIndex + 1).trim();
  }
}

const ISO_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATETIME = /^\d{4}-\d{2}-\d{2}T/;

function getObsValue(obs: Obs): string {
  const conceptClass = obs.concept?.conceptClass?.display;

  if (typeof obs.value === 'string' && obs.value) {
    // Form date fields are often concept class "Misc" with an ISO date string value
    if (conceptClass === 'Date' || ISO_DATE_ONLY.test(obs.value)) {
      return formatDate(parseDate(obs.value), { mode: 'wide', time: false });
    }
    if (conceptClass === 'Datetime' || ISO_DATETIME.test(obs.value)) {
      return formatDatetime(parseDate(obs.value), { mode: 'wide', noToday: true });
    }
  }

  return getAnswerFromDisplay(obs.display);
}

const EncounterObservations: React.FC<EncounterObservationsProps> = ({ observations }) => {
  const { t } = useTranslation();
  const { obsConceptUuidsToHide = [] } = useConfig();

  const filteredObservations = !!obsConceptUuidsToHide.length
    ? observations?.filter((obs) => {
        return !obsConceptUuidsToHide.includes(obs?.concept?.uuid);
      })
    : observations;

  if (!filteredObservations || filteredObservations.length == 0) {
    return (
      <div className={styles.observation}>
        <p>{t('noObservationsFound', 'No observations found')}</p>
      </div>
    );
  }

  return (
    <div className={styles.observation}>
      {filteredObservations?.map((obs, index) => {
        if (obs.groupMembers) {
          return (
            <React.Fragment key={index}>
              <span className={styles.parentConcept}>{obs.concept.display}</span>
              <span />
              {obs.groupMembers.map((member) => (
                <React.Fragment key={member.uuid}>
                  <span className={styles.childConcept}>{member.concept.display}</span>
                  <span>{getObsValue(member)}</span>
                </React.Fragment>
              ))}
            </React.Fragment>
          );
        } else {
          return (
            <React.Fragment key={index}>
              <span>{obs.concept.display}</span>
              <span>{getObsValue(obs)}</span>
            </React.Fragment>
          );
        }
      })}
    </div>
  );
};

export default EncounterObservations;
