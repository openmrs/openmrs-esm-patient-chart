import React, { type ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { ActionMenuButton2, EditIcon } from '@openmrs/esm-framework';

/**
 * Action menu button for the encounter window, which toggles the window between hidden and restored.
 *
 * TODO(O3-6031): this button is always visible, since `ActionMenuButton2` can't be hidden yet. It
 * should only appear while the encounter workspace is opened.
 *
 * This button uses the patient chart store and MUST only be used
 * within the patient chart
 */
const EncounterActionButton: React.FC = () => {
  const { t } = useTranslation();

  return (
    <ActionMenuButton2
      icon={(props: ComponentProps<typeof EditIcon>) => <EditIcon {...props} />}
      label={t('encounter', 'Encounter')}
      workspaceToLaunch={{
        workspaceName: 'encounter-workspace',
      }}
    />
  );
};

export default EncounterActionButton;
