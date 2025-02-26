import { Button, InlineLoading, ModalBody, ModalFooter, ModalHeader, RadioButton } from '@carbon/react';
import { ErrorState, type Visit } from '@openmrs/esm-framework';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import classNames from 'classnames';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useInfiniteVisits } from '../visit.resource';
import { useVisitContextStore } from './visit-context';
import VisitContextInfo from './visit-context-info.component';
import styles from './visit-context-switcher.scss';

interface VisitContextSwitcherProps {
  patientUuid: string;
  onAfterVisitSelected?(); // optional callback to run after visit is selected
  closeModal();
}

const VisitContextSwitcherModal: React.FC<VisitContextSwitcherProps> = ({
  patientUuid,
  closeModal,
  onAfterVisitSelected,
}) => {
  const { t } = useTranslation();
  const { visits, isLoading, error } = useInfiniteVisits(patientUuid);
  const { patientUuid: selectedVisitPatientUuid, manuallySetVisitUuid, setVisitContext } = useVisitContextStore();
  const [selectedVisit, setSelectedVisit] = useState<string>(
    selectedVisitPatientUuid === patientUuid ? manuallySetVisitUuid : null,
  );

  const openStartVisitWorkspace = () => {
    closeModal();
    launchPatientWorkspace('start-visit-workspace-form', {
      openedFrom: 'visit-context-switcher',
    });
  };

  return (
    <>
      <ModalHeader closeModal={closeModal} title={t('selectAVisit', 'Select a visit')} />
      <ModalBody>
        {isLoading ? (
          <InlineLoading description={`${t('loading', 'Loading')} ...`} role="progressbar" />
        ) : error ? (
          <ErrorState headerTitle={t('visits', 'visits')} error={error} />
        ) : (
          <div className={styles.visitCardRowsContainer}>
            {visits?.map((visit) => {
              return (
                <VisitCardRow
                  key={visit.uuid}
                  visit={visit}
                  setSelectedVisit={setSelectedVisit}
                  isSelected={selectedVisit == visit.uuid}
                />
              );
            })}
          </div>
        )}
        <Button kind="ghost" size="sm" onClick={openStartVisitWorkspace}>
          {t('createNewVisit', 'Create new visit...')}
        </Button>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button
          disabled={selectedVisit == null || isLoading}
          onClick={() => {
            setVisitContext(visits.find((v) => v.uuid === selectedVisit));
            onAfterVisitSelected?.();
            closeModal();
          }}
        >
          {t('continue', 'Continue')}
        </Button>
      </ModalFooter>
    </>
  );
};

interface VisitCardRowProps {
  visit: Visit;
  isSelected: boolean;
  setSelectedVisit(visitUuid: string);
}

/**
 * A clickable row within the the visit context switcher to select a visit. This
 * has slightly different UX than a regular radio button, as the entire card
 * (not just the radio button and the label) is clickable
 */
const VisitCardRow: React.FC<VisitCardRowProps> = ({ visit, setSelectedVisit: setSelected, isSelected }) => {
  const isActive = !Boolean(visit.stopDatetime);

  return (
    <div
      className={classNames(
        styles.visitCardRow,
        isActive ? styles.activeVisit : styles.retroactiveVisit,
        isSelected ? styles.isSelected : '',
      )}
    >
      <div className={styles.visitInfoContainer}>
        <div className={styles.visitType}>{visit.visitType.display}</div>
        <div className={styles.visitInfo}>
          <VisitContextInfo visit={visit} />
        </div>
      </div>
      <div className={styles.visitCardRowRadioButton}>
        <RadioButton
          className={styles.visitRow}
          id={`visit-card-row-${visit.uuid}`}
          value={visit.uuid}
          checked={isSelected}
          onChange={(value) => setSelected(value)}
        />
      </div>
      <button className={styles.visitCardRowButton} onClick={() => setSelected(visit.uuid)}></button>
    </div>
  );
};

export default VisitContextSwitcherModal;
