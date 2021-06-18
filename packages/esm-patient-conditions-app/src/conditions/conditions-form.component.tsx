import React, { SyntheticEvent, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import debounce from 'lodash-es/debounce';
import { useTranslation } from 'react-i18next';
import {
  createErrorHandler,
  detach,
  showNotification,
  showToast,
  useLayoutType,
  useSessionUser,
} from '@openmrs/esm-framework';
import Button from 'carbon-components-react/es/components/Button';
import DatePicker from 'carbon-components-react/es/components/DatePicker';
import DatePickerInput from 'carbon-components-react/es/components/DatePickerInput';
import Form from 'carbon-components-react/es/components/Form';
import FormGroup from 'carbon-components-react/es/components/FormGroup';
import RadioButton from 'carbon-components-react/es/components/RadioButton';
import RadioButtonGroup from 'carbon-components-react/es/components/RadioButtonGroup';
import Search from 'carbon-components-react/es/components/Search';
import SearchSkeleton from 'carbon-components-react/es/components/Search/Search.Skeleton';
import { Tile } from 'carbon-components-react/es/components/Tile';
import { searchConditionConcepts, createPatientCondition, CodedCondition } from './conditions.resource';
import styles from './conditions-form.scss';
const searchTimeoutInMs = 300;

enum StateTypes {
  IDLE,
  SEARCH,
  CONDITION,
  SUBMIT,
}

interface ConditionsFormProps {
  patientUuid: string;
}

interface IdleState {
  type: StateTypes.IDLE;
}

interface SearchState {
  isSearching: boolean;
  type: StateTypes.SEARCH;
  searchTerm: string;
  searchResults?: Array<CodedCondition>;
}

interface ConditionState {
  condition: CodedCondition;
  type: StateTypes.CONDITION;
}

interface SubmitState {
  type: StateTypes.SUBMIT;
}

type ViewState = IdleState | SearchState | ConditionState | SubmitState;

const ConditionsForm: React.FC<ConditionsFormProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const session = useSessionUser();
  const layout = useLayoutType();
  const [clinicalStatus, setClinicalStatus] = React.useState('active');
  const [endDate, setEndDate] = React.useState(null);
  const [onsetDate, setOnsetDate] = React.useState(null);
  const [viewState, setViewState] = React.useState<ViewState>({
    type: StateTypes.IDLE,
  });
  const [lightMode, setLightMode] = useState<boolean>();

  useEffect(() => {
    layout === 'desktop' ? setLightMode(false) : setLightMode(true);
  }, [layout]);

  const closeWorkspace = React.useCallback(
    () => detach('patient-chart-workspace-slot', 'conditions-form-workspace'),
    [],
  );

  const handleConditionChange = React.useCallback((selectedCondition: CodedCondition) => {
    setViewState({
      type: StateTypes.CONDITION,
      condition: selectedCondition,
    });
  }, []);

  const handleSubmit = React.useCallback(
    (event: SyntheticEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (viewState.type !== StateTypes.CONDITION) return;

      const condition = viewState.condition;
      setViewState({ type: StateTypes.SUBMIT });

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
              code: condition?.concept?.uuid,
              display: condition?.concept?.display,
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
              kind: 'success',
              description: t('conditionSaved', 'Condition saved successfully'),
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
        () => {
          setViewState({ type: StateTypes.IDLE });
          sub.unsubscribe();
        },
      );
    },
    [t, clinicalStatus, closeWorkspace, endDate, onsetDate, patientUuid, session, viewState],
  );

  const debouncedSearch = React.useMemo(
    () =>
      debounce((searchTerm) => {
        if (searchTerm) {
          const sub = searchConditionConcepts(searchTerm).subscribe(
            (results: Array<CodedCondition>) => setViewState((state) => ({ ...state, searchResults: results })),
            () => createErrorHandler(),
            () => {
              setViewState((state) => ({ ...state, isSearching: false }));
              sub.unsubscribe();
            },
          );
        } else {
          setViewState((state) => ({ ...state, searchResults: null }));
        }
      }, searchTimeoutInMs),
    [],
  );

  const searchTerm = (viewState as SearchState).searchTerm;
  React.useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  return (
    <Form style={{ margin: '2rem' }} onSubmit={handleSubmit}>
      <FormGroup style={{ width: '50%' }} legendText={t('condition', 'Condition')}>
        <Search
          light={lightMode}
          size="xl"
          id="conditionsSearch"
          labelText={t('enterCondition', 'Enter condition')}
          placeholder={t('searchConditions', 'Search conditions')}
          onChange={(event) => {
            setViewState(
              event.target.value
                ? {
                    type: StateTypes.SEARCH,
                    searchTerm: event.target.value,
                    isSearching: true,
                    searchResults: null,
                  }
                : { type: StateTypes.IDLE },
            );
          }}
          value={(() => {
            switch (viewState.type) {
              case StateTypes.SEARCH:
                return viewState.searchTerm;
              case StateTypes.CONDITION:
                return viewState.condition.display;
              default:
                return '';
            }
          })()}
        />
        <div>
          {(() => {
            if (viewState.type !== StateTypes.SEARCH) return null;
            if (viewState.searchResults && viewState.searchResults.length)
              return (
                <ul className={styles.conditionsList}>
                  {viewState.searchResults.map((condition, index) => (
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
            if (viewState.isSearching) return <SearchSkeleton />;
            return (
              <Tile light className={styles.emptyResults}>
                <span>
                  {t('noResultsFor', 'No results for')} <strong>"{viewState.searchTerm}"</strong>
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
          name="onsetDate"
          placeholder="dd/mm/yyyy"
          onChange={([date]) => setOnsetDate(date)}
          value={onsetDate}
          light={lightMode}>
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
          name="endDate"
          placeholder="dd/mm/yyyy"
          onChange={([date]) => setEndDate(date)}
          value={endDate}
          light={lightMode}>
          <DatePickerInput id="endDateInput" labelText={t('endDate', 'End date')} />
        </DatePicker>
      )}
      <div style={{ marginTop: '1.625rem' }}>
        <Button style={{ width: '50%' }} kind="secondary" type="button" onClick={closeWorkspace}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button
          style={{ width: '50%' }}
          kind="primary"
          type="submit"
          disabled={viewState.type !== StateTypes.CONDITION}>
          {t('saveAndClose', 'Save & Close')}
        </Button>
      </div>
    </Form>
  );
};

export default ConditionsForm;
