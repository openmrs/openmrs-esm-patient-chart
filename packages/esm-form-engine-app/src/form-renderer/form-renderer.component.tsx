import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { InlineLoading } from '@carbon/react';
import { FormEngine } from '@openmrs/openmrs-form-engine-lib';
import { type Visit } from '@openmrs/esm-framework';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import FormError from './form-error.component';
import useFormSchema from '../hooks/useFormSchema';
import styles from './form-renderer.scss';
import { type DefaultPatientWorkspaceProps } from '@openmrs/esm-patient-common-lib';

interface FormRendererProps extends DefaultPatientWorkspaceProps {
  additionalProps?: Record<string, any>;
  encounterUuid?: string;
  formUuid: string;
  patientUuid: string;
  visit?: Visit;
}

const FormRenderer: React.FC<FormRendererProps> = ({
  additionalProps,
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  encounterUuid,
  formUuid,
  patientUuid,
  promptBeforeClosing,
  visit,
}) => {
  const { t } = useTranslation();
  const { schema, error, isLoading } = useFormSchema(formUuid);

  const handleCloseForm = useCallback(() => {
    closeWorkspace();
    !encounterUuid && launchPatientWorkspace('clinical-forms-workspace');
  }, [closeWorkspace, encounterUuid]);

  const handleMarkFormAsDirty = useCallback(
    (isDirty: boolean) => promptBeforeClosing(() => isDirty),
    [promptBeforeClosing],
  );

  if (isLoading) {
    return (
      <div className={styles.loaderContainer}>
        <InlineLoading className={styles.loading} description={`${t('loading', 'Loading')} ...`} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <FormError closeWorkspace={handleCloseForm} />
      </div>
    );
  }

  return (
    <>
      {schema && (
        <FormEngine
          encounterUUID={encounterUuid}
          formJson={schema}
          handleClose={handleCloseForm}
          markFormAsDirty={handleMarkFormAsDirty}
          mode={additionalProps?.mode}
          onSubmit={closeWorkspaceWithSavedChanges}
          patientUUID={patientUuid}
          visit={visit}
        />
      )}
    </>
  );
};

export default FormRenderer;
