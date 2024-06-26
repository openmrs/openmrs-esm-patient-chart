import React, { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import fuzzy from 'fuzzy';
import { useTranslation } from 'react-i18next';
import {
  Button,
  ButtonSet,
  DatePicker,
  DatePickerInput,
  DatePickerSkeleton,
  Form,
  InlineLoading,
  RadioButton,
  RadioButtonGroup,
  Row,
  Search,
  StructuredListSkeleton,
  TextInput,
} from '@carbon/react';
import { Controller, useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { WarningFilled } from '@carbon/react/icons';
import { EmptyState, type DefaultPatientWorkspaceProps } from '@openmrs/esm-patient-common-lib';
import { ExtensionSlot, useLayoutType, showSnackbar, ResponsiveWrapper } from '@openmrs/esm-framework';
import { markPatientDeceased, useCausesOfDeath } from '../data.resource';
import styles from './mark-patient-deceased-form.scss';

const MarkPatientDeceasedForm: React.FC<DefaultPatientWorkspaceProps> = ({ closeWorkspace, patientUuid }) => {
  const freetextCauseOfDeathUuid = '5622AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
  const isTablet = useLayoutType() === 'tablet';
  const { t } = useTranslation();
  const memoizedPatientUuid = useMemo(() => ({ patientUuid }), [patientUuid]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { causesOfDeath, isLoading: isLoadingCausesOfDeath } = useCausesOfDeath();

  const filteredCausesOfDeath = useMemo(() => {
    if (!searchTerm) {
      return causesOfDeath;
    }
    return searchTerm
      ? fuzzy
          .filter(searchTerm, causesOfDeath, {
            extract: (causeOfDeathConcept) => causeOfDeathConcept.display,
          })
          .sort((r1, r2) => r1.score - r2.score)
          .map((result) => result.original)
      : causesOfDeath;
  }, [searchTerm, causesOfDeath]);

  const schema = z
    .object({
      causeOfDeath: z.string().refine((causeOfDeath) => !!causeOfDeath, {
        message: t('causeOfDeathIsRequired', 'Please select the cause of death'),
      }),
      deathDate: z.date().refine((date) => !!date, {
        message: t('deathDateRequired', 'Please select the date of death'),
      }),
      nonCodedCauseOfDeath: z.string().optional(),
    })
    .refine((data) => !(data.causeOfDeath === freetextCauseOfDeathUuid && !data.nonCodedCauseOfDeath), {
      message: t('nonCodedCauseOfDeathRequired', 'Please enter the non-coded cause of death'),
      path: ['nonCodedCauseOfDeath'],
    });

  type MarkPatientDeceasedFormSchema = z.infer<typeof schema>;

  const {
    control,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm<MarkPatientDeceasedFormSchema>({
    mode: 'onSubmit',
    resolver: zodResolver(schema),
    defaultValues: {
      causeOfDeath: '',
      deathDate: new Date(),
      nonCodedCauseOfDeath: '',
    },
  });

  const causeOfDeathValue = watch('causeOfDeath');

  const onSubmit: SubmitHandler<MarkPatientDeceasedFormSchema> = useCallback(
    (data) => {
      setIsSubmitting(true);
      const { causeOfDeath, deathDate, nonCodedCauseOfDeath } = data;

      markPatientDeceased(deathDate, patientUuid, causeOfDeath, nonCodedCauseOfDeath)
        .then(() => {
          closeWorkspace();
          window.location.reload();
        })
        .catch((error) => {
          showSnackbar({
            kind: 'error',
            isLowContrast: false,
            subtitle: error?.message,
            title: t('errorMarkingPatientDeceased', 'Error marking patient deceased'),
          });
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    },
    [closeWorkspace, patientUuid, t],
  );

  const onError = (errors) => console.error(errors);

  return (
    <Form className={styles.form} onSubmit={handleSubmit(onSubmit, onError)}>
      <div>
        {isTablet && (
          <Row className={styles.headerGridRow}>
            <ExtensionSlot className={styles.dataGridRow} name="visit-form-header-slot" state={memoizedPatientUuid} />
          </Row>
        )}
        <div className={styles.container}>
          <span className={styles.warningContainer}>
            <WarningFilled aria-label={t('warning', 'Warning')} className={styles.warningIcon} size={20} />
            <span className={styles.warningText}>
              {t('markDeceasedWarning', 'Marking the patient as deceased will end any active visits for this patient')}
            </span>
          </span>
          <section>
            <div className={styles.sectionTitle}>{t('dateOfDeath', 'Date of death')}</div>
            {causesOfDeath?.length ? (
              <ResponsiveWrapper>
                <Controller
                  name="deathDate"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <DatePicker
                      className={styles.datePicker}
                      dateFormat="d/m/Y"
                      datePickerType="single"
                      id="deceasedDate"
                      maxDate={new Date().toISOString()}
                      onChange={([date]) => onChange(date)}
                      value={value}
                    >
                      <DatePickerInput
                        id="deceasedDateInput"
                        labelText={t('date', 'Date')}
                        placeholder="dd/mm/yyyy"
                        style={{ width: '100%' }}
                      />
                    </DatePicker>
                  )}
                />
                {errors?.deathDate && <p className={styles.errorMessage}>{errors?.deathDate?.message}</p>}
              </ResponsiveWrapper>
            ) : (
              <DatePickerSkeleton />
            )}
          </section>
          <section>
            <div className={styles.sectionTitle}>{t('causeOfDeath', 'Cause of death')}</div>
            <div
              className={classNames(styles.conceptAnswerOverviewWrapper, {
                [styles.conceptAnswerOverviewWrapperTablet]: isTablet,
                [styles.conceptAnswerOverviewWrapperDesktop]: !isTablet,
                [styles.errorOutline]: errors?.causeOfDeath?.message,
              })}
            >
              {isLoadingCausesOfDeath ? <StructuredListSkeleton /> : null}

              {causesOfDeath?.length ? (
                <ResponsiveWrapper>
                  <Search
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder={t('searchForCauseOfDeath', 'Search for a cause of death')}
                    labelText=""
                  />
                </ResponsiveWrapper>
              ) : null}

              {causesOfDeath?.length ? (
                <Controller
                  name="causeOfDeath"
                  control={control}
                  render={({ field: { onChange } }) => (
                    <RadioButtonGroup className={styles.radioButtonGroup} orientation="vertical" onChange={onChange}>
                      {(filteredCausesOfDeath ? filteredCausesOfDeath : causesOfDeath).map(
                        ({ uuid, display, name }) => (
                          <RadioButton
                            key={uuid}
                            className={styles.radioButton}
                            id={name}
                            labelText={display}
                            value={uuid}
                          />
                        ),
                      )}
                    </RadioButtonGroup>
                  )}
                />
              ) : null}

              {!isLoadingCausesOfDeath && !causesOfDeath?.length ? (
                <EmptyState
                  displayText={t('causeOfDeath_lower', 'cause of death concepts configured in the system')}
                  headerTitle={t('causeOfDeath', 'Cause of death')}
                />
              ) : null}
            </div>
            {errors?.causeOfDeath && <p className={styles.errorMessage}>{errors?.causeOfDeath?.message}</p>}
          </section>
        </div>
        {causeOfDeathValue === freetextCauseOfDeathUuid && (
          <div className={styles.nonCodedCauseOfDeath}>
            <Controller
              name="nonCodedCauseOfDeath"
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  id="freeTextCauseOfDeath"
                  invalid={errors?.nonCodedCauseOfDeath}
                  invalidText={errors?.nonCodedCauseOfDeath && errors?.nonCodedCauseOfDeath?.message}
                  labelText={t('nonCodedCauseOfDeath', 'Non-coded cause of death')}
                  onChange={onChange}
                  placeholder={t('enterNonCodedCauseOfDeath', 'Enter non-coded cause of death')}
                  value={value}
                />
              )}
            />
          </div>
        )}
      </div>
      <ButtonSet className={classNames({ [styles.tablet]: isTablet, [styles.desktop]: !isTablet })}>
        <Button className={styles.button} kind="secondary" onClick={closeWorkspace}>
          {t('discard', 'Discard')}
        </Button>
        <Button className={styles.button} disabled={isSubmitting} kind="primary" type="submit">
          {isSubmitting ? (
            <InlineLoading description={t('saving', 'Saving') + '...'} role="progressbar" />
          ) : (
            t('saveAndClose', 'Save and close')
          )}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default MarkPatientDeceasedForm;
