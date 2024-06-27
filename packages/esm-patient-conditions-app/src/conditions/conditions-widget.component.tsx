import React, { type Dispatch, useCallback, useEffect, useRef, useState } from 'react';
import { type TFunction, useTranslation } from 'react-i18next';
import classNames from 'classnames';
import dayjs from 'dayjs';
import 'dayjs/plugin/utc';
import {
  DatePicker,
  DatePickerInput,
  FormGroup,
  FormLabel,
  InlineLoading,
  Layer,
  RadioButton,
  RadioButtonGroup,
  Search,
  Stack,
  Tile,
} from '@carbon/react';
import { WarningFilled } from '@carbon/react/icons';
import { useFormContext, Controller } from 'react-hook-form';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { z } from 'zod';
import { showSnackbar, useDebounce, useSession, ResponsiveWrapper } from '@openmrs/esm-framework';
import { type DefaultPatientWorkspaceProps } from '@openmrs/esm-patient-common-lib';
import {
  type CodedCondition,
  type ConditionDataTableRow,
  type FormFields,
  createCondition,
  updateCondition,
  useConditions,
  useConditionsSearch,
} from './conditions.resource';
import styles from './conditions-form.scss';

interface ConditionsWidgetProps {
  schema: z.ZodObject<{
    abatementDateTime: z.ZodNullable<z.ZodOptional<z.ZodDate>>;
    clinicalStatus: z.ZodEffects<z.ZodString, string, string>;
    conditionName: z.ZodEffects<z.ZodString, string, string>;
    onsetDateTime: z.ZodNullable<z.ZodDate>;
  }>;
  closeWorkspaceWithSavedChanges?: DefaultPatientWorkspaceProps['closeWorkspaceWithSavedChanges'];
  conditionToEdit?: ConditionDataTableRow;
  editing?: boolean;
  isSubmittingForm: boolean;
  patientUuid: string;
  setErrorCreating?: (error: Error) => void;
  setErrorUpdating?: (error: Error) => void;
  setHasSubmissibleValue?: (value: boolean) => void;
  setIsSubmittingForm: Dispatch<boolean>;
}

interface RequiredFieldLabelProps {
  label: string;
  t: TFunction;
}

const ConditionsWidget: React.FC<ConditionsWidgetProps> = ({
  schema,
  closeWorkspaceWithSavedChanges,
  conditionToEdit,
  editing,
  isSubmittingForm,
  patientUuid,
  setErrorCreating,
  setErrorUpdating,
  setIsSubmittingForm,
}) => {
  const { t } = useTranslation();
  const { conditions, mutate } = useConditions(patientUuid);
  const {
    control,
    formState: { errors },
    getValues,
    watch,
  } = useFormContext<z.infer<typeof schema>>();
  const session = useSession();
  const searchInputRef = useRef(null);
  const clinicalStatus = watch('clinicalStatus');
  const matchingCondition = conditions?.find((condition) => condition?.id === conditionToEdit?.id);

  const getFieldValue = (
    tableCells: Array<{
      info: {
        header: string;
      };
      value: string;
    }>,
    fieldName,
  ): string => tableCells?.find((cell) => cell?.info?.header === fieldName)?.value;

  const displayName = getFieldValue(conditionToEdit?.cells, 'display');
  const editableClinicalStatus = getFieldValue(conditionToEdit?.cells, 'clinicalStatus');
  const editableAbatementDateTime = getFieldValue(conditionToEdit?.cells, 'abatementDateTime');
  const [selectedCondition, setSelectedCondition] = useState<CodedCondition>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm);
  const { searchResults, isSearching } = useConditionsSearch(debouncedSearchTerm);

  const handleConditionChange = useCallback((selectedCondition: CodedCondition) => {
    setSelectedCondition(selectedCondition);
  }, []);

  const handleCreate = useCallback(async () => {
    if (!selectedCondition) {
      return;
    }

    const payload: FormFields = {
      clinicalStatus: getValues('clinicalStatus'),
      conceptId: selectedCondition?.concept?.uuid,
      display: selectedCondition?.concept?.display,
      abatementDateTime: getValues('abatementDateTime') ? dayjs(getValues('abatementDateTime')).format() : null,
      onsetDateTime: getValues('onsetDateTime') ? dayjs(getValues('onsetDateTime')).format() : null,
      patientId: patientUuid,
      userId: session?.user?.uuid,
    };

    try {
      await createCondition(payload);
      mutate();

      showSnackbar({
        isLowContrast: true,
        kind: 'success',
        subtitle: t('conditionNowVisible', 'It is now visible on the Conditions page'),
        title: t('conditionSaved', 'Condition saved'),
      });

      closeWorkspaceWithSavedChanges();
    } catch (error) {
      setIsSubmittingForm(false);
      setErrorCreating(error);
    }
  }, [
    closeWorkspaceWithSavedChanges,
    getValues,
    mutate,
    patientUuid,
    selectedCondition,
    session?.user?.uuid,
    setErrorCreating,
    setIsSubmittingForm,
    t,
  ]);

  const handleUpdate = useCallback(async () => {
    const payload: FormFields = {
      clinicalStatus: editing ? getValues('clinicalStatus') : editableClinicalStatus,
      conceptId: matchingCondition?.conceptId,
      display: displayName,
      abatementDateTime: editing
        ? getValues('abatementDateTime')
          ? dayjs(getValues('abatementDateTime')).format()
          : editableAbatementDateTime
        : null,
      onsetDateTime: getValues('onsetDateTime') ? dayjs(getValues('onsetDateTime')).format() : null,
      patientId: patientUuid,
      userId: session?.user?.uuid,
    };

    try {
      const res = await updateCondition(conditionToEdit?.id, payload);

      if (res.status === 200) {
        mutate();

        showSnackbar({
          isLowContrast: true,
          kind: 'success',
          subtitle: t('conditionNowVisible', 'It is now visible on the Conditions page'),
          title: t('conditionUpdated', 'Condition updated'),
        });

        closeWorkspaceWithSavedChanges();
      }
    } catch (error) {
      setIsSubmittingForm(false);
      setErrorUpdating(error);
    }
  }, [
    closeWorkspaceWithSavedChanges,
    conditionToEdit?.id,
    displayName,
    editableClinicalStatus,
    editing,
    getValues,
    matchingCondition?.conceptId,
    mutate,
    patientUuid,
    session?.user?.uuid,
    setErrorUpdating,
    setIsSubmittingForm,
    t,
    editableAbatementDateTime,
  ]);

  const focusOnSearchInput = () => {
    searchInputRef?.current?.focus();
  };

  const handleSearchTermChange = (event: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(event.target.value);

  useEffect(() => {
    if (errors?.conditionName) {
      focusOnSearchInput();
    }
    if (isSubmittingForm) {
      if (Object.keys(errors).length > 0) {
        setIsSubmittingForm(false);
        Object.entries(errors).map((key, err) => console.error(`${key}: ${err} `));
        return;
      }
      editing ? handleUpdate() : handleCreate();
    }
  }, [handleUpdate, editing, handleCreate, isSubmittingForm, errors, setIsSubmittingForm]);

  return (
    <div className={styles.formContainer}>
      <Stack gap={7}>
        <FormGroup legendText={<RequiredFieldLabel label={t('condition', 'Condition')} t={t} />}>
          {editing ? (
            <FormLabel className={styles.conditionLabel}>{displayName}</FormLabel>
          ) : (
            <>
              <Controller
                name="conditionName"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <ResponsiveWrapper>
                    <Search
                      autoFocus
                      ref={searchInputRef}
                      size="md"
                      id="conditionsSearch"
                      labelText={t('enterCondition', 'Enter condition')}
                      placeholder={t('searchConditions', 'Search conditions')}
                      className={classNames({
                        [styles.conditionsError]: errors?.conditionName,
                      })}
                      onChange={(e) => {
                        onChange(e);
                        handleSearchTermChange(e);
                      }}
                      renderIcon={errors?.conditionName && ((props) => <WarningFilled fill="red" {...props} />)}
                      onClear={() => {
                        setSearchTerm('');
                        setSelectedCondition(null);
                      }}
                      disabled={editing}
                      value={(() => {
                        if (selectedCondition) {
                          return selectedCondition.display;
                        }
                        if (debouncedSearchTerm) {
                          return value;
                        }
                      })()}
                    />
                  </ResponsiveWrapper>
                )}
              />
              {errors?.conditionName && (
                <p className={styles.errorMessage}>{errors?.conditionName?.message as string}</p>
              )}
              {(() => {
                if (!debouncedSearchTerm || selectedCondition) return null;
                if (isSearching)
                  return <InlineLoading className={styles.loader} description={t('searching', 'Searching') + '...'} />;
                if (searchResults && searchResults.length) {
                  return (
                    <ul className={styles.conditionsList}>
                      {searchResults?.map((searchResult) => (
                        <li
                          role="menuitem"
                          className={styles.condition}
                          key={searchResult?.concept?.uuid}
                          onClick={() => handleConditionChange(searchResult)}
                        >
                          {searchResult.display}
                        </li>
                      ))}
                    </ul>
                  );
                }
                return (
                  <Layer>
                    <Tile className={styles.emptyResults}>
                      <span>
                        {t('noResultsFor', 'No results for')} <strong>"{debouncedSearchTerm}"</strong>
                      </span>
                    </Tile>
                  </Layer>
                );
              })()}
            </>
          )}
        </FormGroup>
        <FormGroup legendText="">
          <Controller
            name="onsetDateTime"
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <ResponsiveWrapper>
                <DatePicker
                  id="onsetDate"
                  datePickerType="single"
                  dateFormat="d/m/Y"
                  maxDate={dayjs().utc().format()}
                  placeholder="dd/mm/yyyy"
                  onChange={([date]) => onChange(date)}
                  onBlur={onBlur}
                  value={value}
                >
                  <DatePickerInput id="onsetDateInput" labelText={t('onsetDate', 'Onset date')} />
                </DatePicker>
              </ResponsiveWrapper>
            )}
          />
        </FormGroup>
        <FormGroup legendText={<RequiredFieldLabel label={t('clinicalStatus', 'Clinical status')} t={t} />}>
          <Controller
            name="clinicalStatus"
            control={control}
            render={({ field: { onChange, value, onBlur } }) => (
              <RadioButtonGroup
                className={styles.radioGroup}
                invalid={errors?.clinicalStatus}
                name="clinicalStatus"
                onBlur={onBlur}
                onChange={onChange}
                orientation="vertical"
                valueSelected={value.toLowerCase()}
              >
                <RadioButton id="active" labelText={t('active', 'Active')} value="active" />
                <RadioButton id="inactive" labelText={t('inactive', 'Inactive')} value="inactive" />
              </RadioButtonGroup>
            )}
          />
          {errors?.clinicalStatus && <p className={styles.errorMessage}>{errors?.clinicalStatus?.message as string}</p>}
        </FormGroup>
        {(clinicalStatus.match(/inactive/i) || matchingCondition?.clinicalStatus?.match(/inactive/i)) && (
          <FormGroup legendText="">
            <Controller
              name="abatementDateTime"
              control={control}
              render={({ field: { onBlur, onChange, value } }) => (
                <>
                  <ResponsiveWrapper>
                    <DatePicker
                      id="endDate"
                      datePickerType="single"
                      dateFormat="d/m/Y"
                      minDate={new Date(watch('abatementDateTime')).toISOString()}
                      maxDate={dayjs().utc().format()}
                      placeholder="dd/mm/yyyy"
                      onChange={([date]) => onChange(date)}
                      onBlur={onBlur}
                      value={value}
                    >
                      <DatePickerInput id="abatementDateTime" labelText={t('endDate', 'End date')} />
                    </DatePicker>
                  </ResponsiveWrapper>
                </>
              )}
            />
          </FormGroup>
        )}
      </Stack>
    </div>
  );
};

function RequiredFieldLabel({ label, t }: RequiredFieldLabelProps) {
  return (
    <>
      <span>{label}</span>

      <span title={t('required', 'Required')} className={styles.required}>
        *
      </span>
    </>
  );
}

export default ConditionsWidget;
