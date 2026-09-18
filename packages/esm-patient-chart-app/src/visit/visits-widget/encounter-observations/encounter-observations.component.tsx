import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, SkeletonText } from '@carbon/react';
import { type Obs, showModal, useConfig } from '@openmrs/esm-framework';
import { type ComplexObs, getAttachmentLabel, isAttachmentObs, toAttachment } from './attachment-obs';
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

  function getAnswer(obs: Obs): React.ReactNode {
    // A file attachment. Its REST display only carries the attachments module's storage marker,
    // so show the caption or file name and let the user open the file.
    const complexObs = obs as ComplexObs;
    if (isAttachmentObs(complexObs)) {
      const attachment = toAttachment(complexObs);
      // The href keeps the file reachable in a new tab; a plain click opens the in-app preview.
      return (
        <Link
          href={attachment.src}
          onClick={(event: React.MouseEvent) => {
            event.preventDefault();
            const dispose = showModal('attachment-preview-modal', {
              attachment,
              size: 'lg',
              closeModal: () => dispose(),
            });
          }}
        >
          {getAttachmentLabel(complexObs)}
        </Link>
      );
    }

    if (
      obs.value !== null &&
      typeof obs.value === 'object' &&
      'uuid' in obs.value &&
      typeof obs.value.uuid === 'string' &&
      'display' in obs.value &&
      typeof obs.value.display === 'string'
    ) {
      return obs.value.display;
    }

    return getAnswerFromDisplay(obs.display);
  }

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
                  <span>{getAnswer(member)}</span>
                </React.Fragment>
              ))}
            </React.Fragment>
          );
        } else {
          return (
            <React.Fragment key={index}>
              <span>{obs.concept.display}</span>
              <span>{getAnswer(obs)}</span>
            </React.Fragment>
          );
        }
      })}
    </div>
  );
};

export default EncounterObservations;
