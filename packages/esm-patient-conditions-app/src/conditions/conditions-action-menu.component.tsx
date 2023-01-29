import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { Condition } from './conditions.resource';
interface actionMenuProps {
  condition: Condition;
}

export const ActionMenu = ({ condition }: actionMenuProps) => {
  const { t } = useTranslation();

  const launchEditConditionsForm = useCallback(
    () => launchPatientWorkspace('conditions-form-workspace', { condition, context: 'editing' }),
    [condition],
  );
  return (
    <Layer>
      <OverflowMenu ariaLabel="condition actions" size="sm" flipped>
        <OverflowMenuItem id="#editCondition" onClick={() => launchEditConditionsForm()} itemText={t('edit', 'Edit')} />
        <OverflowMenuItem id="#deleteCondition" itemText={t('delete', 'Delete')} />
      </OverflowMenu>
    </Layer>
  );
};
