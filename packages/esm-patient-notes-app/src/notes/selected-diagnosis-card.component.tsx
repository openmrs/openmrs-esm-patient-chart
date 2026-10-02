import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { CloseFilled } from '@carbon/react/icons';
import type { Diagnosis, DiagnosisCertainty } from '../types';
import styles from './selected-diagnosis-card.scss';

/**
 * A diagnosis being assembled on a visit note. Rank and certainty always carry a value:
 * every diagnosis is confirmed and secondary until the clinician says otherwise, so an
 * untouched diagnosis is immediately saveable. Primary is a checkbox (at least one is
 * required when the distro says so); certainty is changed through the row's actions
 * menu ("Mark as provisional" / "Mark as confirmed"), which is also where future
 * per-diagnosis actions belong (O3-5823 design discussion on Talk).
 * `draftId` is a client-side identity: coded concept uuids are not unique within an
 * encounter (other writers can record the same concept twice) and non-coded diagnoses
 * have no uuid at all, so cards must not be keyed or matched by concept.
 * `conceptClassUuid` is known up front for concepts picked from the search (which is
 * restricted to the diagnosis class); diagnoses prefilled from an encounter leave it unset
 * and the form looks the class up.
 */
export type DiagnosisDraft = Omit<Diagnosis, 'rank' | 'certainty'> & {
  draftId: number;
  rank: 1 | 2;
  certainty: DiagnosisCertainty;
  conceptClassUuid?: string;
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
  /** Only true diagnoses (by concept class) get the certainty action; symptoms and findings do not */
  canMarkProvisional: boolean;
  diagnosis: DiagnosisDraft;
  onRemove: (diagnosis: DiagnosisDraft) => void;
  onUpdate: (diagnosis: DiagnosisDraft, patch: Partial<Pick<DiagnosisDraft, 'rank' | 'certainty'>>) => void;
}

export default function SelectedDiagnosisCard({
  canMarkProvisional,
  diagnosis,
  onRemove,
  onUpdate,
}: SelectedDiagnosisCardProps) {
  const { t } = useTranslation();
  const isProvisional = diagnosis.certainty === 'PROVISIONAL';

  return (
    <div className={styles.diagnosisRow} role="group" aria-label={diagnosis.display}>
      <Checkbox
        aria-describedby="primary-diagnosis-requirement"
        checked={diagnosis.rank === 1}
        hideLabel
        id={`diagnosis-${diagnosis.draftId}-primary`}
        labelText={t('primary', 'Primary')}
        onChange={(_, { checked }) => onUpdate(diagnosis, { rank: checked ? 1 : 2 })}
      />
      <span className={styles.diagnosisName}>
        {isProvisional && (
          <>
            <span aria-hidden="true" className={styles.provisionalMark}>
              ?
            </span>
            <span className="cds--visually-hidden">{t('provisional', 'Provisional')} </span>
          </>
        )}
        {diagnosis.display}
      </span>
      {/* Certainty belongs to diagnoses. Symptoms and findings recorded as encounter diagnoses
          by other forms keep their stored certainty but get no action; the cell stays so the
          grid keeps its columns. */}
      <div className={styles.actionsCell}>
        {canMarkProvisional && (
          <OverflowMenu
            align="left"
            aria-label={t('diagnosisActions', 'Actions for {{diagnosis}}', { diagnosis: diagnosis.display })}
            flipped
            iconDescription={t('diagnosisActions', 'Actions for {{diagnosis}}', { diagnosis: diagnosis.display })}
            menuOptionsClass={styles.diagnosisActionsMenu}
            size="sm"
          >
            <OverflowMenuItem
              itemText={
                isProvisional
                  ? t('markAsConfirmed', 'Mark as confirmed')
                  : t('markAsProvisional', 'Mark as provisional')
              }
              onClick={() => onUpdate(diagnosis, { certainty: isProvisional ? 'CONFIRMED' : 'PROVISIONAL' })}
            />
          </OverflowMenu>
        )}
      </div>
      <Button
        hasIconOnly
        iconDescription={t('removeDiagnosisNamed', 'Remove {{diagnosis}}', { diagnosis: diagnosis.display })}
        kind="ghost"
        onClick={() => onRemove(diagnosis)}
        renderIcon={(props) => <CloseFilled size={16} {...props} />}
        size="sm"
        tooltipAlignment="end"
      />
    </div>
  );
}
