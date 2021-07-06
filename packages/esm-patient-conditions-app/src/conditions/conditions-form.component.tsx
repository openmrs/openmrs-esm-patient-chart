import React, { SyntheticEvent } from 'react';
import dayjs from 'dayjs';
import debounce from 'lodash-es/debounce';
import { useTranslation } from 'react-i18next';
import { createErrorHandler, detach, showNotification, showToast, useSessionUser } from '@openmrs/esm-framework';
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
const searchTimeoutInMs = 500;

interface Idle {
  type: ActionTypes.idle;
}

interface Search {
  isSearching: boolean;
  searchTerm: string;
  searchResults: Array<CodedCondition>;
  type: ActionTypes.search;
}

interface SelectCondition {
  condition: CodedCondition;
  type: ActionTypes.selectCondition;
}

interface Submit {
  type: ActionTypes.submit;
}

type Action = Idle | Search | SelectCondition | Submit;

interface ViewState {
  status: string;
  condition?: CodedCondition;
  isSearching?: boolean;
  searchResults?: Array<CodedCondition>;
  searchTerm?: string;
}

enum ActionTypes {
  idle = 'idle',
  search = 'search',
  selectCondition = 'selectCondition',
  submit = 'submit',
}

function viewStateReducer(state: ViewState, action: Action): ViewState {
  switch (action.type) {
    case ActionTypes.idle:
      return {
        status: 'idle',
      };
    case ActionTypes.search:
      return {
        ...state,
        status: 'search',
        isSearching: action.isSearching,
        searchResults: action.searchResults,
        searchTerm: action.searchTerm,
      };
    case ActionTypes.selectCondition:
      return {
        ...state,
        status: 'selectCondition',
        condition: action.condition,
      };
    case ActionTypes.submit:
      return {
        ...state,
        status: 'submit',
      };
    default:
      return state;
  }
}

const initialViewState: ViewState = {
  status: 'idle',
};

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
  const [viewState, dispatch] = React.useReducer(viewStateReducer, initialViewState);

  const handleSearchChange = (event) => {
    const query = event.target.value.trim();
    if (query) {
      dispatch({
        isSearching: true,
        searchResults: null,
        searchTerm: query,
        type: ActionTypes.search,
      });
      debouncedSearch(query);
    } else {
      dispatch({
        type: ActionTypes.idle,
      });
    }
  };

  const debouncedSearch = React.useMemo(
    () =>
      debounce((searchTerm) => {
        if (searchTerm) {
          const sub = searchConditionConcepts(searchTerm).subscribe(
            (searchResults: Array<CodedCondition>) =>
              dispatch({
                type: ActionTypes.search,
                isSearching: false,
                searchResults: searchResults,
                searchTerm: searchTerm,
              }),
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
    dispatch({
      type: ActionTypes.selectCondition,
      condition: selectedCondition,
    });
  }, []);

  const closeWorkspace = React.useCallback(
    () => detach('patient-chart-workspace-slot', 'conditions-form-workspace'),
    [],
  );

  const handleSubmit = React.useCallback(
    (event: SyntheticEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (viewState.status !== ActionTypes.selectCondition) return;

      const condition = viewState.condition;

      dispatch({
        type: ActionTypes.submit,
      });

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
          dispatch({
            type: ActionTypes.idle,
          });
        },
      );
      return () => {
        sub.unsubscribe();
      };
    },
    [clinicalStatus, closeWorkspace, endDate, onsetDate, patientUuid, session?.user?.uuid, t, viewState],
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
            switch (viewState.status) {
              case ActionTypes.search:
                return viewState.searchTerm;
              case ActionTypes.selectCondition:
                return viewState.condition.display;
              default:
                return '';
            }
          })()}
        />
        <div>
          {(() => {
            if (viewState.status !== ActionTypes.search) return null;
            if (viewState.isSearching) return <SearchSkeleton />;
            if (viewState.searchResults && viewState.searchResults.length) {
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
            }
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
          name="endDate"
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
        <Button
          style={{ width: '50%' }}
          kind="primary"
          type="submit"
          disabled={viewState.status !== ActionTypes.selectCondition}>
          {t('saveAndClose', 'Save & Close')}
        </Button>
      </div>
    </Form>
  );
};

export default ConditionsForm;
