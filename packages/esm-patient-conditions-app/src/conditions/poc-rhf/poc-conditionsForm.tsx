import React, { useCallback, useEffect, useMemo, useState } from 'react';
import 'dayjs/plugin/utc';
import { useTranslation } from 'react-i18next';
import { BehaviorSubject } from 'rxjs';
import { Button, ButtonSet, Form, InlineLoading, InlineNotification } from '@carbon/react';
import { useLayoutType } from '@openmrs/esm-framework';
import { ConditionDataTableRow } from '../conditions.resource';
import styles from './conditions-form.scss';
import { useForm, SubmitHandler } from 'react-hook-form';
import { IFormValues } from './poc-type';
import PocConditionsWidget from './poc-conditionsWidget';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

interface ConditionFormProps {
  closeWorkspace: () => void;
  condition?: ConditionDataTableRow;
  formContext: 'creating' | 'editing';
  patientUuid?: string;
}

const PocConditionsForm: React.FC<ConditionFormProps> = ({ closeWorkspace, condition, formContext, patientUuid }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const submissionNotifier = useMemo(() => new BehaviorSubject<{ isSubmitting: boolean }>({ isSubmitting: false }), []);
  const [hasSubmissibleValue, setHasSubmissibleValue] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [errorCreating, setErrorCreating] = useState(null);
  const [errorUpdating, setErrorUpdating] = useState(null);

  const validation = z.object({
    onsetdate: z
      .string()
      .refine((date) => new Date(date).toString() !== 'Invalid Date', {
        message: 'A valid date is required',
      })
      .transform((date) => new Date(date)),
    status: z.enum(['active', 'inactive'], {
      errorMap: () => ({
        message: 'Please select a value',
      }),
    }),
    enddate: z
      .string()
      .refine((date) => new Date(date).toString() !== 'Invalid Date', {
        message: 'A valid date is required',
      })
      .transform((date) => new Date(date)),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IFormValues>({
    resolver: zodResolver(validation),
  });

  useEffect(() => {
    const subscription = submissionNotifier.pipe().subscribe(({ isSubmitting }) => setIsSubmittingForm(isSubmitting));

    return () => subscription.unsubscribe();
  }, [submissionNotifier]);

  const onSubmit: SubmitHandler<IFormValues> = useCallback((data) => {
    // eslint-disable-next-line no-console
    console.log(data);
  }, []);
  return (
    <Form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <PocConditionsWidget
        patientUuid={patientUuid}
        closeWorkspace={closeWorkspace}
        conditionToEdit={condition}
        formContext={formContext}
        setErrorCreating={setErrorCreating}
        setErrorUpdating={setErrorUpdating}
        setHasSubmissibleValue={setHasSubmissibleValue}
        submissionNotifier={submissionNotifier}
        register={register}
        onsetdate="onsetdate"
        status="status"
        enddate="enddate"
        errors={errors}
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
          <Button className={styles.button} kind="secondary" onClick={() => closeWorkspace()}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button className={styles.button} disabled={isSubmitting} kind="primary" type="submit">
            {isSubmitting ? (
              <InlineLoading description={t('saving', 'Saving') + '...'} />
            ) : (
              <span>{t('saveAndClose', 'Save & close')}</span>
            )}
          </Button>
        </ButtonSet>
      </div>
    </Form>
  );
};

export default PocConditionsForm;
