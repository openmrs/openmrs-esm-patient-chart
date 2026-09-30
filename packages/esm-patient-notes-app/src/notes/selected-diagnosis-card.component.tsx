import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { Close } from '@carbon/react/icons';
import type { Diagnosis, DiagnosisCertainty } from '../types';
import styles from './selected-diagnosis-card.scss';

/**
 * A diagnosis being assembled on a visit note. Rank and certainty always carry a value:
 * every diagnosis is confirmed and secondary until the clinician says otherwise, so an
 * untouched diagnosis is immediately saveable. Primary is a checkbox (at least one is
 * required when the distro says so); certainty is changed through the row's actions
 * menu ("Mark as preliminary" / "Mark as confirmed"), which is also where future
 * per-diagnosis actions belong (O3-5823 design discussion on Talk).
 * `draftId` is a client-side identity: coded concept uuids are not unique within an
 * encounter (other writers can record the same concept twice) and non-coded diagnoses
 * have no uuid at all, so cards must not be keyed or matched by concept.
 */
export type DiagnosisDraft = Omit<Diagnosis, 'rank' | 'certainty'> & {
  draftId: number;
  rank: 1 | 2;
  certainty: DiagnosisCertainty;
};

let lastDraftId = 0;
export function nextDraftId(): number {
  return ++lastDraftId;
}

/**
 * Column header for the diagnosis rows below. Rendered once above the list and aligned to
 * the rows' Primary column; hidden from assistive tech because every checkbox carries its
 * own hidden label.
 */
export function DiagnosisListHeader() {
  const { t } = useTranslation();

  return (
    <div aria-hidden="true" className={styles.diagnosisListHeader}>
      <span>{t('primary', 'Primary')}</span>
      <span />
      <span />
      <span />
    </div>
  );
}

interface SelectedDiagnosisCardProps {
  diagnosis: DiagnosisDraft;
  onRemove: (diagnosis: DiagnosisDraft) => void;
  onUpdate: (diagnosis: DiagnosisDraft, patch: Partial<Pick<DiagnosisDraft, 'rank' | 'certainty'>>) => void;
}

export default function SelectedDiagnosisCard({ diagnosis, onRemove, onUpdate }: SelectedDiagnosisCardProps) {
  const { t } = useTranslation();
  const isPreliminary = diagnosis.certainty === 'PROVISIONAL';

  return (
    <div className={styles.diagnosisRow} role="group" aria-label={diagnosis.display}>
      <Checkbox
        checked={diagnosis.rank === 1}
        hideLabel
        id={`diagnosis-${diagnosis.draftId}-primary`}
        labelText={t('primary', 'Primary')}
        onChange={(_, { checked }) => onUpdate(diagnosis, { rank: checked ? 1 : 2 })}
      />
      <span className={styles.diagnosisName}>
        {isPreliminary && (
          <>
            <span aria-hidden="true" className={styles.preliminaryMark}>
              ?
            </span>
            <span className="cds--visually-hidden">{t('preliminary', 'Preliminary')} </span>
          </>
        )}
        {diagnosis.display}
      </span>
      {/* The diagnosis search is restricted to the configured diagnosis concept class, so
          every row here is a true diagnosis and may be marked preliminary; symptoms and
          findings never reach this list. */}
      <div className={styles.actionsCell}>
        <OverflowMenu
          align="left"
          aria-label={t('diagnosisActions', 'Actions for {{diagnosis}}', { diagnosis: diagnosis.display })}
          flipped
          iconDescription={t('diagnosisActions', 'Actions for {{diagnosis}}', { diagnosis: diagnosis.display })}
          size="sm"
        >
          <OverflowMenuItem
            itemText={
              isPreliminary ? t('markAsConfirmed', 'Mark as confirmed') : t('markAsPreliminary', 'Mark as preliminary')
            }
            onClick={() => onUpdate(diagnosis, { certainty: isPreliminary ? 'CONFIRMED' : 'PROVISIONAL' })}
          />
        </OverflowMenu>
      </div>
      <Button
        hasIconOnly
        iconDescription={t('removeDiagnosisNamed', 'Remove {{diagnosis}}', { diagnosis: diagnosis.display })}
        kind="ghost"
        onClick={() => onRemove(diagnosis)}
        renderIcon={(props) => <Close size={16} {...props} />}
        size="sm"
        tooltipAlignment="end"
      />
    </div>
  );
}
