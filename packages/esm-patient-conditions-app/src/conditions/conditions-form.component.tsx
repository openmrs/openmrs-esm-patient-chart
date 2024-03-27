import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, FormProvider, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, ButtonSet, Form, InlineLoading, InlineNotification } from '@carbon/react';
import { useLayoutType } from '@openmrs/esm-framework';
import { type DefaultWorkspaceProps } from '@openmrs/esm-patient-common-lib';
import { type ConditionDataTableRow, useConditions } from './conditions.resource';
import ConditionsWidget from './conditions-widget.component';
import styles from './conditions-form.scss';

interface ConditionFormProps extends DefaultWorkspaceProps {
  condition?: ConditionDataTableRow;
  formContext: 'creating' | 'editing';
}

const schema = z.object({
  abatementDateTime: z.date().optional().nullable(),
  clinicalStatus: z.string(),
  conditionName: z.string({ required_error: 'A condition is required' }),
  onsetDateTime: z.date().nullable(),
});

export type ConditionSchema = z.infer<typeof schema>;

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
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [errorCreating, setErrorCreating] = useState(null);
  const [errorUpdating, setErrorUpdating] = useState(null);
  const matchingCondition = conditions?.find((c) => c?.id === condition?.id);

  const methods = useForm<ConditionSchema>({
    mode: 'all',
    resolver: zodResolver(schema),
    defaultValues: {
      abatementDateTime:
        formContext == 'editing'
          ? matchingCondition?.abatementDateTime
            ? new Date(matchingCondition?.abatementDateTime)
            : null
          : null,
      conditionName: '',
      clinicalStatus: condition?.cells?.find((cell) => cell?.info?.header === 'clinicalStatus')?.value ?? '',
      onsetDateTime:
        formContext == 'editing'
          ? matchingCondition?.onsetDateTime
            ? new Date(matchingCondition?.onsetDateTime)
            : null
          : null,
    },
  });

  const {
    setError,
    formState: { isDirty },
  } = methods;

  useEffect(() => {
    promptBeforeClosing(() => isDirty);
  }, [isDirty]);

  const onSubmit: SubmitHandler<ConditionSchema> = (payload) => {
    setIsSubmittingForm(true);

    if (formContext === 'creating') {
      if (!payload.conditionName.trim()) {
        setError('conditionName', {
          type: 'manual',
          message: t('conditionRequired', 'A condition is required'),
        });
      }
      if (!payload.clinicalStatus) {
        setError('clinicalStatus', {
          type: 'manual',
          message: t('clinicalStatusRequired', 'A clinical status is required'),
        });
      }
      setIsSubmittingForm(false);
    }

    setIsSubmittingForm(true);
  };

  const onError = (e) => {
    console.error('Error submitting condition: ', e);
    setIsSubmittingForm(false);
  };

  return (
    <FormProvider {...methods}>
      <Form className={styles.form} onSubmit={methods.handleSubmit(onSubmit, onError)}>
        <ConditionsWidget
          closeWorkspaceWithSavedChanges={closeWorkspaceWithSavedChanges}
          conditionToEdit={condition}
          editing={formContext === 'editing'}
          isSubmittingForm={isSubmittingForm}
          patientUuid={patientUuid}
          setErrorCreating={setErrorCreating}
          setErrorUpdating={setErrorUpdating}
          setIsSubmittingForm={setIsSubmittingForm}
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
            <Button className={styles.button} disabled={isSubmittingForm} kind="primary" type="submit">
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
