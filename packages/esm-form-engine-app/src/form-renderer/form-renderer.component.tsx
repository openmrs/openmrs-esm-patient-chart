import React from 'react';
import useForm from '../hooks/useForm';
import useSchema from '../hooks/useSchema';
import { OHRIForm } from '@openmrs/openmrs-form-engine-lib';
import { InlineLoading } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import styles from './form-renderer.scss';
import FormError from './form-error.component';

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
    return <FormError closeWorkspace={closeWorkspace} />;
  }

  if (schemaLoading) {
    return <InlineLoading className={styles.loading} description={`${t('loading', 'Loading')} ...`} />;
  }

  return (
    <>{schema && <OHRIForm patientUUID={patientUuid} formJson={schema} mode="enter" handleClose={closeWorkspace} />}</>
  );
};

export default FormRenderer;
