import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { Button, ModalBody, ModalFooter, ModalHeader, RadioButton, InlineLoading, Tile } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import {
  ErrorState,
  launchWorkspace,
  OpenmrsDatePicker,
  useDebounce,
  useOnVisible,
  useVisitContextStore,
  type Visit,
} from '@openmrs/esm-framework';
import { useInfiniteVisits } from '../visit.resource';
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
  const [maxStartDate, setMaxStartDate] = useState(new Date());
  const maxStartDateDebounced = useDebounce(maxStartDate);

  const rep = 'custom:(uuid,display,visitType,startDatetime,stopDatetime,location,patient)';
  const { visits, isLoading, error, hasMore, loadMore } = useInfiniteVisits(
    patientUuid,
    { toStartDate: dayjs(maxStartDateDebounced).endOf('day').toISOString() },
    rep,
  );
  const { patientUuid: selectedVisitPatientUuid, manuallySetVisitUuid, setVisitContext } = useVisitContextStore();
  const [selectedVisit, setSelectedVisit] = useState<string>(
    selectedVisitPatientUuid === patientUuid ? manuallySetVisitUuid : null,
  );

  const onScrollToEnd = useCallback(() => {
    if (hasMore) {
      loadMore();
    }
  }, [hasMore, loadMore]);
  const ref = useOnVisible(onScrollToEnd);

  const openStartVisitWorkspace = () => {
    closeModal();
    launchWorkspace('start-visit-workspace-form', {
      openedFrom: 'visit-context-switcher',
    });
  };

  return (
    <>
      <ModalHeader closeModal={closeModal} title={t('selectAVisit', 'Select a visit')}>
        <OpenmrsDatePicker
          id={'visit-context-swticher-date-picker'}
          className={styles.datepicker}
          labelText={t('showVisitOnOrPriorTo', 'Show visit on or prior to:')}
          maxDate={Date.now()}
          value={maxStartDate}
          onChange={setMaxStartDate}
        />
      </ModalHeader>
      <ModalBody>
        {error ? (
          <ErrorState headerTitle={t('visits', 'visits')} error={error} />
        ) : visits?.length == 0 ? (
          <Tile className={styles.tile}>
            <div className={styles.tileContent}>
              <p className={styles.content}>{t('noVisitsToDisplay', 'No visits to display')}</p>
              <p className={styles.helper}>{t('checkFilters', 'Check the filters above')}</p>
            </div>
          </Tile>
        ) : (
          <div>
            {visits?.map((visit) => {
              return (
                <VisitCardRow
                  key={visit.uuid}
                  visit={visit}
                  setSelectedVisit={setSelectedVisit}
                  isSelected={selectedVisit === visit.uuid}
                />
              );
            })}
            {isLoading ? <InlineLoading description={t('loading', 'Loading')} /> : <span ref={ref} />}
          </div>
        )}
      </ModalBody>
      <div className={styles.createVisitButtonContainer}>
        <Button kind="ghost" size="sm" onClick={openStartVisitWorkspace}>
          {t('createNewVisit', 'Create new visit...')}
        </Button>
      </div>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button
          disabled={selectedVisit === null || isLoading}
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
  const isActive = !visit.stopDatetime;

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
          labelText={visit.visitType.display}
          onChange={(value) => setSelected(String(value))}
        />
      </div>
      <button className={styles.visitCardRowButton} onClick={() => setSelected(visit.uuid)}></button>
    </div>
  );
};

export default VisitContextSwitcherModal;
