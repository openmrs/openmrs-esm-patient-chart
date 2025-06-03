import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { InlineLoading } from '@carbon/react';
import { FormEngine } from '@openmrs/esm-form-engine-lib';
import { showModal, type Visit } from '@openmrs/esm-framework';
import {
  clinicalFormsWorkspace,
  type DefaultPatientWorkspaceProps,
  launchPatientWorkspace,
} from '@openmrs/esm-patient-common-lib';
import FormError from './form-error.component';
import useFormSchema from '../hooks/useFormSchema';
import styles from './form-renderer.scss';

interface FormRendererProps
  extends Omit<
    DefaultPatientWorkspaceProps,
    'closeWorkspace' | 'promptBeforeClosing' | 'closeWorkspaceWithSavedChanges' | 'setTitle'
  > {
  additionalProps?: Record<string, any>;
  encounterUuid?: string;
  formUuid: string;
  patientUuid: string;
  visit?: Visit;
  clinicalFormsWorkspaceName?: string;
  /**
   * These workspace control props are made optional to support usage in non-workspace contexts,
   * such as the Fast Data Entry app or other standalone form zones.
   */
  closeWorkspace?: DefaultPatientWorkspaceProps['closeWorkspace'];
  promptBeforeClosing?: DefaultPatientWorkspaceProps['promptBeforeClosing'];
  closeWorkspaceWithSavedChanges?: DefaultPatientWorkspaceProps['closeWorkspaceWithSavedChanges'];
  setTitle?: DefaultPatientWorkspaceProps['setTitle'];
  isSubmissionTriggeredExternally?: boolean;
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
  clinicalFormsWorkspaceName = clinicalFormsWorkspace,
  isSubmissionTriggeredExternally,
}) => {
  const { t } = useTranslation();
  const { schema, error, isLoading } = useFormSchema(formUuid);
  const openClinicalFormsWorkspaceOnFormClose = additionalProps?.openClinicalFormsWorkspaceOnFormClose ?? true;
  const formSessionIntent = additionalProps?.formSessionIntent ?? '*';

  const handleCloseForm = useCallback(() => {
    closeWorkspace?.();
    !encounterUuid && openClinicalFormsWorkspaceOnFormClose && launchPatientWorkspace(clinicalFormsWorkspaceName);
  }, [closeWorkspace, encounterUuid, openClinicalFormsWorkspaceOnFormClose, clinicalFormsWorkspaceName]);

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

  const handleMarkFormAsDirty = useCallback(
    (isDirty: boolean) => promptBeforeClosing?.(() => isDirty),
    [promptBeforeClosing],
  );

  const handleOnSubmit = () => {
    closeWorkspaceWithSavedChanges?.();
  };

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
          markFormAsDirty={handleMarkFormAsDirty}
          mode={additionalProps?.mode}
          formSessionIntent={formSessionIntent}
          onSubmit={handleOnSubmit}
          patientUUID={patientUuid}
          visit={visit}
          isSubmissionTriggeredExternally={isSubmissionTriggeredExternally}
        />
      )}
    </>
  );
};

export default FormRenderer;
