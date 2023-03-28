import React, { useMemo } from 'react';
import { InlineLoading, InlineNotification } from '@carbon/react';
import { ExtensionSlot } from '@openmrs/esm-framework';
import useSchema from '../hooks/use-schema';
import { CompletedFormInfo } from '../types';
import styles from './ohri-forms.scss';
import { useTranslation } from 'react-i18next';

interface OHRIFormsProps {
  patientUuid: string;
  completedFormInfo: CompletedFormInfo;
  closeWorkspace: () => void;
}

const OHRIForms: React.FC<OHRIFormsProps> = ({ patientUuid, completedFormInfo, closeWorkspace }) => {
  const { t } = useTranslation();
  const { form } = completedFormInfo;
  const valueReferenceUuid = form.resources.find((resource) => resource.name === 'JSON schema')?.valueReference ?? '';
  const { schema, isLoading, error } = useSchema(valueReferenceUuid);

  const state = useMemo(
    () => ({
      patientUUID: patientUuid,
      mode: 'enter',
      formJson: schema,
      onCancel: closeWorkspace,
    }),
    [closeWorkspace, patientUuid, schema],
  );

  if (isLoading) {
    <InlineLoading className={styles.loading} description={`${t('loading', 'Loading')} ...`} />;
  }

  if (error) {
    return (
      <InlineNotification
        title={t('formSchemaError', 'Form Schema error')}
        subtitle={t(error)}
        onClose={closeWorkspace}
        className={styles.error}
      />
    );
  }

  return <ExtensionSlot extensionSlotName="ohri-form-engine-slot" state={state} />;
};

export default OHRIForms;
