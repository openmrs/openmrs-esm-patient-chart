import React, { SyntheticEvent, useCallback, useEffect, useMemo, useState } from 'react';
import 'dayjs/plugin/utc';
import { useTranslation } from 'react-i18next';
import { BehaviorSubject } from 'rxjs';
import { Button, ButtonSet, Form, InlineLoading, InlineNotification } from '@carbon/react';
import { useLayoutType } from '@openmrs/esm-framework';
import { ConditionDataTableRow } from './conditions.resource';
import ConditionsWidget from './conditions-widget.component';
import styles from './conditions-form.scss';

interface ConditionFormProps {
  closeWorkspace: () => void;
  condition?: ConditionDataTableRow;
  formContext: 'creating' | 'editing';
  patientUuid?: string;
}

const ConditionsForm: React.FC<ConditionFormProps> = ({ closeWorkspace, condition, formContext, patientUuid }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const submissionNotifier = useMemo(() => new BehaviorSubject<{ isSubmitting: boolean }>({ isSubmitting: false }), []);
  const [hasSubmissibleValue, setHasSubmissibleValue] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [errorCreating, setErrorCreating] = useState(null);
  const [errorUpdating, setErrorUpdating] = useState(null);

  useEffect(() => {
    const subscription = submissionNotifier.pipe().subscribe(({ isSubmitting }) => setIsSubmittingForm(isSubmitting));

    return () => subscription.unsubscribe();
  }, [submissionNotifier]);

  const handleSubmit = useCallback(
    (event: SyntheticEvent<HTMLFormElement>) => {
      event.preventDefault();

      submissionNotifier.next({ isSubmitting: true });

      if (!!errorCreating || !!errorUpdating) {
        submissionNotifier.next({ isSubmitting: false });
      }
    },
    [errorCreating, errorUpdating, submissionNotifier],
  );

  return (
    <Form className={styles.form} onSubmit={handleSubmit}>
      <ConditionsWidget
        patientUuid={patientUuid}
        closeWorkspace={closeWorkspace}
        conditionToEdit={condition}
        formContext={formContext}
        setErrorCreating={setErrorCreating}
        setErrorUpdating={setErrorUpdating}
        setHasSubmissibleValue={setHasSubmissibleValue}
        submissionNotifier={submissionNotifier}
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
          <Button
            className={styles.button}
            disabled={!hasSubmissibleValue || (hasSubmissibleValue && isSubmittingForm)}
            kind="primary"
            type="submit"
          >
            {isSubmittingForm ? (
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

export default ConditionsForm;
