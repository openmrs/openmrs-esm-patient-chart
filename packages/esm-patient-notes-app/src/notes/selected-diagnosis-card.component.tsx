import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox } from '@carbon/react';
import { Close } from '@carbon/react/icons';
import type { Diagnosis, DiagnosisCertainty } from '../types';
import styles from './selected-diagnosis-card.scss';

/**
 * A diagnosis being assembled on a visit note. Rank and certainty always carry a value:
 * secondary and confirmed are the presumed defaults, and the two checkboxes record the
 * exceptions — Primary and Provisional — so an untouched diagnosis is immediately saveable
 * (O3-5823 design feedback: most diagnoses recorded at the point of care are confirmed, so
 * provisional is the thing the clinician ticks; the earlier toggle groups took too much
 * space and demanded two explicit choices per diagnosis).
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
 * Column headers for the diagnosis rows below. Rendered once above the list rather than
 * per row; hidden from assistive tech because every checkbox carries its own hidden label.
 */
export function DiagnosisListHeader() {
  const { t } = useTranslation();

  return (
    <div aria-hidden="true" className={styles.diagnosisListHeader}>
      <span />
      <span>{t('primary', 'Primary')}</span>
      <span>{t('provisional', 'Provisional')}</span>
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

  return (
    <div className={styles.diagnosisRow} data-rank={diagnosis.rank} role="group" aria-label={diagnosis.display}>
      <span className={styles.diagnosisName}>{diagnosis.display}</span>
      <Checkbox
        checked={diagnosis.rank === 1}
        hideLabel
        id={`diagnosis-${diagnosis.draftId}-primary`}
        labelText={t('primary', 'Primary')}
        onChange={(_, { checked }) => onUpdate(diagnosis, { rank: checked ? 1 : 2 })}
      />
      <Checkbox
        checked={diagnosis.certainty === 'PROVISIONAL'}
        hideLabel
        id={`diagnosis-${diagnosis.draftId}-provisional`}
        labelText={t('provisional', 'Provisional')}
        onChange={(_, { checked }) => onUpdate(diagnosis, { certainty: checked ? 'PROVISIONAL' : 'CONFIRMED' })}
      />
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
