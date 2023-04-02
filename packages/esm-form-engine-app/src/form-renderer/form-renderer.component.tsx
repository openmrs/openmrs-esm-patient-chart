import React from 'react';
import useForm from '../hooks/useForm';
import useSchema from '../hooks/useSchema';
import { OHRIForm } from '@ohri/openmrs-ohri-form-engine-lib';
import { InlineNotification, InlineLoading } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import styles from './form-renderer.scss';

interface FormRendererProps {
  formUuid: string;
  patientUuid: string;
  closeWorkspace: () => void;
}

const FormRenderer: React.FC<FormRendererProps> = ({ formUuid, patientUuid, closeWorkspace }) => {
  const { t } = useTranslation();
  const { form, isLoading: formLoading, error: formError } = useForm(formUuid);
  const valueReferenceUuid = form?.resources.find((resource) => resource.name === 'JSON schema')?.valueReference;
  const { schema, isLoading: schemaLoading, error: schemaError } = useSchema(valueReferenceUuid);

  if (formError || schemaError) {
    return (
      <InlineNotification
        kind="error"
        lowContrast
        iconDescription={(error: any) =>
          error?.response?.data?.error?.message ? error.response.data.error.message : error
        }
        title={t('error', 'Error loading form')}
        subtitle={t('errorLoadingForm', 'An error occurred while loading the form')}
        onClose={closeWorkspace}
      />
    );
  }

  if (schemaLoading) {
    return <InlineLoading className={styles.loading} description={`${t('loading', 'Loading')} ...`} />;
  }

  return (
    <>{schema && <OHRIForm patientUUID={patientUuid} formJson={schema} mode="enter" handleClose={closeWorkspace} />}</>
  );
};

export default FormRenderer;
