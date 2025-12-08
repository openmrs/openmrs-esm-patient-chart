import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { InlineLoading } from '@carbon/react';
import { FormEngine } from '@openmrs/esm-form-engine-lib';
import { showModal, type Visit, type Encounter } from '@openmrs/esm-framework';
import { type FormRendererProps } from '@openmrs/esm-patient-common-lib';
import FormError from './form-error.component';
import useFormSchema from '../hooks/useFormSchema';
import styles from './form-renderer.scss';

/**
 * This component is a thin wrapper to load an O3 form from the server,
 * then display it using the React form engine
 *
 */
const FormRenderer: React.FC<FormRendererProps> = ({
  additionalProps,
  closeWorkspace,
  encounterUuid,
  formUuid,
  patientUuid,
  setHasUnsavedChanges,
  visit: visitRaw,
  visitUuid,
  hideControls,
  hidePatientBanner,
  handlePostResponse,
  preFilledQuestions,
}) => {
  const { t } = useTranslation();

  const { schema, error, isLoading } = useFormSchema(formUuid);
  const formSessionIntent = additionalProps?.formSessionIntent ?? '*';

  const handleCloseForm = useCallback(() => {
    closeWorkspace?.();
  }, [closeWorkspace]);

  const visit = useMemo(() => {
    if (visitRaw) {
      return visitRaw;
    }
    if (visitUuid) {
      return { uuid: visitUuid } as Visit;
    }
  }, [visitRaw, visitUuid]);

  const handleConfirmQuestionDeletion = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      const dispose = showModal('form-engine-delete-question-confirm-modal', {
        onCancel() {
          dispose();
          reject();
        },
        onConfirm() {
          dispose();
          resolve();
        },
      });
    });
  }, []);

  const handleOnSubmit = useCallback(
    (encounters?: Array<Encounter>) => {
      closeWorkspace({ closeWindow: true, discardUnsavedChanges: true });
      handlePostResponse?.(encounters[0]);
    },
    [closeWorkspace, handlePostResponse],
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
          handleConfirmQuestionDeletion={handleConfirmQuestionDeletion}
          markFormAsDirty={setHasUnsavedChanges}
          mode={additionalProps?.mode}
          formSessionIntent={formSessionIntent}
          onSubmit={handleOnSubmit}
          patientUUID={patientUuid}
          visit={visit}
          hideControls={hideControls}
          hidePatientBanner={hidePatientBanner}
          preFilledQuestions={preFilledQuestions}
        />
      )}
    </>
  );
};

export default FormRenderer;
