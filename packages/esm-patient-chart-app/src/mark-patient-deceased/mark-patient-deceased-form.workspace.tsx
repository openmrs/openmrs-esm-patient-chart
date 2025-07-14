import React, { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import fuzzy from 'fuzzy';
import { useTranslation } from 'react-i18next';
import {
  Button,
  ButtonSet,
  DatePickerSkeleton,
  Form,
  InlineLoading,
  RadioButton,
  RadioButtonGroup,
  Row,
  Search,
  StructuredListSkeleton,
  TextInput,
  Tile,
} from '@carbon/react';
import { Controller, useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { WarningFilled } from '@carbon/react/icons';
import { EmptyState, type DefaultPatientWorkspaceProps } from '@openmrs/esm-patient-common-lib';
import {
  ExtensionSlot,
  useLayoutType,
  showSnackbar,
  ResponsiveWrapper,
  useConfig,
  OpenmrsDatePicker,
} from '@openmrs/esm-framework';
import { markPatientDeceased, useCausesOfDeath } from '../data.resource';
import { type ChartConfig } from '../config-schema';
import styles from './mark-patient-deceased-form.scss';

const MarkPatientDeceasedForm: React.FC<DefaultPatientWorkspaceProps> = ({ closeWorkspace, patientUuid }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const memoizedPatientUuid = useMemo(() => ({ patientUuid }), [patientUuid]);
  const [searchTerm, setSearchTerm] = useState('');
  const { causesOfDeath, isLoading: isLoadingCausesOfDeath } = useCausesOfDeath();
  const { freeTextFieldConceptUuid } = useConfig<ChartConfig>();

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

  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value);
  };

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
    .refine((data) => !(data.causeOfDeath === freeTextFieldConceptUuid && !data.nonCodedCauseOfDeath), {
      message: t('nonCodedCauseOfDeathRequired', 'Please enter the non-coded cause of death'),
      path: ['nonCodedCauseOfDeath'],
    });

  type MarkPatientDeceasedFormSchema = z.infer<typeof schema>;

  const {
    control,
    formState: { errors, isSubmitting },
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
                  render={({ field, fieldState }) => (
                    <OpenmrsDatePicker
                      {...field}
                      className={styles.datePicker}
                      id="deceasedDate"
                      data-testid="deceasedDate"
                      labelText={t('date', 'Date')}
                      maxDate={new Date()}
                      invalid={Boolean(fieldState?.error?.message)}
                      invalidText={fieldState?.error?.message}
                    />
                  )}
                />
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
                    labelText={t('searchForCauseOfDeath', 'Search for a cause of death')}
                    onChange={handleSearchTermChange}
                    placeholder={t('searchForCauseOfDeath', 'Search for a cause of death')}
                  />
                </ResponsiveWrapper>
              ) : null}

              {causesOfDeath?.length && filteredCausesOfDeath.length > 0 ? (
                <Controller
                  name="causeOfDeath"
                  control={control}
                  render={({ field: { onChange } }) => (
                    <RadioButtonGroup
                      className={styles.radioButtonGroup}
                      name={
                        causeOfDeathValue === freeTextFieldConceptUuid
                          ? 'freeTextFieldCauseOfDeath'
                          : 'codedCauseOfDeath'
                      }
                      orientation="vertical"
                      onChange={onChange}
                    >
                      {filteredCausesOfDeath.map(({ uuid, display, name }) => (
                        <RadioButton
                          className={styles.radioButton}
                          id={name}
                          key={uuid}
                          labelText={display}
                          value={uuid}
                        />
                      ))}
                    </RadioButtonGroup>
                  )}
                />
              ) : null}

              {searchTerm && filteredCausesOfDeath.length === 0 && (
                <div className={styles.tileContainer}>
                  <Tile className={styles.tile}>
                    <div className={styles.tileContent}>
                      <p className={styles.content}>
                        {t('noMatchingCodedCausesOfDeath', 'No matching coded causes of death')}
                      </p>
                      <p className={styles.helper}>{t('checkFilters', 'Check the filters above')}</p>
                    </div>
                  </Tile>
                </div>
              )}

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
        {causeOfDeathValue === freeTextFieldConceptUuid && (
          <div className={styles.nonCodedCauseOfDeath}>
            <Controller
              name="nonCodedCauseOfDeath"
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  id="freeTextCauseOfDeath"
                  invalid={!!errors?.nonCodedCauseOfDeath}
                  invalidText={errors?.nonCodedCauseOfDeath?.message}
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
        <Button className={styles.button} kind="secondary" onClick={() => closeWorkspace()}>
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
