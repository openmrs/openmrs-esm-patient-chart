import React, { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { useForm, FormProvider, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, ButtonSet, Form, InlineLoading, InlineNotification } from '@carbon/react';
import { ExtensionSlot, useLayoutType, Workspace2 } from '@openmrs/esm-framework';
import { type PatientWorkspace2DefinitionProps } from '@openmrs/esm-patient-common-lib';
import { type Condition, useConditions, useCondition } from './conditions.resource';
import ConditionsWidget from './conditions-widget.component';
import styles from './conditions-form.scss';

export interface ConditionFormProps {
  condition?: Condition;
  formContext: 'creating' | 'editing';
}

const createSchema = (formContext: 'creating' | 'editing', t: TFunction) => {
  const isCreating = formContext === 'creating';

  const clinicalStatusValidation = z.string().refine((clinicalStatus) => !isCreating || !!clinicalStatus, {
    message: t('clinicalStatusRequired', 'A clinical status is required'),
  });

  const conditionUuidValidation = z.string().refine((conditionUuid) => !isCreating || !!conditionUuid, {
    message: t('conditionRequired', 'A condition is required'),
  });

  return z.object({
    abatementDateTime: z.date().optional().nullable(),
    clinicalStatus: clinicalStatusValidation,
    conditionName: z.string(),
    conditionUuid: conditionUuidValidation,
    onsetDateTime: z
      .date()
      .nullable()
      .refine((onsetDateTime) => onsetDateTime <= new Date(), {
        message: t('onsetDateCannotBeInTheFuture', 'Onset date cannot be in the future'),
      }),
  });
};

export type ConditionsFormSchema = z.infer<ReturnType<typeof createSchema>>;

const ConditionsForm: React.FC<PatientWorkspace2DefinitionProps<ConditionFormProps, {}>> = ({
  closeWorkspace,
  groupProps: { patient, patientUuid },
  workspaceProps: { condition, formContext },
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { conditions } = useConditions(patientUuid);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [errorCreating, setErrorCreating] = useState(null);
  const [errorUpdating, setErrorUpdating] = useState(null);
  const isEditing = formContext === 'editing';

  const {
    condition: loadedCondition,
    error: errorLoadingCondition,
    isLoading: isLoadingCondition,
    mutate: retryLoadCondition,
  } = useCondition(isEditing && condition?.id ? condition.id : undefined);

  const activeCondition = loadedCondition ?? condition;

  const isConflict =
    errorUpdating?.status === 412 ||
    errorUpdating?.status === 409 ||
    errorUpdating?.response?.status === 412 ||
    errorUpdating?.response?.status === 409;

  const matchingCondition = conditions?.find((c) => c?.id === activeCondition?.id);

  const schema = createSchema(formContext, t);

  const defaultValues = {
    abatementDateTime:
      isEditing && (activeCondition?.abatementDateTime ?? matchingCondition?.abatementDateTime)
        ? new Date(activeCondition?.abatementDateTime ?? matchingCondition?.abatementDateTime)
        : null,
    conditionName: '',
    conditionUuid: '',
    clinicalStatus: isEditing
      ? (activeCondition?.clinicalStatus ?? matchingCondition?.clinicalStatus)?.toLowerCase() ?? ''
      : 'active',
    onsetDateTime:
      isEditing && (activeCondition?.onsetDateTime ?? matchingCondition?.onsetDateTime)
        ? new Date(activeCondition?.onsetDateTime ?? matchingCondition?.onsetDateTime)
        : null,
  };

  const methods = useForm<ConditionsFormSchema>({
    mode: 'onSubmit',
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    if (isEditing && loadedCondition) {
      methods.reset({
        abatementDateTime: loadedCondition.abatementDateTime ? new Date(loadedCondition.abatementDateTime) : null,
        conditionName: loadedCondition.display ?? '',
        conditionUuid: loadedCondition.conceptId ?? '',
        clinicalStatus: loadedCondition.clinicalStatus?.toLowerCase() ?? '',
        onsetDateTime: loadedCondition.onsetDateTime ? new Date(loadedCondition.onsetDateTime) : null,
      });
    }
  }, [isEditing, loadedCondition, methods]);

  const {
    formState: { isDirty },
  } = methods;

  const onSubmit: SubmitHandler<ConditionsFormSchema> = () => {
    setIsSubmittingForm(true);
  };

  const onError = () => setIsSubmittingForm(false);

  const closeWorkspaceWithSavedChanges = useCallback(() => {
    closeWorkspace({ discardUnsavedChanges: true });
  }, [closeWorkspace]);

  return (
    <Workspace2
      title={isEditing ? t('editCondition', 'Edit condition') : t('recordCondition', 'Record condition')}
      hasUnsavedChanges={isDirty}
    >
      {isTablet && patient && patientUuid && (
        <ExtensionSlot name="patient-header-slot" state={{ patient, patientUuid, hideActionsOverflow: true }} />
      )}
      <FormProvider {...methods}>
        <Form className={styles.form} onSubmit={methods.handleSubmit(onSubmit, onError)}>
          <ConditionsWidget
            closeWorkspaceWithSavedChanges={closeWorkspaceWithSavedChanges}
            conditionToEdit={activeCondition}
            isEditing={isEditing}
            isSubmittingForm={isSubmittingForm}
            patientUuid={patientUuid}
            setErrorCreating={setErrorCreating}
            setErrorUpdating={setErrorUpdating}
            setIsSubmittingForm={setIsSubmittingForm}
          />
          <div>
            {isEditing && isLoadingCondition ? (
              <div className={styles.loader}>
                <InlineLoading description={t('loadingCondition', 'Loading condition details...')} />
              </div>
            ) : null}
            {isEditing && errorLoadingCondition ? (
              <div className={styles.errorContainer}>
                <InlineNotification
                  className={styles.error}
                  role="alert"
                  kind="error"
                  lowContrast
                  title={t('errorLoadingCondition', 'Error loading condition details')}
                  subtitle={errorLoadingCondition?.message}
                />
                <Button kind="ghost" size="sm" onClick={() => retryLoadCondition()}>
                  {t('retry', 'Retry')}
                </Button>
              </div>
            ) : null}
            {errorCreating ? (
              <div className={styles.errorContainer}>
                <InlineNotification
                  className={styles.error}
                  role="alert"
                  kind="error"
                  lowContrast
                  title={t('errorCreatingCondition', 'Error creating condition')}
                  subtitle={errorCreating?.message}
                />
              </div>
            ) : null}
            {errorUpdating ? (
              <div className={styles.errorContainer}>
                <InlineNotification
                  className={styles.error}
                  role="alert"
                  kind="error"
                  lowContrast
                  title={
                    isConflict
                      ? t('conditionConflict', 'Condition update conflict')
                      : t('errorUpdatingCondition', 'Error updating condition')
                  }
                  subtitle={
                    isConflict
                      ? t(
                          'conditionConflictMessage',
                          'This condition was changed by someone else. Reload to see the latest version',
                        )
                      : errorUpdating?.message
                  }
                />
              </div>
            ) : null}
            <ButtonSet className={classNames({ [styles.tablet]: isTablet, [styles.desktop]: !isTablet })}>
              <Button className={styles.button} kind="secondary" onClick={() => closeWorkspace()}>
                {t('cancel', 'Cancel')}
              </Button>
              <Button
                className={styles.button}
                disabled={
                  isSubmittingForm || (isEditing && isLoadingCondition) || (isEditing && Boolean(errorLoadingCondition))
                }
                kind="primary"
                type="submit"
              >
                {isSubmittingForm ? (
                  <InlineLoading className={styles.spinner} description={t('saving', 'Saving') + '...'} />
                ) : (
                  <span>{t('saveAndClose', 'Save & close')}</span>
                )}
              </Button>
            </ButtonSet>
          </div>
        </Form>
      </FormProvider>
    </Workspace2>
  );
};

export default ConditionsForm;
