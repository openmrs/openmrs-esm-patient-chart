import React from 'react';
import { useTranslation } from 'react-i18next';
import { InlineLoading } from '@carbon/react';
import { OHRIForm } from '@openmrs/openmrs-form-engine-lib';
import { Visit } from '@openmrs/esm-framework';
import useForm from '../hooks/useForm';
import useSchema from '../hooks/useSchema';
import FormError from './form-error.component';
import styles from './form-renderer.scss';

interface FormRendererProps {
  formUuid: string;
  patientUuid: string;
  visit?: Visit;
  mutateVisits?: () => void;
  closeWorkspace: () => void;
  encounterUuid?: string;
}

const FormRenderer: React.FC<FormRendererProps> = ({
  formUuid,
  patientUuid,
  visit,
  closeWorkspace,
  encounterUuid,
  mutateVisits,
}) => {
  const { t } = useTranslation();
  const { form, formLoadError } = useForm(formUuid);

  const valueReferenceUuid = form?.resources.find((resource) => resource.name === 'JSON schema')?.valueReference;
  const { schema, isLoadingSchema, schemaLoadError } = useSchema(valueReferenceUuid);

  if (isLoadingSchema) {
    return (
      <div className={styles.loaderContainer}>
        <InlineLoading className={styles.loading} description={`${t('loading', 'Loading')} ...`} />
      </div>
    );
  }

  if (formLoadError || schemaLoadError) {
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
          onSubmit={() => {
            mutateVisits?.();
            closeWorkspace();
          }}
        />
      )}
    </>
  );
};

export default FormRenderer;
