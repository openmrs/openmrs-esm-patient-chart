import React from 'react';
import { useTranslation } from 'react-i18next';
import { InlineLoading } from '@carbon/react';
import { OHRIForm, type SessionMode } from '@openmrs/openmrs-form-engine-lib';
import { type Visit } from '@openmrs/esm-framework';
import useFormSchema from '../hooks/useFormSchema';
import FormError from './form-error.component';
import styles from './form-renderer.scss';

interface FormRendererProps {
  formUuid: string;
  patientUuid: string;
  visit?: Visit;
  closeWorkspace: () => void;
  encounterUuid?: string;
  mode?: SessionMode;
}

const FormRenderer: React.FC<FormRendererProps> = ({
  formUuid,
  patientUuid,
  visit,
  closeWorkspace,
  encounterUuid,
  mode,
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
          onSubmit={() => closeWorkspace()}
          mode={mode}
        />
      )}
    </>
  );
};

export default FormRenderer;
