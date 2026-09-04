import React from 'react';
import classnames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { Checkmark, Close } from '@carbon/react/icons';
import type { Diagnosis, DiagnosisCertainty } from '../types';
import styles from './selected-diagnosis-card.scss';

/**
 * A diagnosis being assembled on a visit note. Order (rank) and certainty deliberately
 * start unset — the clinician must choose both before the note can be saved (O3-5823).
 * `draftId` is a client-side identity: coded concept uuids are not unique within an
 * encounter (other writers can record the same concept twice) and non-coded diagnoses
 * have no uuid at all, so cards must not be keyed or matched by concept.
 */
export type DiagnosisDraft = Omit<Diagnosis, 'rank' | 'certainty'> & {
  draftId: number;
  rank?: 1 | 2;
  certainty?: DiagnosisCertainty;
};

export type CompleteDiagnosis = DiagnosisDraft & { rank: 1 | 2; certainty: DiagnosisCertainty };

export function isCompleteDiagnosis(diagnosis: DiagnosisDraft): diagnosis is CompleteDiagnosis {
  return diagnosis.rank != null && diagnosis.certainty != null;
}

let lastDraftId = 0;
export function nextDraftId(): number {
  return ++lastDraftId;
}

interface SelectedDiagnosisCardProps {
  diagnosis: DiagnosisDraft;
  invalid: boolean;
  onRemove: (diagnosis: DiagnosisDraft) => void;
  onUpdate: (diagnosis: DiagnosisDraft, patch: Partial<Pick<DiagnosisDraft, 'rank' | 'certainty'>>) => void;
}

export default function SelectedDiagnosisCard({ diagnosis, invalid, onRemove, onUpdate }: SelectedDiagnosisCardProps) {
  const { t } = useTranslation();

  return (
    <div
      className={classnames(styles.diagnosisCard, { [styles.diagnosisCardInvalid]: invalid })}
      role="group"
      aria-label={diagnosis.display}
    >
      <div className={styles.diagnosisCardHeader}>
        <span className={styles.diagnosisCardTitle}>{diagnosis.display}</span>
        <Button
          hasIconOnly
          iconDescription={t('removeDiagnosisNamed', 'Remove {{diagnosis}}', { diagnosis: diagnosis.display })}
          kind="ghost"
          onClick={() => onRemove(diagnosis)}
          renderIcon={(props) => <Close size={16} {...props} />}
          size="sm"
        />
      </div>
      <div className={styles.toggleGroups}>
        <DiagnosisToggleGroup
          legend={t('order', 'Order')}
          options={[
            {
              label: t('primary', 'Primary'),
              selected: diagnosis.rank === 1,
              appearance: 'red',
              onSelect: () => onUpdate(diagnosis, { rank: 1 }),
            },
            {
              label: t('secondary', 'Secondary'),
              selected: diagnosis.rank === 2,
              appearance: 'blue',
              onSelect: () => onUpdate(diagnosis, { rank: 2 }),
            },
          ]}
        />
        <DiagnosisToggleGroup
          legend={t('certainty', 'Certainty')}
          options={[
            {
              label: t('confirmed', 'Confirmed'),
              selected: diagnosis.certainty === 'CONFIRMED',
              appearance: 'green',
              onSelect: () => onUpdate(diagnosis, { certainty: 'CONFIRMED' }),
            },
            {
              label: t('provisional', 'Provisional'),
              selected: diagnosis.certainty === 'PROVISIONAL',
              appearance: 'blue',
              onSelect: () => onUpdate(diagnosis, { certainty: 'PROVISIONAL' }),
            },
          ]}
        />
      </div>
      {invalid && (
        <p className={styles.diagnosisCardError} role="alert">
          {t('diagnosisOrderAndCertaintyRequired', 'Choose order and certainty for each diagnosis')}
        </p>
      )}
    </div>
  );
}

interface DiagnosisToggleGroupProps {
  legend: string;
  options: Array<{
    label: string;
    selected: boolean;
    appearance: 'red' | 'blue' | 'green';
    onSelect: () => void;
  }>;
}

const selectedToggleClassByAppearance = {
  red: styles.toggleButtonSelectedRed,
  blue: styles.toggleButtonSelectedBlue,
  green: styles.toggleButtonSelectedGreen,
};

/**
 * A two-option segmented control with radio semantics: exactly one option can be active,
 * so the buttons are exposed as a radiogroup (not independent toggle buttons) with the
 * APG roving-tabindex pattern — arrow keys move selection, Tab enters/leaves the group.
 */
function DiagnosisToggleGroup({ legend, options }: DiagnosisToggleGroupProps) {
  const selectedIndex = options.findIndex((option) => option.selected);

  return (
    <fieldset className={styles.toggleGroup}>
      <legend className={styles.toggleGroupLegend}>{legend}</legend>
      <div className={styles.toggleGroupButtons} role="radiogroup" aria-label={legend}>
        {options.map((option, index) => (
          <button
            aria-checked={option.selected}
            className={classnames(
              styles.toggleButton,
              option.selected && selectedToggleClassByAppearance[option.appearance],
            )}
            key={option.label}
            onClick={option.onSelect}
            onKeyDown={(event) => {
              if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
                event.preventDefault();
                const other = options[(index + 1) % options.length];
                other.onSelect();
                (event.currentTarget.parentElement?.children[(index + 1) % options.length] as HTMLElement)?.focus();
              }
            }}
            role="radio"
            tabIndex={option.selected || (selectedIndex === -1 && index === 0) ? 0 : -1}
            type="button"
          >
            {/* Always rendered so the button keeps a constant width when toggled */}
            <Checkmark
              size={16}
              className={classnames(styles.toggleButtonCheck, { [styles.toggleButtonCheckHidden]: !option.selected })}
            />
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
