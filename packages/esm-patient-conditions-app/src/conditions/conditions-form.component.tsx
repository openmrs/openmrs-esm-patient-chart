import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, FormProvider, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, ButtonSet, Form, InlineLoading, InlineNotification } from '@carbon/react';
import { useLayoutType } from '@openmrs/esm-framework';
import { type ConditionDataTableRow, useConditions } from './conditions.resource';
import ConditionsWidget from './conditions-widget.component';
import styles from './conditions-form.scss';
import { type DefaultWorkspaceProps } from '@openmrs/esm-patient-common-lib';

interface ConditionFormProps extends DefaultWorkspaceProps {
  condition?: ConditionDataTableRow;
  formContext: 'creating' | 'editing';
}

const conditionSchema = z.object({
  clinicalStatus: z.string(),
  endDate: z.date().optional(),
  onsetDateTime: z.date().nullable(),
  search: z.string({ required_error: 'A condition is required' }),
});

export type ConditionFormData = z.infer<typeof conditionSchema>;

const ConditionsForm: React.FC<ConditionFormProps> = ({
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  condition,
  formContext,
  patientUuid,
  promptBeforeClosing,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { conditions } = useConditions(patientUuid);
  const matchingCondition = conditions?.find((c) => c?.id === condition?.id);

  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [errorCreating, setErrorCreating] = useState(null);
  const [errorUpdating, setErrorUpdating] = useState(null);

  const methods = useForm<ConditionFormData>({
    mode: 'all',
    resolver: zodResolver(conditionSchema),
    defaultValues: {
      onsetDateTime:
        formContext == 'editing'
          ? matchingCondition?.onsetDateTime
            ? new Date(matchingCondition?.onsetDateTime)
            : null
          : null,
      clinicalStatus: condition?.cells?.find((cell) => cell?.info?.header === 'clinicalStatus')?.value ?? 'Active',
      search: '',
    },
  });

  const {
    formState: { isDirty },
  } = methods;

  useEffect(() => {
    promptBeforeClosing(() => isDirty);
  }, [isDirty]);

  
  const onSubmit: SubmitHandler<ConditionFormData> = (data) => {
    if (data.search) {
      setIsSubmittingForm(methods.formState.isSubmitting);
    }
  };

  const onError = (error) => {
    console.error(error);
  };

  return (
    <FormProvider {...methods}>
      <Form className={styles.form} onSubmit={methods.handleSubmit(onSubmit, onError)}>
        <ConditionsWidget
          patientUuid={patientUuid}
          closeWorkspaceWithSavedChanges={closeWorkspaceWithSavedChanges}
          conditionToEdit={condition}
          editing={formContext === 'editing'}
          setErrorCreating={setErrorCreating}
          setErrorUpdating={setErrorUpdating}
          isSubmittingForm={isSubmittingForm}
          setIsSubmittingForm={setIsSubmittingForm}
          register={methods.register}
        />
        <div>
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
                title={t('errorUpdatingCondition', 'Error updating condition')}
                subtitle={errorUpdating?.message}
              />
            </div>
          ) : null}
          <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
            <Button className={styles.button} kind="secondary" onClick={closeWorkspace}>
              {t('cancel', 'Cancel')}
            </Button>
            <Button
              className={styles.button}
              disabled={methods.formState.isSubmitting || isSubmittingForm || !methods.formState.isDirty}
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
  );
};

export default ConditionsForm;
