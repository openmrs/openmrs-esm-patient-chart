import React, { SyntheticEvent, useCallback, useEffect, useMemo, useState } from 'react';
import 'dayjs/plugin/utc';
import { useTranslation } from 'react-i18next';
import { BehaviorSubject } from 'rxjs';
import { Button, ButtonSet, Form, InlineLoading, InlineNotification } from '@carbon/react';
import { useLayoutType } from '@openmrs/esm-framework';
import { ConditionDataTableRow } from './conditions.resource';
import ConditionsWidget from './conditions-widget.component';
import styles from './conditions-form.scss';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface ConditionFormProps {
  closeWorkspace: () => void;
  condition?: ConditionDataTableRow;
  formContext: 'creating' | 'editing';
  patientUuid?: string;
}
const conditionSchema = z.object({
  clinicalStatus: z.string(),
  endDate: z.date().optional(),
  onsetDateTime: z.date().nullable(),
  search: z.string({ required_error: 'A condition is required' }),
});

export type ConditionFormData = z.infer<typeof conditionSchema>;

const ConditionsForm: React.FC<ConditionFormProps> = ({ closeWorkspace, condition, formContext, patientUuid }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const submissionNotifier = useMemo(() => new BehaviorSubject<{ isSubmitting: boolean }>({ isSubmitting: false }), []);
  const [hasSubmissibleValue, setHasSubmissibleValue] = useState(false);
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
      search: condition?.cells?.find((cell) => cell?.info?.header === 'display')?.value,
    },
    [errorCreating, errorUpdating, submissionNotifier],
  );

  return (
    <FormProvider {...methods}>
      <Form className={styles.form} onSubmit={methods.handleSubmit(onSubmit, onError)}>
        <ConditionsWidget
          patientUuid={patientUuid}
          closeWorkspace={closeWorkspace}
          conditionToEdit={condition}
          editing={formContext === 'editing' ? true : false}
          setErrorCreating={setErrorCreating}
          setErrorUpdating={setErrorUpdating}
          isSubmittingForm={isSubmittingForm}
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
            <Button className={styles.button} kind="secondary" onClick={() => closeWorkspace()}>
              {t('cancel', 'Cancel')}
            </Button>
            <Button className={styles.button} disabled={isSubmittingForm} kind="primary" type="submit">
              {isSubmittingForm ? (
                <InlineLoading description={t('saving', 'Saving') + '...'} />
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
