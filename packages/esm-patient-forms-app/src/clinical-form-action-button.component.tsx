import React, { type ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { ActionMenuButton2, DocumentIcon } from '@openmrs/esm-framework';
import {
  type PatientChartWorkspaceActionButtonProps,
  useActionMenuButtonLaunchProps,
} from '@openmrs/esm-patient-common-lib';

const clinicalFormsWorkspaceProps = {};

/**
 * This button uses the patient chart store and MUST only be used
 * within the patient chart
 */
const ClinicalFormActionButton: React.FC<PatientChartWorkspaceActionButtonProps> = ({ groupProps }) => {
  const { t } = useTranslation();
  const launchProps = useActionMenuButtonLaunchProps(
    groupProps,
    'clinical-forms-workspace',
    clinicalFormsWorkspaceProps,
  );

  return (
    <ActionMenuButton2
      icon={(props: ComponentProps<typeof DocumentIcon>) => <DocumentIcon {...props} />}
      label={t('clinicalForms', 'Clinical forms')}
      {...launchProps}
    />
  );
};

export default ClinicalFormActionButton;
