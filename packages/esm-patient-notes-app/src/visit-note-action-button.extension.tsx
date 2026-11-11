import React, { type ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { ActionMenuButton2, PenIcon } from '@openmrs/esm-framework';
import {
  type PatientChartWorkspaceActionButtonProps,
  useActionMenuButtonLaunchProps,
} from '@openmrs/esm-patient-common-lib';

const visitNoteWorkspaceProps = {};

/**
 * This button uses the patient chart store and MUST only be used
 * within the patient chart
 */
const VisitNoteActionButton: React.FC<PatientChartWorkspaceActionButtonProps> = ({ groupProps }) => {
  const { t } = useTranslation();
  const launchProps = useActionMenuButtonLaunchProps(groupProps, 'visit-notes-form-workspace', visitNoteWorkspaceProps);

  return (
    <ActionMenuButton2
      icon={(props: ComponentProps<typeof PenIcon>) => <PenIcon {...props} />}
      label={t('visitNote', 'Visit note')}
      {...launchProps}
    />
  );
};

export default VisitNoteActionButton;
