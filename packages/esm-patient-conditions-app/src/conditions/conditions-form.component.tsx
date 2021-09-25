import React, { SyntheticEvent } from 'react';
import dayjs from 'dayjs';
import debounce from 'lodash-es/debounce';
import { mutate } from 'swr';
import styles from './conditions-form.scss';
import { useTranslation } from 'react-i18next';
import {
  createErrorHandler,
  detach,
  fhirBaseUrl,
  showNotification,
  showToast,
  useSessionUser,
} from '@openmrs/esm-framework';
import {
  Tile,
  SearchSkeleton,
  Search,
  Button,
  RadioButtonGroup,
  RadioButton,
  FormGroup,
  Form,
  DatePickerInput,
  DatePicker,
} from 'carbon-components-react';
import { createPatientCondition, searchConditionConcepts, CodedCondition } from './conditions.resource';

const searchTimeoutInMs = 500;

interface ConditionsFormProps {
  patientUuid: string;
  isTablet: boolean;
}

const ConditionsForm: React.FC<ConditionsFormProps> = ({ patientUuid, isTablet }) => {
  const { t } = useTranslation();
  const session = useSessionUser();
  const [clinicalStatus, setClinicalStatus] = React.useState('active');
  const [endDate, setEndDate] = React.useState(null);
  const [onsetDate, setOnsetDate] = React.useState(new Date());
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState<null | string>('');
  const [searchResults, setSearchResults] = React.useState<null | Array<CodedCondition>>(null);
  const [selectedCondition, setSelectedCondition] = React.useState(null);

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

  const closeWorkspace = React.useCallback(
    () => detach('patient-chart-workspace-slot', 'conditions-form-workspace'),
    [],
  );

  const handleSubmit = React.useCallback(
    (event: SyntheticEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!selectedCondition) return;

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
            closeWorkspace();

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
    },
    [clinicalStatus, closeWorkspace, endDate, onsetDate, patientUuid, selectedCondition, session?.user?.uuid, t],
  );

  return (
    <Form style={{ margin: '2rem' }} onSubmit={handleSubmit}>
      <FormGroup style={{ width: '50%' }} legendText={t('condition', 'Condition')}>
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
                      onClick={() => handleConditionChange(condition)}>
                      {condition.display}
                    </li>
                  ))}
                </ul>
              );
            }
            return (
              <Tile light className={styles.emptyResults}>
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
          light={isTablet}>
          <DatePickerInput id="onsetDateInput" labelText="" />
        </DatePicker>
      </FormGroup>
      <FormGroup legendText={t('currentStatus', 'Current status')}>
        <RadioButtonGroup
          defaultSelected="active"
          name="clinicalStatus"
          valueSelected="active"
          orientation="vertical"
          onChange={(status) => setClinicalStatus(status.toString())}>
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
          light={isTablet}>
          <DatePickerInput id="endDateInput" labelText={t('endDate', 'End date')} />
        </DatePicker>
      )}
      <div style={{ marginTop: '1.625rem' }}>
        <Button style={{ width: '50%' }} kind="secondary" type="button" onClick={closeWorkspace}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button style={{ width: '50%' }} kind="primary" type="submit" disabled={!selectedCondition}>
          {t('saveAndClose', 'Save & Close')}
        </Button>
      </div>
    </Form>
  );
};

export default ConditionsForm;
