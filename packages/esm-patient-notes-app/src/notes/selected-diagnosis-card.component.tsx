import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { CloseFilled } from '@carbon/react/icons';
import type { Diagnosis, DiagnosisCertainty } from '../types';
import styles from './selected-diagnosis-card.scss';

/**
 * Draft IDs distinguish duplicate concepts and non-coded diagnoses. Search results supply
 * the concept class; diagnoses loaded from an encounter need a lookup.
 */
export type DiagnosisDraft = Omit<Diagnosis, 'rank' | 'certainty'> & {
  draftId: number;
  rank: number;
  certainty: DiagnosisCertainty;
  conceptClassUuid?: string;
};

let lastDraftId = 0;
export function nextDraftId(): number {
  return ++lastDraftId;
}

export function DiagnosisListHeader() {
  const { t } = useTranslation();

  return (
    <div aria-hidden="true" className={styles.diagnosisListHeader}>
      <span>{t('primary', 'Primary')}</span>
    </div>
  );
}

interface SelectedDiagnosisCardProps {
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
