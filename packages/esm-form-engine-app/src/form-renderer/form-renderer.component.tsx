import React from 'react';
import { InlineLoading } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { OHRIForm } from '@openmrs/openmrs-form-engine-lib';
import FormError from './form-error.component';
import useForm from '../hooks/useForm';
import useSchema from '../hooks/useSchema';
import styles from './form-renderer.scss';

interface FormRendererProps {
  formUuid: string;
  patientUuid: string;
  closeWorkspace: () => void;
}

const FormRenderer: React.FC<FormRendererProps> = ({ formUuid, patientUuid, closeWorkspace }) => {
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
    return <FormError closeWorkspace={closeWorkspace} />;
  }

  return (
    <>{schema && <OHRIForm patientUUID={patientUuid} formJson={schema} mode="enter" handleClose={closeWorkspace} />}</>
  );
};

export default FormRenderer;
