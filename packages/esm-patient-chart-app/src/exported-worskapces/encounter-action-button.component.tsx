import React, { type ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { ActionMenuButton2, EditIcon } from '@openmrs/esm-framework';

/**
 * Action menu button for the encounter window. It only appears while the encounter workspace is
 * opened, and toggles the window between hidden and restored.
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
      // hidden={(openedWindows) => !openedWindows.some((w) => w.windowName === 'encounter-window')}
    />
  );
};

export default EncounterActionButton;
