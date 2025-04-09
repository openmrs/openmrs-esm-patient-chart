import React, { type Dispatch, useCallback, useEffect, useRef, useState } from 'react';
import { type TFunction, useTranslation } from 'react-i18next';
import classNames from 'classnames';
import dayjs from 'dayjs';
import 'dayjs/plugin/utc';
import {
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
import { showSnackbar, useDebounce, useSession, ResponsiveWrapper, OpenmrsDatePicker } from '@openmrs/esm-framework';
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
import { type ConditionsFormSchema, type ConditionFormProps } from './conditions-form.workspace';
import styles from './conditions-form.scss';

interface ConditionsWidgetProps {
  closeWorkspaceWithSavedChanges?: DefaultPatientWorkspaceProps['closeWorkspaceWithSavedChanges'];
  onConditionSave?: ConditionFormProps['onConditionSave'];
  conditionToEdit?: ConditionDataTableRow;
  isEditing?: boolean;
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

interface SearchResultsProps {
  isSearching: boolean;
  onConditionChange: (condition: CodedCondition) => void;
  searchResults: CodedCondition[];
  selectedCondition: CodedCondition;
  t: TFunction;
  value: string;
}

const ConditionsWidget: React.FC<ConditionsWidgetProps> = ({
  closeWorkspaceWithSavedChanges,
  onConditionSave,
  conditionToEdit,
  isEditing,
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
  } = useFormContext<ConditionsFormSchema>();
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
      conceptId: selectedCondition?.uuid,
      display: selectedCondition?.display,
      abatementDateTime: getValues('abatementDateTime') ? dayjs(getValues('abatementDateTime')).format() : null,
      onsetDateTime: getValues('onsetDateTime') ? dayjs(getValues('onsetDateTime')).format() : null,
      patientId: patientUuid,
      userId: session?.user?.uuid,
    };

    try {
      const res = await createCondition(payload);
      await mutate();

      showSnackbar({
        kind: 'success',
        subtitle: t('conditionNowVisible', 'It is now visible on the Conditions page'),
        title: t('conditionSaved', 'Condition saved'),
      });

      closeWorkspaceWithSavedChanges(res.data);
      onConditionSave?.(res.data);
    } catch (error) {
      setIsSubmittingForm(false);
      setErrorCreating(error);
    }
  }, [
    closeWorkspaceWithSavedChanges,
    onConditionSave,
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
      clinicalStatus: isEditing ? getValues('clinicalStatus') : editableClinicalStatus,
      conceptId: matchingCondition?.conceptId,
      display: displayName,
      abatementDateTime: isEditing
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
      await mutate();

      showSnackbar({
        kind: 'success',
        subtitle: t('conditionNowVisible', 'It is now visible on the Conditions page'),
        title: t('conditionUpdated', 'Condition updated'),
      });

      closeWorkspaceWithSavedChanges(res.data);
      onConditionSave?.(res.data);
    } catch (error) {
      setIsSubmittingForm(false);
      setErrorUpdating(error);
    }
  }, [
    closeWorkspaceWithSavedChanges,
    onConditionSave,
    conditionToEdit?.id,
    displayName,
    editableClinicalStatus,
    isEditing,
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

  const handleSearchTermChange = (searchTerm: string) => {
    setSearchTerm(searchTerm);
  };

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
      isEditing ? handleUpdate() : handleCreate();
    }
  }, [handleUpdate, isEditing, handleCreate, isSubmittingForm, errors, setIsSubmittingForm]);

  return (
    <div className={styles.formContainer}>
      <Stack gap={7}>
        <FormGroup legendText={<RequiredFieldLabel label={t('condition', 'Condition')} t={t} />}>
          {isEditing ? (
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
                      className={classNames({
                        [styles.conditionsError]: errors?.conditionName,
                      })}
                      disabled={isEditing}
                      id="conditionsSearch"
                      labelText={t('enterCondition', 'Enter condition')}
                      onChange={(event) => {
                        const value = event.target.value;
                        onChange(value);
                        handleSearchTermChange(value);
                      }}
                      onClear={() => {
                        setSearchTerm('');
                        setSelectedCondition(null);
                      }}
                      placeholder={t('searchConditions', 'Search conditions')}
                      ref={searchInputRef}
                      renderIcon={errors?.conditionName && ((props) => <WarningFilled fill="red" {...props} />)}
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
              {errors?.conditionName && <p className={styles.errorMessage}>{errors?.conditionName?.message}</p>}
              <SearchResults
                isSearching={isSearching}
                onConditionChange={handleConditionChange}
                searchResults={searchResults}
                selectedCondition={selectedCondition}
                t={t}
                value={searchTerm}
              />
            </>
          )}
        </FormGroup>
        <FormGroup legendText="">
          <Controller
            name="onsetDateTime"
            control={control}
            render={({ field, fieldState }) => (
              <ResponsiveWrapper>
                <OpenmrsDatePicker
                  {...field}
                  id="onsetDate"
                  data-testid="onsetDate"
                  maxDate={new Date()}
                  labelText={t('onsetDate', 'Onset date')}
                  invalid={Boolean(fieldState?.error?.message)}
                  invalidText={fieldState?.error?.message}
                />
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
                invalid={Boolean(errors?.clinicalStatus)}
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
          {errors?.clinicalStatus && <p className={styles.errorMessage}>{errors?.clinicalStatus?.message}</p>}
        </FormGroup>
        {(clinicalStatus.match(/inactive/i) || matchingCondition?.clinicalStatus?.match(/inactive/i)) && (
          <FormGroup legendText="">
            <Controller
              name="abatementDateTime"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <ResponsiveWrapper>
                    <OpenmrsDatePicker
                      {...field}
                      id="endDate"
                      data-testid="endDate"
                      minDate={new Date(watch('onsetDateTime'))}
                      maxDate={new Date()}
                      labelText={t('endDate', 'End date')}
                      invalid={Boolean(fieldState?.error?.message)}
                      invalidText={fieldState?.error?.message}
                    />
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
    <span>
      {label}
      <span title={t('required', 'Required')} className={styles.required}>
        *
      </span>
    </span>
  );
}

function SearchResults({
  isSearching,
  onConditionChange,
  searchResults,
  selectedCondition,
  t,
  value,
}: SearchResultsProps) {
  if (!value || selectedCondition) {
    return null;
  }

  if (isSearching) {
    return <InlineLoading className={styles.loader} description={t('searching', 'Searching') + '...'} />;
  }

  if (!isSearching && searchResults?.length > 0) {
    return (
      <ul className={styles.conditionsList}>
        {searchResults?.map((searchResult) => (
          <li
            className={styles.condition}
            key={searchResult?.uuid}
            onClick={() => onConditionChange(searchResult)}
            role="menuitem"
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
          {t('noResultsFor', 'No results for')} <strong>"{value}"</strong>
        </span>
      </Tile>
    </Layer>
  );
}

export default ConditionsWidget;
