import React, { useCallback } from 'react';
import classNames from 'classnames';
import { Button, InlineLoading, Tag, Tile } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { ErrorState, OpenmrsDatePicker, useOnVisible, type Visit } from '@openmrs/esm-framework';
import VisitContextInfo from './visit-context-info.component';
import styles from './visit-picker.scss';

interface VisitPickerListProps {
  /** The visits to show. The caller owns the fetch so it can derive the selected visit from this same array. */
  visits: Array<Visit> | undefined;
  isLoading: boolean;
  error: Error | undefined;
  hasMore: boolean;
  loadMore(): void;
  /** Upper bound for the "start date on or prior to" filter. */
  maxStartDate: Date;
  onChangeMaxStartDate(date: Date): void;
  selectedVisitUuid: string | null;
  onSelectVisit(visit: Visit): void;
  onClickCreateNewVisit?(): void;
}

/**
 * A presentational visit picker: a date filter, a scrollable list of selectable visit cards, and a
 * "Create new visit" action. It is controlled — the caller owns the `useInfiniteVisits` fetch and the
 * selection state — so both the visit context switcher modal and the RDE visit dashboard can share it
 * while each derives the selected visit from its own (differently shaped) list.
 */
const VisitPickerList: React.FC<VisitPickerListProps> = ({
  visits,
  isLoading,
  error,
  hasMore,
  loadMore,
  maxStartDate,
  onChangeMaxStartDate,
  selectedVisitUuid,
  onSelectVisit,
  onClickCreateNewVisit,
}) => {
  const { t } = useTranslation();

  const onScrollToEnd = useCallback(() => {
    if (hasMore) {
      loadMore();
    }
  }, [hasMore, loadMore]);
  const ref = useOnVisible(onScrollToEnd);

  return (
    <div>
      <OpenmrsDatePicker
        id="visit-picker-date-picker"
        className={styles.datepicker}
        labelText={t('showVisitWithStartDateOnOrPriorTo', 'Show visit with start date on or prior to:')}
        maxDate={Date.now()}
        value={maxStartDate}
        onChange={onChangeMaxStartDate}
      />
      {onClickCreateNewVisit ? (
        <div className={styles.createVisitButtonContainer}>
          <Button kind="ghost" size="sm" renderIcon={Add} onClick={onClickCreateNewVisit}>
            {t('createNewVisit', 'Create new visit...')}
          </Button>
        </div>
      ) : null}
      {error ? (
        <ErrorState headerTitle={t('visits', 'visits')} error={error} />
      ) : visits?.length === 0 ? (
        <Tile className={styles.tile}>
          <div className={styles.tileContent}>
            <p className={styles.content}>{t('noVisitsToDisplay', 'No visits to display')}</p>
            <p className={styles.helper}>{t('checkFilters', 'Check the filters above')}</p>
          </div>
        </Tile>
      ) : (
        <div>
          {visits?.map((visit) => (
            <VisitCardRow
              key={visit.uuid}
              visit={visit}
              onSelect={() => onSelectVisit(visit)}
              isSelected={selectedVisitUuid === visit.uuid}
            />
          ))}
          {isLoading ? <InlineLoading description={t('loading', 'Loading')} /> : <span ref={ref} />}
        </div>
      )}
    </div>
  );
};

interface VisitCardRowProps {
  visit: Visit;
  isSelected: boolean;
  onSelect(): void;
}

/**
 * A clickable card within the visit picker to select a visit. The whole card is a button, and the
 * selected card is highlighted. An "Active"/"Past" tag indicates whether the visit is still open.
 */
const VisitCardRow: React.FC<VisitCardRowProps> = ({ visit, onSelect, isSelected }) => {
  const { t } = useTranslation();
  const isActive = !visit.stopDatetime;

  return (
    <button
      type="button"
      className={classNames(styles.visitCardRow, isSelected ? styles.isSelected : '')}
      onClick={onSelect}
      aria-pressed={isSelected}
    >
      <div className={styles.visitInfoContainer}>
        <div className={styles.visitCardHeader}>
          <span className={styles.visitType}>{visit.visitType.display}</span>
          {isActive && (
            <Tag type="blue" className={styles.visitStatusTag}>
              {t('active', 'Active')}
            </Tag>
          )}
        </div>
        <div className={styles.visitInfo}>
          <VisitContextInfo visit={visit} />
        </div>
      </div>
    </button>
  );
};

export default VisitPickerList;
