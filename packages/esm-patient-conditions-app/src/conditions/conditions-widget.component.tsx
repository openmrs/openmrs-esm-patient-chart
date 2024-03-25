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
import { showSnackbar, useDebounce, useSession, ResponsiveWrapper } from '@openmrs/esm-framework';
import { type DefaultWorkspaceProps } from '@openmrs/esm-patient-common-lib';
import {
  type CodedCondition,
  type ConditionDataTableRow,
  type FormFields,
  createCondition,
  updateCondition,
  useConditions,
  useConditionsSearch,
} from './conditions.resource';
import { type ConditionFormData } from './conditions-form.component';
import styles from './conditions-form.scss';

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

interface RequiredLabelProps {
  isRequired: boolean;
  text: string;
  t: TFunction;
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
        <FormGroup legendText={<RequiredLabel isRequired text={t('condition', 'Condition')} t={t} />}>
          {editing ? (
            <FormLabel className={styles.conditionLabel}>{displayName}</FormLabel>
          ) : (
            <>
              <Controller
                name="conditionName"
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
                        [styles.conditionsError]: errors?.conditionName,
                      })}
                      onChange={(e) => {
                        onChange(e);
                        handleSearchTermChange(e);
                      }}
                      renderIcon={errors?.conditionName && ((props) => <WarningFilled fill="red" {...props} />)}
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
              {errors?.conditionName && <p className={styles.errorMessage}>{errors?.conditionName?.message}</p>}
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
        <FormGroup legendText={t('clinicalStatus', 'Current status')}>
          <Controller
            name="clinicalStatus"
            control={control}
            render={({ field: { onChange, value, onBlur } }) => (
              <RadioButtonGroup
                className={styles.radioGroup}
                valueSelected={value.toLowerCase()}
                name="clinicalStatus"
                orientation="vertical"
                onChange={onChange}
                onBlur={onBlur}
              >
                <RadioButton id="active" labelText="Active" value="active" />
                <RadioButton id="inactive" labelText="Inactive" value="inactive" />
              </RadioButtonGroup>
            )}
          />
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

function RequiredLabel({ isRequired, text, t }: RequiredLabelProps) {
  return (
    <>
      <span>{text}</span>
      {isRequired && (
        <span title={t('required', 'Required')} className={styles.required}>
          *
        </span>
      )}
    </>
  );
}

export default ConditionsWidget;
