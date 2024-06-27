import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, FormProvider, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, ButtonSet, Form, InlineLoading, InlineNotification } from '@carbon/react';
import { useLayoutType } from '@openmrs/esm-framework';
import { type DefaultPatientWorkspaceProps } from '@openmrs/esm-patient-common-lib';
import { type ConditionDataTableRow, useConditions } from './conditions.resource';
import ConditionsWidget from './conditions-widget.component';
import styles from './conditions-form.scss';

interface ConditionFormProps extends DefaultPatientWorkspaceProps {
  condition?: ConditionDataTableRow;
  formContext: 'creating' | 'editing';
}

const ConditionsForm: React.FC<ConditionFormProps> = ({
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  condition,
  formContext,
  patientUuid,
  promptBeforeClosing,
}) => {
  const { t } = useTranslation();

  const schema = z.object({
    abatementDateTime: z.date().optional().nullable(),
    clinicalStatus: z.string().refine((clinicalStatus) => formContext !== 'creating' || !!clinicalStatus, {
      message: t('clinicalStatusRequired', 'A clinical status is required'),
    }),
    conditionName: z.string().refine((conditionName) => formContext !== 'creating' || !!conditionName, {
      message: t('conditionRequired', 'A condition is required'),
    }),
    onsetDateTime: z.date().nullable(),
  });

  const isTablet = useLayoutType() === 'tablet';
  const { conditions } = useConditions(patientUuid);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [errorCreating, setErrorCreating] = useState(null);
  const [errorUpdating, setErrorUpdating] = useState(null);

  const matchingCondition = conditions?.find((c) => c?.id === condition?.id);

  const methods = useForm<z.infer<typeof schema>>({
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
      clinicalStatus: formContext === 'editing' ? matchingCondition?.clinicalStatus?.toLowerCase() : '',
      onsetDateTime:
        formContext == 'editing'
          ? matchingCondition?.onsetDateTime
            ? new Date(matchingCondition?.onsetDateTime)
            : null
          : null,
    },
  });

  const {
    formState: { isDirty },
  } = methods;

  useEffect(() => {
    promptBeforeClosing(() => isDirty);
  }, [isDirty, promptBeforeClosing]);

  const onSubmit: SubmitHandler<z.infer<typeof schema>> = () => {
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
          schema={schema}
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
