import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import 'dayjs/plugin/utc';
import { BehaviorSubject } from 'rxjs';
import {
  DatePicker,
  DatePickerInput,
  FormGroup,
  InlineLoading,
  Layer,
  RadioButton,
  RadioButtonGroup,
  Search,
  Stack,
  Tile,
  FormLabel,
} from '@carbon/react';
import { createErrorHandler, showNotification, showToast, useLayoutType, useSession } from '@openmrs/esm-framework';
import {
  createPatientCondition,
  CodedCondition,
  useConditionsSearch,
  ConditionDataTableRow,
  editPatientCondition,
  useConditions,
} from './conditions.resource';
import styles from './conditions-form.scss';

interface ConditionsWidgetProps {
  patientUuid: string;
  closeWorkspace?: () => void;
  setHasSubmissibleValue?: (value: boolean) => void;
  submissionNotifier: BehaviorSubject<{ isSubmitting: boolean }>;
  condition?: ConditionDataTableRow;
  context?: string;
}

const getFieldValue = (cells, fieldName) => cells?.find((c) => c?.info?.header === fieldName)?.value;

const ConditionsWidget: React.FC<ConditionsWidgetProps> = ({
  patientUuid,
  closeWorkspace,
  setHasSubmissibleValue,
  submissionNotifier,
  condition,
  context,
}) => {
  const { t } = useTranslation();
  const session = useSession();
  const { mutate, data } = useConditions(patientUuid);
  const isTablet = useLayoutType() === 'tablet';

  const onsetDateTime = data?.find((d) => d?.id === condition?.id)?.onsetDateTime;
  const displayName = getFieldValue(condition?.cells, 'display');
  const conditionStatus = getFieldValue(condition?.cells, 'clinicalStatus');

  const [clinicalStatus, setClinicalStatus] = useState(
    context === 'editing' ? conditionStatus.toLowerCase() : 'active',
  );
  const [endDate, setEndDate] = useState(null);
  const [onsetDate, setOnsetDate] = useState(
    context !== 'editing' ? new Date() : context === 'editing' && onsetDateTime ? new Date(onsetDateTime) : null,
  );
  const [conditionToLookup, setConditionToLookup] = useState<null | string>(context === 'editing' ? displayName : '');

  const { conditions, isSearchingConditions } = useConditionsSearch(conditionToLookup);

  const [selectedCondition, setSelectedCondition] = useState(null);

  // Populate the selected condition when in edit mode
  useEffect(() => {
    if (context === 'editing' && displayName) {
      setSelectedCondition(conditions?.find((c) => c.display === displayName));
    }
  }, [conditions, condition, context, displayName]);

  const dataHasChanged =
    selectedCondition !== displayName ||
    clinicalStatus !== conditionStatus ||
    onsetDate !== new Date(getFieldValue(condition?.cells, 'onsetDateTime'));

  useEffect(() => {
    if (setHasSubmissibleValue) {
      setHasSubmissibleValue(!!selectedCondition);
    }
  }, [selectedCondition, setHasSubmissibleValue]);

  useEffect(() => {
    if (context === 'editing' && selectedCondition && dataHasChanged) {
      setHasSubmissibleValue(true);
    } else if (context === 'editing' && !selectedCondition && !dataHasChanged) {
      setHasSubmissibleValue(false);
    }
  }, [dataHasChanged, context, setHasSubmissibleValue, selectedCondition]);

  const handleSearchTermChange = (event) => setConditionToLookup(event.target.value);

  const handleConditionChange = useCallback((selectedCondition: CodedCondition) => {
    setSelectedCondition(selectedCondition);
    setConditionToLookup('');
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const conditionPayload = {
    resourceType: 'Condition',
    clinicalStatus: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
          code: clinicalStatus,
        },
      ],
    },
    code: {
      coding: [
        {
          code: selectedCondition?.concept?.uuid,
          display: selectedCondition?.concept?.display,
        },
      ],
    },
    endDate: endDate ? dayjs(endDate).format() : null,
    onsetDateTime: onsetDate ? dayjs(onsetDate).format() : null,
    subject: {
      reference: `Patient/${patientUuid}`,
    },
    recorder: {
      reference: `Practitioner/${session?.user?.uuid}`,
    },
    recordedDate: new Date().toISOString(),
  };

  const handleEditCondition = useCallback(() => {
    if (!selectedCondition && !dataHasChanged) {
      return;
    }

    const abortController = new AbortController();
    const sub = editPatientCondition(
      condition?.id,
      { ...conditionPayload, id: condition?.id },
      abortController,
    ).subscribe(
      (response) => {
        if (response.status === 200) {
          closeWorkspace?.();

          showToast({
            critical: true,
            kind: 'success',
            description: t('conditionNowVisible', 'It is now visible on the Conditions page'),
            title: t('conditionUpdated', 'Condition updated'),
          });

          mutate();
        }
      },
      (err) => {
        createErrorHandler();

        showNotification({
          title: t('conditionEditingError', 'Error editing condition'),
          kind: 'error',
          critical: true,
          description: err?.message,
        });
      },
    );
    return () => {
      sub.unsubscribe();
    };
  }, [closeWorkspace, mutate, selectedCondition, condition?.id, dataHasChanged, conditionPayload, t]);

  const handleSubmit = useCallback(() => {
    if (!selectedCondition) {
      return;
    }

    const abortController = new AbortController();
    const sub = createPatientCondition(conditionPayload, abortController).subscribe(
      (response) => {
        if (response.status === 201) {
          mutate();
          closeWorkspace?.();

          showToast({
            critical: true,
            kind: 'success',
            description: t('conditionNowVisible', 'It is now visible on the Conditions page'),
            title: t('conditionSaved', 'Condition saved'),
          });
        }
      },
      (err) => {
        createErrorHandler();

        showNotification({
          title: t('conditionSaveError', 'Error saving condition'),
          kind: 'error',
          critical: true,
          description: err?.message,
        });
      },
    );
    return () => {
      sub.unsubscribe();
    };
  }, [conditionPayload, closeWorkspace, mutate, selectedCondition, t]);

  useEffect(() => {
    const subscription = submissionNotifier?.subscribe(({ isSubmitting }) => {
      if (isSubmitting) {
        context === 'editing' ? handleEditCondition() : handleSubmit();
      }
    });
    return () => {
      subscription?.unsubscribe();
    };
  }, [handleSubmit, submissionNotifier, handleEditCondition, context]);

  return (
    <div className={styles.formContainer}>
      <Stack gap={7}>
        <FormGroup legendText={t('condition', 'Condition')}>
          {context === 'editing' ? (
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
                disabled={context === 'editing'}
                value={(() => {
                  if (conditionToLookup) {
                    return conditionToLookup;
                  }
                  if (selectedCondition) {
                    return selectedCondition.display;
                  }
                  return '';
                })()}
              />
              <div>
                {(() => {
                  if (!conditionToLookup || selectedCondition) return null;
                  if (isSearchingConditions)
                    return (
                      <InlineLoading className={styles.loader} description={t('searching', 'Searching') + '...'} />
                    );
                  if (conditions && conditions.length) {
                    return (
                      <ul className={styles.conditionsList}>
                        {conditions?.map((condition, index) => (
                          <li
                            role="menuitem"
                            className={styles.condition}
                            key={index}
                            onClick={() => handleConditionChange(condition)}
                          >
                            {condition.display}
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  return (
                    <>
                      <Layer>
                        <Tile className={styles.emptyResults}>
                          <span>
                            {t('noResultsFor', 'No results for')} <strong>"{conditionToLookup}"</strong>
                          </span>
                        </Tile>
                      </Layer>
                    </>
                  );
                })()}
              </div>
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
            onChange={([date]) => setOnsetDate(date)}
            value={onsetDate}
          >
            <DatePickerInput id="onsetDateInput" labelText={t('onsetDate', 'Onset date')} />
          </DatePicker>
        </FormGroup>
        <FormGroup legendText={t('currentStatus', 'Current status')}>
          <RadioButtonGroup
            defaultSelected={clinicalStatus}
            name="clinicalStatus"
            valueSelected={clinicalStatus}
            orientation="vertical"
            onChange={(status) => setClinicalStatus(status.toString())}
          >
            <RadioButton id="active" labelText="Active" value="active" />
            <RadioButton id="inactive" labelText="Inactive" value="inactive" />
          </RadioButtonGroup>
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
            onChange={([date]) => setEndDate(date)}
            value={endDate}
          >
            <DatePickerInput id="endDateInput" labelText={t('endDate', 'End date')} />
          </DatePicker>
        )}
      </Stack>
    </div>
  );
};

export default ConditionsWidget;
