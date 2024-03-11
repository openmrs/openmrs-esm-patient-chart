import React from 'react';
import { useTranslation } from 'react-i18next';
import { InlineLoading } from '@carbon/react';
import { OHRIForm } from '@openmrs/openmrs-form-engine-lib';
import { type Visit } from '@openmrs/esm-framework';
import useFormSchema from '../hooks/useFormSchema';
import FormError from './form-error.component';
import styles from './form-renderer.scss';
import { type DefaultWorkspaceProps } from '@openmrs/esm-patient-common-lib';

interface FormRendererProps extends DefaultWorkspaceProps {
  formUuid: string;
  patientUuid: string;
  visit?: Visit;
  encounterUuid?: string;
  additionalProps?: Record<string, any>;
}

const FormRenderer: React.FC<FormRendererProps> = ({
  formUuid,
  patientUuid,
  visit,
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  encounterUuid,
  additionalProps,
}) => {
  const { t } = useTranslation();
  const { schema, error, isLoading } = useFormSchema(formUuid);

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
        <FormError closeWorkspace={closeWorkspace} />
      </div>
    );
  }

  return (
    <>
      {schema && (
        <OHRIForm
          encounterUUID={encounterUuid}
          patientUUID={patientUuid}
          visit={visit}
          formJson={schema}
          handleClose={closeWorkspace}
          onSubmit={closeWorkspaceWithSavedChanges}
          mode={additionalProps?.mode}
        />
      )}
    </>
  );
};

export default FormRenderer;
