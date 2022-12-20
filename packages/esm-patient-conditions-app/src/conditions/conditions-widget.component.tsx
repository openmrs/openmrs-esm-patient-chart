import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import 'dayjs/plugin/utc';
import { BehaviorSubject } from 'rxjs';
import { useSWRConfig } from 'swr';
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
} from '@carbon/react';
import {
  createErrorHandler,
  fhirBaseUrl,
  showNotification,
  showToast,
  useLayoutType,
  useSession,
} from '@openmrs/esm-framework';
import { createPatientCondition, CodedCondition, useConditionsSearch } from './conditions.resource';
import styles from './conditions-form.scss';

interface ConditionsWidgetProps {
  patientUuid: string;
  closeWorkspace?: () => void;
  setHasSubmissibleValue?: (value: boolean) => void;
  submissionNotifier: BehaviorSubject<{ isSubmitting: boolean }>;
}

interface CustomDatePickerProps {
  id: string;
  maxDate: string;
  minDate?: string;
  onChange: ([date]: [any]) => void;
  value: Date;
  inputId: string;
  inputLabelText: string;
}

const ConditionsWidget: React.FC<ConditionsWidgetProps> = ({
  patientUuid,
  closeWorkspace,
  setHasSubmissibleValue,
  submissionNotifier,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const session = useSession();
  const { mutate } = useSWRConfig();
  const [clinicalStatus, setClinicalStatus] = useState('active');
  const [endDate, setEndDate] = useState(null);
  const [onsetDate, setOnsetDate] = useState(new Date());
  const [conditionToLookup, setConditionToLookup] = useState<null | string>('');
  const [selectedCondition, setSelectedCondition] = useState(null);

  const { conditions, isSearchingConditions } = useConditionsSearch(conditionToLookup);

  useEffect(() => {
    if (setHasSubmissibleValue) {
      setHasSubmissibleValue(!!selectedCondition);
    }
  }, [selectedCondition, setHasSubmissibleValue]);

  const handleSearchTermChange = (event) => setConditionToLookup(event.target.value);

  const handleConditionChange = useCallback((selectedCondition: CodedCondition) => {
    setSelectedCondition(selectedCondition);
    setConditionToLookup('');
  }, []);

  const handleSubmit = useCallback(() => {
    if (!selectedCondition) {
      return;
    }

    const payload = {
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

    const abortController = new AbortController();
    const sub = createPatientCondition(payload, abortController).subscribe(
      (response) => {
        if (response.status === 201) {
          closeWorkspace?.();

          showToast({
            critical: true,
            kind: 'success',
            description: t('conditionNowVisible', 'It is now visible on the Conditions page'),
            title: t('conditionSaved', 'Condition saved'),
          });

          mutate(`${fhirBaseUrl}/Condition?patient=${patientUuid}`);
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
  }, [
    clinicalStatus,
    closeWorkspace,
    endDate,
    mutate,
    onsetDate,
    patientUuid,
    selectedCondition,
    session?.user?.uuid,
    t,
  ]);

  useEffect(() => {
    const subscription = submissionNotifier?.subscribe(({ isSubmitting }) => {
      if (isSubmitting) {
        handleSubmit();
      }
    });
    return () => {
      subscription?.unsubscribe();
    };
  }, [handleSubmit, submissionNotifier]);

  const CustomDatePicker = ({
    id,
    maxDate,
    minDate,
    onChange,
    value,
    inputId,
    inputLabelText,
  }: CustomDatePickerProps) => {
    return (
      <>
        {isTablet ? (
          <Layer>
            <DatePicker
              id={id}
              datePickerType="single"
              dateFormat="d/m/Y"
              minDate={minDate}
              maxDate={maxDate}
              placeholder="dd/mm/yyyy"
              onChange={onChange}
              value={value}
            >
              <DatePickerInput id={inputId} labelText={inputLabelText} />
            </DatePicker>
          </Layer>
        ) : (
          <DatePicker
            id={id}
            datePickerType="single"
            dateFormat="d/m/Y"
            minDate={minDate}
            maxDate={maxDate}
            placeholder="dd/mm/yyyy"
            onChange={onChange}
            value={value}
          >
            <DatePickerInput id={inputId} labelText={inputLabelText} />
          </DatePicker>
        )}
      </>
    );
  };

  return (
    <div className={styles.formContainer}>
      <Stack gap={7}>
        <FormGroup legendText={t('condition', 'Condition')}>
          {isTablet ? (
            <Layer>
              <Search
                size="lg"
                id="conditionsSearch"
                labelText={t('enterCondition', 'Enter condition')}
                placeholder={t('searchConditions', 'Search conditions')}
                onChange={handleSearchTermChange}
                onClear={() => setSelectedCondition(null)}
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
            </Layer>
          ) : (
            <Search
              size="md"
              id="conditionsSearch"
              labelText={t('enterCondition', 'Enter condition')}
              placeholder={t('searchConditions', 'Search conditions')}
              onChange={handleSearchTermChange}
              onClear={() => setSelectedCondition(null)}
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
          )}
          <div>
            {(() => {
              if (!conditionToLookup || selectedCondition) return null;
              if (isSearchingConditions)
                return <InlineLoading className={styles.loader} description={t('searching', 'Searching') + '...'} />;
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
                  {isTablet ? (
                    <Layer>
                      <Tile className={styles.emptyResults}>
                        <span>
                          {t('noResultsFor', 'No results for')} <strong>"{conditionToLookup}"</strong>
                        </span>
                      </Tile>
                    </Layer>
                  ) : (
                    <Tile className={styles.emptyResults}>
                      <span>
                        {t('noResultsFor', 'No results for')} <strong>"{conditionToLookup}"</strong>
                      </span>
                    </Tile>
                  )}
                </>
              );
            })()}
          </div>
        </FormGroup>
        <FormGroup legendText="">
          <CustomDatePicker
            id="onsetDate"
            maxDate={dayjs().utc().format()}
            onChange={([date]) => setOnsetDate(date)}
            value={onsetDate}
            inputId="onsetDateInput"
            inputLabelText={t('onsetDate', 'Onset date')}
          />
        </FormGroup>
        <FormGroup legendText={t('currentStatus', 'Current status')}>
          <RadioButtonGroup
            defaultSelected="active"
            name="clinicalStatus"
            valueSelected="active"
            orientation="vertical"
            onChange={(status) => setClinicalStatus(status.toString())}
          >
            <RadioButton id="active" labelText="Active" value="active" />
            <RadioButton id="inactive" labelText="Inactive" value="inactive" />
          </RadioButtonGroup>
        </FormGroup>
        {clinicalStatus === 'inactive' && (
          <CustomDatePicker
            id="endDate"
            maxDate={dayjs().utc().format()}
            onChange={([date]) => setEndDate(date)}
            value={endDate}
            inputId="endDateInput"
            inputLabelText={t('endDate', 'End date')}
          />
        )}
      </Stack>
    </div>
  );
};

export default ConditionsWidget;
