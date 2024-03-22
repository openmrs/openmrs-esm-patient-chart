import React, { type Dispatch, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { showSnackbar, useDebounce, useSession, ResponsiveWrapper } from '@openmrs/esm-framework';
import { type DefaultWorkspaceProps } from '@openmrs/esm-patient-common-lib';
import {
  type CodedCondition,
  type ConditionDataTableRow,
  createCondition,
  type FormFields,
  updateCondition,
  useConditions,
  useConditionsSearch,
} from './conditions.resource';
import { type ConditionFormData } from './conditions-form.component';
import styles from './conditions-form.scss';
import { Select, SelectItem } from '@carbon/react';

interface ConditionsWidgetProps {
  closeWorkspaceWithSavedChanges?: DefaultWorkspaceProps['closeWorkspaceWithSavedChanges'];
  conditionToEdit?: ConditionDataTableRow;
  editing?: boolean;
  patientUuid: string;
  setHasSubmissibleValue?: (value: boolean) => void;
  setErrorCreating?: (error: Error) => void;
  setErrorUpdating?: (error: Error) => void;
  isSubmittingForm: boolean;
  setIsSubmittingForm: Dispatch<boolean>;
}

const ConditionsWidget: React.FC<ConditionsWidgetProps> = ({
  closeWorkspaceWithSavedChanges,
  conditionToEdit,
  editing,
  patientUuid,
  isSubmittingForm,
  setIsSubmittingForm,
  setErrorCreating,
  setErrorUpdating,
}) => {
  const { t } = useTranslation();
  const { conditions, mutate } = useConditions(patientUuid);
  const {
    control,
    watch,
    getValues,
    formState: { errors },
  } = useFormContext<ConditionFormData>();
  const session = useSession();
  const searchInputRef = useRef(null);
  const currentStatus = watch('currentStatus');
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
  const editablecurrentStatus = getFieldValue(conditionToEdit?.cells, 'currentStatus');
  const editableclinicalStatus = getFieldValue(conditionToEdit?.cells, 'clinicalStatus');
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
      currentStatus: getValues('currentStatus'),
      clinicalStatus: getValues('clinicalStatus'),
      conceptId: selectedCondition?.concept?.uuid,
      display: selectedCondition?.concept?.display,
      endDate: getValues('endDate') ? dayjs(getValues('endDate')).format() : null,
      onsetDateTime: getValues('onsetDateTime') ? dayjs(getValues('onsetDateTime')).format() : null,
      patientId: patientUuid,
      userId: session?.user?.uuid,
    };

    try {
      const res = await createCondition(payload);

      if (res.status === 201) {
        mutate();

        showSnackbar({
          isLowContrast: true,
          kind: 'success',
          subtitle: t('conditionNowVisible', 'It is now visible on the Conditions page'),
          title: t('conditionSaved', 'Condition saved'),
        });

        closeWorkspaceWithSavedChanges();
      }
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
      currentStatus: editing ? getValues('currentStatus') : editablecurrentStatus,
      clinicalStatus: editing ? getValues('clinicalStatus') : editableclinicalStatus,
      conceptId: matchingCondition?.conceptId,
      display: displayName,
      endDate: getValues('endDate') ? dayjs(getValues('endDate')).format() : null,
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
    editablecurrentStatus,
    editing,
    getValues,
    matchingCondition?.conceptId,
    mutate,
    patientUuid,
    session?.user?.uuid,
    setErrorUpdating,
    setIsSubmittingForm,
    t,
  ]);

  const focusOnSearchInput = () => {
    searchInputRef?.current?.focus();
  };

  const handleSearchTermChange = (event: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(event.target.value);

  useEffect(() => {
    if (errors?.search) {
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
        <FormGroup
          legendText={
            <>
              <span>{t('condition', 'Condition')}</span>
              {!editing && (
                <span title={t('required', 'Required')} className={styles.required}>
                  *
                </span>
              )}
            </>
          }
        >
          {editing ? (
            <FormLabel className={styles.conditionLabel}>{displayName}</FormLabel>
          ) : (
            <>
              <Controller
                name="search"
                control={control}
                render={({ field: { onChange, value, onBlur } }) => (
                  <ResponsiveWrapper>
                    <Search
                      autoFocus
                      ref={searchInputRef}
                      size="md"
                      id="conditionsSearch"
                      labelText={t('enterCondition', 'Enter condition')}
                      placeholder={t('searchConditions', 'Search conditions')}
                      className={classNames({
                        [styles.conditionsError]: errors?.search,
                      })}
                      onChange={(e) => {
                        onChange(e);
                        handleSearchTermChange(e);
                      }}
                      renderIcon={errors?.search && ((props) => <WarningFilled fill="red" {...props} />)}
                      onBlur={onBlur}
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
              {errors?.search && <p className={styles.errorMessage}>{errors?.search?.message}</p>}
              {(() => {
                if (!debouncedSearchTerm || selectedCondition) return null;
                if (isSearching)
                  return <InlineLoading className={styles.loader} description={t('searching', 'Searching') + '...'} />;
                if (searchResults && searchResults.length) {
                  return (
                    <ul className={styles.conditionsList}>
                      {/*TODO: use uuid instead of index as the key*/}
                      {searchResults?.map((searchResult, index) => (
                        <li
                          role="menuitem"
                          className={styles.condition}
                          key={index}
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
        <FormGroup
          legendText={
            <>
              <span>{t('clinicalStatus', 'Clinical Status')}</span>
              {!editing && (
                <span title={t('required', 'Required')} className={styles.required}>
                  *
                </span>
              )}
            </>
          }
        >
          <Controller
            name="clinicalStatus"
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <ResponsiveWrapper>
                <Select
                  id="clinicalStatus"
                  onChange={onChange}
                  onBlur={onBlur}
                  labelText=""
                  className={classNames({
                    [styles.conditionsError]: errors?.search,
                  })}
                >
                  <SelectItem value="" text="" />
                  <SelectItem value="active" text="Active" />
                  <SelectItem value="recurrence" text="Recurrence" />
                  <SelectItem value="replapse" text="Replapse" />
                  <SelectItem value="inactive" text="Inactive" />
                  <SelectItem value="remission" text="Remission" />
                  <SelectItem value="resolved" text="Resolved" />
                  <SelectItem value="unknown" text="Unknown" />
                </Select>
              </ResponsiveWrapper>
            )}
          />
          {errors?.clinicalStatus && <p className={styles.errorMessage}>{errors?.clinicalStatus?.message}</p>}
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
        <FormGroup
          legendText={
            <>
              <span> {t('currentStatus', 'Current status')}</span>
              <span title={t('required', 'Required')} className={styles.required}>
                *
              </span>
            </>
          }
        >
          <Controller
            name="currentStatus"
            control={control}
            render={({ field: { onChange, value, onBlur } }) => (
              <RadioButtonGroup
                className={styles.radioGroup}
                name="currentStatus"
                orientation="vertical"
                onChange={onChange}
                onBlur={onBlur}
                valueSelected={value.toLowerCase()}
              >
                <RadioButton id="active" labelText="Active" value="active" />
                <RadioButton id="inactive" labelText="Inactive" value="inactive" />
              </RadioButtonGroup>
            )}
          />
        </FormGroup>
        {currentStatus === 'inactive' && (
          <Controller
            name="endDate"
            control={control}
            render={({ field: { onBlur, onChange, value } }) => (
              <ResponsiveWrapper>
                <DatePicker
                  id="endDate"
                  datePickerType="single"
                  dateFormat="d/m/Y"
                  minDate={new Date(watch('onsetDateTime')).toISOString()}
                  maxDate={dayjs().utc().format()}
                  placeholder="dd/mm/yyyy"
                  onChange={([date]) => onChange(date)}
                  onBlur={onBlur}
                  value={value}
                >
                  <DatePickerInput id="endDateInput" labelText={t('endDate', 'End date')} />
                </DatePicker>
              </ResponsiveWrapper>
            )}
          />
        )}
      </Stack>
    </div>
  );
};

export default ConditionsWidget;
