import React from 'react';
import { Button } from '@carbon/react';
import { Document } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { useLayoutType } from '@openmrs/esm-framework';
import { useWorkspaces } from '@openmrs/esm-patient-common-lib';
import useLaunchFormsWorkspace from './forms/use-launch-forms-workspace';
import styles from './clinical-form-action-button.scss';

const ClinicalFormActionButton: React.FC = () => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const { workspaces } = useWorkspaces();
  const { launchFormsWorkspace } = useLaunchFormsWorkspace();

  const isMostActive = workspaces?.[0]?.name.includes('clinical-forms-workspace');

  if (layout === 'tablet')
    return (
      <Button
        kind="ghost"
        className={`${styles.container} ${isMostActive ? styles.active : ''}`}
        tabIndex={0}
        onClick={launchFormsWorkspace}
      >
        <Document size={20} />
        <span>{t('clinicalForm', 'Clinical form')}</span>
      </Button>
    );

  return (
    <Button
      className={`${styles.container} ${isMostActive ? styles.active : ''}`}
      kind="ghost"
      renderIcon={(props) => <Document size={20} {...props} />}
      hasIconOnly
      iconDescription={t('form', 'Form')}
      onClick={launchFormsWorkspace}
      tooltipAlignment="end"
      tooltipPosition="bottom"
      size="sm"
    />
  );
};

export default ClinicalFormActionButton;
