import React, { SyntheticEvent, useEffect } from 'react';
import dayjs from 'dayjs';
import 'dayjs/plugin/utc';
import debounce from 'lodash-es/debounce';
import { useSWRConfig } from 'swr';
import styles from './conditions-form.scss';
import { useTranslation } from 'react-i18next';
import {
  createErrorHandler,
  fhirBaseUrl,
  showNotification,
  showToast,
  useLayoutType,
  useSession,
} from '@openmrs/esm-framework';
import {
  Tile,
  SearchSkeleton,
  Search,
  RadioButtonGroup,
  RadioButton,
  FormGroup,
  DatePickerInput,
  DatePicker,
} from 'carbon-components-react';
import { createPatientCondition, searchConditionConcepts, CodedCondition } from './conditions.resource';
import { BehaviorSubject } from 'rxjs';

const searchTimeoutInMs = 500;

interface ConditionsWidgetProps {
  patientUuid: string;
  closeWorkspace?: () => void;
  setHasSubmissibleValue?: (value: boolean) => void;
  submissionNotifier: BehaviorSubject<{ isSubmitting: boolean }>;
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
  const [clinicalStatus, setClinicalStatus] = React.useState('active');
  const [endDate, setEndDate] = React.useState(null);
  const [onsetDate, setOnsetDate] = React.useState(new Date());
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState<null | string>('');
  const [searchResults, setSearchResults] = React.useState<null | Array<CodedCondition>>(null);
  const [selectedCondition, setSelectedCondition] = React.useState(null);

  useEffect(() => {
    if (setHasSubmissibleValue) {
      setHasSubmissibleValue(!!selectedCondition);
    }
  }, [selectedCondition, setHasSubmissibleValue]);

  const handleSearchChange = (event) => {
    setSelectedCondition(null);
    setIsSearching(true);
    const query = event.target.value;
    setSearchTerm(query);
    if (query) {
      debouncedSearch(query);
    }
  };

  const debouncedSearch = React.useMemo(
    () =>
      debounce((searchTerm) => {
        if (searchTerm) {
          const sub = searchConditionConcepts(searchTerm).subscribe(
            (searchResults: Array<CodedCondition>) => {
              setSearchResults(searchResults);
              setIsSearching(false);
            },
            () => createErrorHandler(),
          );
          return () => {
            sub.unsubscribe();
          };
        }
      }, searchTimeoutInMs),
    [],
  );

  const handleConditionChange = React.useCallback((selectedCondition: CodedCondition) => {
    setSelectedCondition(selectedCondition);
    setSearchTerm('');
  }, []);

  const handleSubmit = React.useCallback(() => {
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

  return (
    <div className={styles.formContainer}>
      <FormGroup legendText={t('condition', 'Condition')}>
        <Search
          light={isTablet}
          size="xl"
          id="conditionsSearch"
          labelText={t('enterCondition', 'Enter condition')}
          placeholder={t('searchConditions', 'Search conditions')}
          onChange={handleSearchChange}
          value={(() => {
            if (searchTerm) {
              return searchTerm;
            }
            if (selectedCondition && !isSearching) {
              return selectedCondition.display;
            }
            return '';
          })()}
        />
        <div>
          {(() => {
            if (!searchTerm || selectedCondition) return null;
            if (isSearching) return <SearchSkeleton role="progressbar" />;
            if (searchResults && searchResults.length) {
              return (
                <ul className={styles.conditionsList}>
                  {searchResults.map((condition, index) => (
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
              <Tile light={isTablet} className={styles.emptyResults}>
                <span>
                  {t('noResultsFor', 'No results for')} <strong>"{searchTerm}"</strong>
                </span>
              </Tile>
            );
          })()}
        </div>
      </FormGroup>
      <FormGroup legendText={t('onsetDate', 'Onset date')}>
        <DatePicker
          id="onsetDate"
          datePickerType="single"
          dateFormat="d/m/Y"
          maxDate={new Date().toISOString()}
          placeholder="dd/mm/yyyy"
          onChange={([date]) => setOnsetDate(date)}
          value={onsetDate}
          light={isTablet}
        >
          <DatePickerInput id="onsetDateInput" labelText="" />
        </DatePicker>
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
        <DatePicker
          id="endDate"
          datePickerType="single"
          dateFormat="d/m/Y"
          minDate={new Date(onsetDate).toISOString()}
          maxDate={dayjs().utc().format()}
          placeholder="dd/mm/yyyy"
          onChange={([date]) => setEndDate(date)}
          value={endDate}
          light={isTablet}
        >
          <DatePickerInput id="endDateInput" labelText={t('endDate', 'End date')} />
        </DatePicker>
      )}
    </div>
  );
};

export default ConditionsWidget;
