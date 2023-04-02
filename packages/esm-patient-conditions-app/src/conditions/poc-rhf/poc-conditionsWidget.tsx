import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import 'dayjs/plugin/utc';
import { BehaviorSubject } from 'rxjs';
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
import { showToast, useLayoutType, useSession } from '@openmrs/esm-framework';
import {
  CodedCondition,
  ConditionDataTableRow,
  createCondition,
  FormFields,
  updateCondition,
  useConditions,
  useConditionsSearch,
} from '../conditions.resource';
import styles from '../conditions-form.scss';
import { Path, useForm, UseFormRegister, SubmitHandler } from 'react-hook-form';
import { IFormValues } from './poc-type';

interface ConditionsWidgetProps {
  closeWorkspace?: () => void;
  conditionToEdit?: ConditionDataTableRow;
  formContext?: 'creating' | 'editing';
  patientUuid: string;
  setHasSubmissibleValue?: (value: boolean) => void;
  setErrorCreating?: (error: Error) => void;
  setErrorUpdating?: (error: Error) => void;
  submissionNotifier: BehaviorSubject<{ isSubmitting: boolean }>;
  register: UseFormRegister<IFormValues>;
  onsetdate: Path<IFormValues>;
  enddate: Path<IFormValues>;
  status: Path<IFormValues>;
  errors: any;
}

const PocConditionsWidget: React.FC<ConditionsWidgetProps> = ({
  closeWorkspace,
  conditionToEdit,
  formContext,
  patientUuid,
  setHasSubmissibleValue,
  setErrorCreating: setErrorCreating,
  setErrorUpdating: setErrorUpdating,
  submissionNotifier,
  register,
  onsetdate,
  enddate,
  status,
  errors,
}) => {
  const { t } = useTranslation();
  const { conditions, mutate } = useConditions(patientUuid);
  const editing = formContext === 'editing';
  const isTablet = useLayoutType() === 'tablet';
  const session = useSession();

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

  const [clinicalStatus, setClinicalStatus] = useState(editing ? editableClinicalStatus?.toLowerCase() : 'active');
  const [conditionToLookup, setConditionToLookup] = useState<string>(null);
  const [endDate, setEndDate] = useState<string>(null);
  const [onsetDate, setOnsetDate] = useState<Date>(
    editing ? (matchingCondition?.onsetDateTime ? new Date(matchingCondition?.onsetDateTime) : null) : null,
  );
  const [selectedCondition, setSelectedCondition] = useState<CodedCondition>(null);
  const { searchResults, isSearching } = useConditionsSearch(conditionToLookup);

  const formTouched =
    clinicalStatus !== editableClinicalStatus || onsetDate !== new Date(matchingCondition?.onsetDateTime);

  useEffect(() => {
    if (editing) {
      if (formTouched) {
        setHasSubmissibleValue(true);
      } else {
        setHasSubmissibleValue(false);
      }
    } else if (!editing) {
      setHasSubmissibleValue(!!selectedCondition);
    }
  }, [formTouched, editing, selectedCondition, setHasSubmissibleValue]);

  const handleSearchTermChange = (event) => setConditionToLookup(event.target.value);

  const handleConditionChange = useCallback((selectedCondition: CodedCondition) => {
    setSelectedCondition(selectedCondition);
    setConditionToLookup('');
  }, []);

  const handleCreate = useCallback(async () => {
    if (!selectedCondition) {
      return;
    }

    const payload: FormFields = {
      clinicalStatus: clinicalStatus,
      conceptId: selectedCondition?.concept?.uuid,
      display: selectedCondition?.concept?.display,
      endDate: endDate ? dayjs(endDate).format() : null,
      onsetDateTime: onsetDate ? dayjs(onsetDate).format() : null,
      patientId: patientUuid,
      userId: session?.user?.uuid,
    };

    try {
      const res = await createCondition(payload);

      if (res.status === 201) {
        mutate();

        showToast({
          critical: true,
          kind: 'success',
          description: t('conditionNowVisible', 'It is now visible on the Conditions page'),
          title: t('conditionSaved', 'Condition saved'),
        });

        closeWorkspace?.();
      }
    } catch (error) {
      setErrorCreating(error);
    }
  }, [
    clinicalStatus,
    closeWorkspace,
    endDate,
    mutate,
    onsetDate,
    patientUuid,
    selectedCondition,
    session?.user?.uuid,
    setErrorCreating,
    t,
  ]);

  const handleUpdate = useCallback(async () => {
    if (!formTouched) return;

    const payload: FormFields = {
      clinicalStatus: formTouched ? clinicalStatus : editableClinicalStatus,
      conceptId: matchingCondition?.conceptId,
      display: displayName,
      endDate: endDate ? dayjs(endDate).format() : null,
      onsetDateTime: onsetDate ? dayjs(onsetDate).format() : null,
      patientId: patientUuid,
      userId: session?.user?.uuid,
    };

    try {
      const res = await updateCondition(conditionToEdit?.id, payload);

      if (res.status === 200) {
        mutate();

        showToast({
          critical: true,
          kind: 'success',
          description: t('conditionNowVisible', 'It is now visible on the Conditions page'),
          title: t('conditionUpdated', 'Condition updated'),
        });

        closeWorkspace();
      }
    } catch (error) {
      setErrorUpdating(error);
    }
  }, [
    clinicalStatus,
    closeWorkspace,
    conditionToEdit?.id,
    displayName,
    editableClinicalStatus,
    endDate,
    formTouched,
    matchingCondition?.conceptId,
    mutate,
    onsetDate,
    patientUuid,
    session?.user?.uuid,
    setErrorUpdating,
    t,
  ]);

  useEffect(() => {
    const subscription = submissionNotifier.subscribe(({ isSubmitting }) => {
      if (isSubmitting) {
        editing ? handleUpdate() : handleCreate();
      }
    });

    return () => subscription?.unsubscribe();
  }, [handleCreate, handleUpdate, editing, submissionNotifier]);

  return (
    <div className={styles.formContainer}>
      <Stack gap={7}>
        <FormGroup legendText={t('condition', 'Condition')}>
          {editing ? (
            <FormLabel className={styles.conditionLabel}>{displayName}</FormLabel>
          ) : (
            <>
              <Search
                size="md"
                id="conditionsSearch"
                labelText={t('enterCondition', 'Enter condition')}
                light={isTablet}
                placeholder={t('searchConditions', 'Search conditions')}
                onChange={handleSearchTermChange}
                onClear={() => setSelectedCondition(null)}
                disabled={editing}
                value={(() => {
                  if (editing) {
                    return displayName;
                  }
                  if (conditionToLookup) {
                    return conditionToLookup;
                  }
                  if (selectedCondition) {
                    return selectedCondition.display;
                  }
                  return '';
                })()}
              />
              {(() => {
                if (!conditionToLookup || selectedCondition) return null;
                if (isSearching)
                  return <InlineLoading className={styles.loader} description={t('searching', 'Searching') + '...'} />;
                if (searchResults && searchResults.length) {
                  return (
                    <ul className={styles.conditionsList}>
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
                        {t('noResultsFor', 'No results for')} <strong>"{conditionToLookup}"</strong>
                      </span>
                    </Tile>
                  </Layer>
                );
              })()}
            </>
          )}
        </FormGroup>
        <FormGroup legendText="">
          <DatePicker
            id="onsetDate"
            datePickerType="single"
            dateFormat="d/m/Y"
            light={isTablet}
            maxDate={new Date().toISOString()}
            placeholder="dd/mm/yyyy"
            {...register(onsetdate)}
            //onChange={([date]) => setOnsetDate(date)}
            // value={onsetDate}
          >
            <DatePickerInput id="onsetDateInput" labelText={t('onsetDate', 'Onset date')} />
          </DatePicker>
          {errors?.onsetdate && <span>{errors?.onsetdate?.message}</span>}
        </FormGroup>
        <FormGroup legendText={t('currentStatus', 'Current status')}>
          <RadioButtonGroup
            defaultSelected={clinicalStatus}
            name="clinicalStatus"
            valueSelected={clinicalStatus}
            orientation="vertical"
            {...register(status)}
          >
            <RadioButton id="active" labelText="Active" value="active" />
            <RadioButton id="inactive" labelText="Inactive" value="inactive" />
          </RadioButtonGroup>
          {errors?.status && <span>{errors?.status?.message}</span>}
        </FormGroup>
        {clinicalStatus === 'inactive' && (
          <DatePicker
            id="endDate"
            datePickerType="single"
            dateFormat="d/m/Y"
            light={isTablet}
            minDate={new Date(onsetDate).toISOString()}
            maxDate={dayjs().utc().format()}
            placeholder="dd/mm/yyyy"
            {...register(enddate)}
          >
            <DatePickerInput id="endDateInput" labelText={t('endDate', 'End date')} />
            {errors?.enddate && <span>{errors?.enddate?.message}</span>}
          </DatePicker>
        )}
      </Stack>
    </div>
  );
};

export default PocConditionsWidget;
