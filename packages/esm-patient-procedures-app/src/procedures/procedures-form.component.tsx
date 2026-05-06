import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import {
  Button,
  ButtonSet,
  ComboBox,
  ContentSwitcher,
  Form,
  FormGroup,
  InlineLoading,
  InlineNotification,
  Layer,
  NumberInput,
  Search,
  Select,
  SelectItem,
  Stack,
  Switch,
  TextArea,
  Tile,
} from '@carbon/react';
import { Controller, useFormContext } from 'react-hook-form';
import { ResponsiveWrapper, showSnackbar, useConfig, useLayoutType } from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';
import {
  saveProcedure,
  updateProcedure,
  useConceptSearchField,
  useMutatePatientProcedures,
  useProcedureTypes,
} from './procedures.resource';
import { type ProceduresFormSchema } from './procedures-form.workspace';
import { DateTimeField } from './date-time-field.component';
import styles from './procedures-form.scss';
import { type ProcedureType, type ConceptReference, type Procedure } from '../types';

interface ProceduresFormComponentProps {
  closeWorkspaceWithSavedChanges: () => void;
  isSubmittingForm: boolean;
  procedure?: Procedure;
  patientUuid: string;
}

interface ConceptSearchResultsProps {
  isSearching: boolean;
  onSelect: (result: ConceptReference) => void;
  searchResults: Array<ConceptReference>;
  selectedItem: ConceptReference;
  value: string;
}

const ProceduresFormComponent: React.FC<ProceduresFormComponentProps> = ({
  closeWorkspaceWithSavedChanges,
  patientUuid,
  procedure,
}) => {
  const { t } = useTranslation();
  const {
    procedureCodedConceptClassUuid,
    bodySiteConceptClassUuid,
    statusConceptClassUuid,
    durationUnitMinutesConceptUuid,
    durationUnitHoursConceptUuid,
    durationUnitDaysConceptUuid,
  } = useConfig<ConfigObject>();
  const mutate = useMutatePatientProcedures(patientUuid);

  const {
    handleSubmit,
    control,
    formState: { errors },
    getValues,
    setValue,
  } = useFormContext<ProceduresFormSchema>();

  const { procedureTypes, isLoading: isLoadingProcedureTypes } = useProcedureTypes();

  const isTablet = useLayoutType() === 'tablet';
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [isStartDateKnown, setIsStartDateKnown] = useState(!getValues('estimatedStartDate'));
  const initialEstimatedDate = getValues('estimatedStartDate');
  const [estimatedYear, setEstimatedYear] = useState(initialEstimatedDate?.split('-')[0] ?? '');
  const [estimatedMonth, setEstimatedMonth] = useState(initialEstimatedDate?.split('-')[1] ?? '');

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => String(currentYear - i));
  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const procedureField = useConceptSearchField(procedureCodedConceptClassUuid, getValues('procedureCoded'));
  const bodySiteField = useConceptSearchField(bodySiteConceptClassUuid, getValues('bodySite'));
  const statusField = useConceptSearchField(statusConceptClassUuid, getValues('status'));

  const [errorSaving, setErrorSaving] = useState(null);

  const handleSave = useCallback(async () => {
    const procedureType = getValues('procedureType');
    const startDateTime = getValues('startDateTime');
    const endDateTime = getValues('endDateTime');
    const notes = getValues('notes');
    const duration = getValues('duration');
    const durationUnit = getValues('durationUnit');

    let estimatedStartDate: string | undefined;
    if (!isStartDateKnown && estimatedYear) {
      estimatedStartDate = estimatedMonth ? `${estimatedYear}-${estimatedMonth}` : estimatedYear;
    }

    const hasDuration = typeof duration === 'number' && !Number.isNaN(duration);

    const payload = {
      patient: patientUuid,
      procedureCoded: procedureField.selectedConcept!.uuid,
      procedureType: procedureType,
      bodySite: bodySiteField.selectedConcept!.uuid,
      startDateTime: isStartDateKnown && startDateTime ? dayjs(startDateTime).format() : null,
      endDateTime: endDateTime ? dayjs(endDateTime).format() : null,
      status: statusField.selectedConcept?.uuid,
      notes: notes,
      estimatedStartDate: estimatedStartDate || null,
      duration: hasDuration ? duration : null,
      durationUnit: hasDuration && durationUnit ? durationUnit : null,
    };

    try {
      if (procedure?.uuid) {
        await updateProcedure(procedure.uuid, payload);
      } else {
        await saveProcedure(payload);
      }
      await mutate();
      showSnackbar({
        kind: 'success',
        title: t('procedureSaved', 'Procedure saved'),
        subtitle: t('procedureNowVisible', 'It is now visible on the Procedures page'),
      });
      closeWorkspaceWithSavedChanges();
    } catch (error) {
      setIsSubmittingForm(false);
      setErrorSaving(error);
    }
  }, [
    bodySiteField.selectedConcept,
    closeWorkspaceWithSavedChanges,
    estimatedMonth,
    estimatedYear,
    getValues,
    isStartDateKnown,
    mutate,
    patientUuid,
    procedureField.selectedConcept,
    statusField.selectedConcept,
    procedure?.uuid,
    t,
  ]);

  const onError = () => setIsSubmittingForm(false);

  return (
    <Form className={styles.form} onSubmit={handleSubmit(handleSave, onError)}>
      <div className={styles.formContainer}>
        <Stack gap={7}>
          <FormGroup legendText={<RequiredFieldLabel label={t('procedure', 'Procedure')} />}>
            <ConceptSearchField
              label={t('enterProcedure', 'Enter procedure')}
              placeholder={t('searchProcedures', 'Search procedures')}
              field={procedureField}
              onChange={(selectedConcept) => setValue('procedureCoded', selectedConcept.uuid)}
            />
            {errors.procedureCoded && <p className={styles.errorMessage}>{errors.procedureCoded.message}</p>}
          </FormGroup>

          <FormGroup legendText={<RequiredFieldLabel label={t('procedureType', 'Procedure type')} />}>
            {isLoadingProcedureTypes ? (
              <InlineLoading className={styles.loader} description={t('loading', 'Loading') + '...'} />
            ) : (
              <ResponsiveWrapper>
                <ComboBox
                  id="procedureType"
                  titleText=""
                  placeholder={t('selectProcedureType', 'Select procedure type')}
                  items={procedureTypes}
                  itemToString={(item: ProcedureType) => item?.name ?? ''}
                  initialSelectedItem={procedureTypes.find((pt) => pt.uuid === getValues('procedureType')) ?? null}
                  onChange={({ selectedItem }: { selectedItem: ProcedureType | null }) =>
                    setValue('procedureType', selectedItem.uuid)
                  }
                />
              </ResponsiveWrapper>
            )}
            {errors.procedureType && <p className={styles.errorMessage}>{errors.procedureType.message}</p>}
          </FormGroup>

          <FormGroup legendText={<RequiredFieldLabel label={t('bodySite', 'Body site')} />}>
            <ConceptSearchField
              label={t('enterBodySite', 'Enter body site')}
              placeholder={t('searchBodySites', 'Search body sites')}
              field={bodySiteField}
              onChange={(selectedConcept) => setValue('bodySite', selectedConcept.uuid)}
            />
            {errors.bodySite && <p className={styles.errorMessage}>{errors.bodySite.message}</p>}
          </FormGroup>
          <FormGroup legendText={t('isStartDateKnown', 'Is start date known?')}>
            <ContentSwitcher
              size="md"
              selectedIndex={isStartDateKnown ? 0 : 1}
              onChange={({ index }: { index: number }) => {
                setIsStartDateKnown(index === 0);
                setEstimatedYear('');
                setEstimatedMonth('');
              }}
            >
              <Switch name="yes">{t('yes', 'Yes')}</Switch>
              <Switch name="no">{t('no', 'No')}</Switch>
            </ContentSwitcher>
          </FormGroup>

          {isStartDateKnown && (
            <FormGroup legendText={t('startDateAndTime', 'Start date and time')}>
              <DateTimeField name="startDateTime" idPrefix="startDateTime" control={control} />
              {errors.startDateTime && <p className={styles.errorMessage}>{errors.startDateTime.message}</p>}
            </FormGroup>
          )}

          {!isStartDateKnown && (
            <FormGroup legendText={t('estimatedStartDate', 'Estimated start date')}>
              <ResponsiveWrapper>
                <Select
                  id="estimatedYear"
                  labelText={<RequiredFieldLabel label={t('year', 'Year')} />}
                  value={estimatedYear}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEstimatedYear(e.target.value)}
                >
                  <SelectItem value="" text={t('selectYear', 'Select year')} />
                  {years.map((year) => (
                    <SelectItem key={year} value={year} text={year} />
                  ))}
                </Select>
              </ResponsiveWrapper>
              <ResponsiveWrapper>
                <Select
                  id="estimatedMonth"
                  labelText={t('monthOptional', 'Month (optional)')}
                  value={estimatedMonth}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEstimatedMonth(e.target.value)}
                >
                  <SelectItem value="" text={t('selectMonth', 'Select month (optional)')} />
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value} text={month.label} />
                  ))}
                </Select>
              </ResponsiveWrapper>
            </FormGroup>
          )}

          <FormGroup legendText={t('endDateAndTime', 'End date and time')}>
            <DateTimeField name="endDateTime" idPrefix="endDateTime" control={control} />
            {errors.endDateTime && <p className={styles.errorMessage}>{errors.endDateTime.message}</p>}
          </FormGroup>

          <FormGroup legendText={t('duration', 'Duration')}>
            <div className={styles.durationFieldGroup}>
              <Controller
                name="duration"
                control={control}
                render={({ field: { onChange, value, ref, name } }) => (
                  <ResponsiveWrapper>
                    <NumberInput
                      id="duration"
                      name={name}
                      ref={ref}
                      label={t('durationValue', 'Duration')}
                      placeholder={t('enterDuration', 'Enter duration')}
                      min={1}
                      hideSteppers
                      allowEmpty
                      value={value ?? ''}
                      onChange={(_event, { value: nextValue }: { value: number | string }) => {
                        if (nextValue == null || nextValue === '') {
                          onChange(null);
                          return;
                        }
                        const parsed = typeof nextValue === 'number' ? nextValue : Number(nextValue);
                        onChange(Number.isNaN(parsed) ? null : parsed);
                      }}
                    />
                  </ResponsiveWrapper>
                )}
              />
              <Controller
                name="durationUnit"
                control={control}
                render={({ field }) => (
                  <ResponsiveWrapper>
                    <Select
                      id="durationUnit"
                      labelText={t('durationUnit', 'Duration unit')}
                      value={field.value ?? ''}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => field.onChange(e.target.value)}
                    >
                      <SelectItem value="" text={t('selectDurationUnit', 'Select unit')} />
                      <SelectItem value={durationUnitMinutesConceptUuid} text={t('minutes', 'Minutes')} />
                      <SelectItem value={durationUnitHoursConceptUuid} text={t('hours', 'Hours')} />
                      <SelectItem value={durationUnitDaysConceptUuid} text={t('days', 'Days')} />
                    </Select>
                  </ResponsiveWrapper>
                )}
              />
            </div>
            {errors.duration && <p className={styles.errorMessage}>{errors.duration.message}</p>}
            {errors.durationUnit && <p className={styles.errorMessage}>{errors.durationUnit.message}</p>}
          </FormGroup>

          <FormGroup legendText={<RequiredFieldLabel label={t('status', 'Status')} />}>
            <ConceptSearchField
              label={t('enterStatus', 'Enter status')}
              placeholder={t('searchStatus', 'Search status')}
              field={statusField}
              onChange={(selectedConcept) => setValue('status', selectedConcept.uuid)}
            />
            {errors.status && <p className={styles.errorMessage}>{errors.status.message}</p>}
          </FormGroup>

          <FormGroup legendText={t('notes', 'Notes')}>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <ResponsiveWrapper>
                  <TextArea
                    {...field}
                    id="notes"
                    labelText=""
                    placeholder={t('enterNotes', 'Enter notes (optional)')}
                  />
                </ResponsiveWrapper>
              )}
            />
            {errors.notes && <p className={styles.errorMessage}>{errors.notes.message}</p>}
          </FormGroup>
        </Stack>
      </div>
      <div>
        {errorSaving ? (
          <div className={styles.errorContainer}>
            <InlineNotification
              role="alert"
              kind="error"
              lowContrast
              title={t('errorSavingProcedure', 'Error saving procedure')}
              subtitle={errorSaving?.message}
            />
          </div>
        ) : null}
        <ButtonSet className={classNames({ [styles.tablet]: isTablet, [styles.desktop]: !isTablet })}>
          <Button className={styles.button} kind="secondary" onClick={() => closeWorkspaceWithSavedChanges()}>
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
  );
};

function RequiredFieldLabel({ label }: { label: string }) {
  const { t } = useTranslation();
  return (
    <span>
      {label}
      <span title={t('required', 'Required')} className={styles.required}>
        *
      </span>
    </span>
  );
}

function ConceptSearchField({
  label,
  placeholder,
  field,
  onChange,
}: {
  label: string;
  placeholder: string;
  field: ReturnType<typeof useConceptSearchField>;
  onChange: (selectedConcept: ConceptReference) => void;
}) {
  return (
    <>
      <ResponsiveWrapper>
        <Search
          labelText={label}
          placeholder={placeholder}
          onChange={(e) => field.setSearchTerm(e.target.value)}
          onClear={field.clear}
          value={field.selectedConcept ? field.selectedConcept.display : field.searchTerm}
        />
      </ResponsiveWrapper>

      <ConceptSearchResults
        isSearching={field.isSearching}
        searchResults={field.searchResults}
        selectedItem={field.selectedConcept}
        value={field.searchTerm}
        onSelect={(result) => {
          field.setSelectedConcept(result);
          field.setSearchTerm('');
          onChange(result);
        }}
      />
    </>
  );
}

function ConceptSearchResults({
  isSearching,
  onSelect,
  searchResults,
  selectedItem,
  value,
}: ConceptSearchResultsProps) {
  const { t } = useTranslation();

  if (!value || selectedItem) {
    return null;
  }

  if (isSearching) {
    return <InlineLoading className={styles.loader} description={t('searching', 'Searching') + '...'} />;
  }

  if (searchResults?.length > 0) {
    return (
      <ul className={styles.resultsList}>
        {searchResults.map((result) => (
          <li className={styles.resultItem} key={result.uuid} onClick={() => onSelect(result)} role="menuitem">
            {result.display}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <Layer>
      <Tile className={styles.emptyResults}>
        <span>
          {t('noResultsFor', 'No results for')} <strong>"{value}"</strong>
        </span>
      </Tile>
    </Layer>
  );
}

export default ProceduresFormComponent;
