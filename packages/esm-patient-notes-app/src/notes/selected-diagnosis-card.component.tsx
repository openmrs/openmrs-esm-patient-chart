import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox } from '@carbon/react';
import { Close } from '@carbon/react/icons';
import type { Diagnosis, DiagnosisCertainty } from '../types';
import styles from './selected-diagnosis-card.scss';

/**
 * A diagnosis being assembled on a visit note. Rank and certainty always carry a value:
 * secondary and provisional are the presumed defaults, and the two checkboxes record the
 * exceptions — Primary and Confirmed — so an untouched diagnosis is immediately saveable
 * (O3-5823 design feedback: the earlier per-card rank/certainty toggle groups took too
 * much space and demanded two explicit choices per diagnosis).
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

interface SelectedDiagnosisCardProps {
  diagnosis: DiagnosisDraft;
  /** Marks the Primary checkbox invalid while the note is missing a required primary diagnosis. */
  primaryInvalid?: boolean;
  onRemove: (diagnosis: DiagnosisDraft) => void;
  onUpdate: (diagnosis: DiagnosisDraft, patch: Partial<Pick<DiagnosisDraft, 'rank' | 'certainty'>>) => void;
}

export default function SelectedDiagnosisCard({
  diagnosis,
  primaryInvalid = false,
  onRemove,
  onUpdate,
}: SelectedDiagnosisCardProps) {
  const { t } = useTranslation();

  // The values presumed by the unticked checkboxes, spelled out so the row always states
  // what will be recorded without referring back to the helper text
  const presumedValues = [
    diagnosis.rank === 2 ? t('secondary', 'Secondary') : null,
    diagnosis.certainty === 'PROVISIONAL' ? t('provisional', 'Provisional') : null,
  ].filter(Boolean);

  return (
    <div className={styles.diagnosisCard} role="group" aria-label={diagnosis.display}>
      <span className={styles.diagnosisCardTitle}>
        {diagnosis.display}
        {presumedValues.length > 0 && (
          <span className={styles.diagnosisCardPresumed}>{presumedValues.join(' · ')}</span>
        )}
      </span>
      <div className={styles.diagnosisCardControls}>
        <Checkbox
          checked={diagnosis.rank === 1}
          id={`diagnosis-${diagnosis.draftId}-primary`}
          invalid={primaryInvalid}
          labelText={t('primary', 'Primary')}
          onChange={(_, { checked }) => onUpdate(diagnosis, { rank: checked ? 1 : 2 })}
        />
        <Checkbox
          checked={diagnosis.certainty === 'CONFIRMED'}
          id={`diagnosis-${diagnosis.draftId}-confirmed`}
          labelText={t('confirmed', 'Confirmed')}
          onChange={(_, { checked }) => onUpdate(diagnosis, { certainty: checked ? 'CONFIRMED' : 'PROVISIONAL' })}
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
    </div>
  );
}
