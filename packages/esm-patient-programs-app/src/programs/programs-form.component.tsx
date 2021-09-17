import React, { SyntheticEvent } from 'react';
import dayjs from 'dayjs';
import filter from 'lodash-es/filter';
import includes from 'lodash-es/includes';
import map from 'lodash-es/map';
import styles from './programs-form.scss';
import { useTranslation } from 'react-i18next';
import { createErrorHandler, detach, showNotification, showToast, useSessionUser } from '@openmrs/esm-framework';
import {
  Button,
  DatePicker,
  DatePickerInput,
  InlineLoading,
  Select,
  SelectItem,
  Form,
  FormGroup,
} from 'carbon-components-react';
import {
  createProgramEnrollment,
  fetchEnrolledPrograms,
  fetchLocations,
  fetchAvailablePrograms,
} from './programs.resource';
import { Program } from '../types';

interface Idle {
  type: ActionTypes.idle;
}

interface SelectProgram {
  availablePrograms?: Array<Program>;
  eligiblePrograms?: Array<Program>;
  program: Program | null;
  type: ActionTypes.selectProgram;
}

interface Submit {
  type: ActionTypes.submit;
}

type Action = Idle | SelectProgram | Submit;

interface ViewState {
  status: string;
  program?: Program | null;
  availablePrograms?: Array<Program>;
  eligiblePrograms?: Array<Program>;
}

enum ActionTypes {
  idle = 'idle',
  selectProgram = 'selectProgram',
  submit = 'submit',
}

function viewStateReducer(state: ViewState, action: Action): ViewState {
  switch (action.type) {
    case ActionTypes.idle:
      return {
        status: 'idle',
      };
    case ActionTypes.selectProgram:
      return {
        ...state,
        status: 'selectProgram',
        availablePrograms: action.availablePrograms,
        eligiblePrograms: action.eligiblePrograms,
        program: action.program,
      };
    case ActionTypes.submit:
      return {
        status: 'submit',
      };
    default:
      return state;
  }
}

const initialViewState: ViewState = {
  status: 'idle',
};

interface ProgramsFormProps {
  patientUuid: string;
  isTablet: boolean;
}

const ProgramsForm: React.FC<ProgramsFormProps> = ({ patientUuid, isTablet }) => {
  const { t } = useTranslation();
  const session = useSessionUser();
  const [availableLocations, setAvailableLocations] = React.useState(null);
  const [completionDate, setCompletionDate] = React.useState(null);
  const [enrollmentDate, setEnrollmentDate] = React.useState(new Date());
  const [userLocation, setUserLocation] = React.useState('');
  const [viewState, dispatch] = React.useReducer(viewStateReducer, initialViewState);

  if (!userLocation && session?.sessionLocation?.uuid) {
    setUserLocation(session?.sessionLocation?.uuid);
  }

  function handleProgramChange(event) {
    dispatch({
      type: ActionTypes.selectProgram,
      program: event.target.value,
      availablePrograms: viewState.availablePrograms,
      eligiblePrograms: viewState.eligiblePrograms,
    });
  }

  React.useEffect(() => {
    if (patientUuid) {
      const sub1 = fetchAvailablePrograms().subscribe(
        (availablePrograms) =>
          dispatch({
            availablePrograms: availablePrograms,
            program: null,
            type: ActionTypes.selectProgram,
          }),
        () => createErrorHandler(),
      );

      const sub2 = fetchLocations().subscribe(
        (locations) => setAvailableLocations(locations),
        () => createErrorHandler(),
      );

      return () => {
        sub1.unsubscribe();
        sub2.unsubscribe();
      };
    }
  }, [patientUuid]);

  const availablePrograms = viewState.availablePrograms;
  React.useEffect(() => {
    if (availablePrograms) {
      const sub = fetchEnrolledPrograms(patientUuid).subscribe(
        (enrolledPrograms) => {
          dispatch({
            availablePrograms: availablePrograms,
            eligiblePrograms: filter(
              availablePrograms,
              (program) => !includes(map(enrolledPrograms, 'program.uuid'), program.uuid),
            ),
            program: null,
            type: ActionTypes.selectProgram,
          });
        },
        () => createErrorHandler(),
      );
      return () => sub.unsubscribe();
    }
  }, [patientUuid, availablePrograms]);

  const closeWorkspace = React.useCallback(() => detach('patient-chart-workspace-slot', 'programs-form-workspace'), []);

  const handleSubmit = React.useCallback(
    (event: SyntheticEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (viewState.status !== ActionTypes.selectProgram) return;

      const program = viewState.program;

      dispatch({
        type: ActionTypes.submit,
      });

      const payload = {
        patient: patientUuid,
        program: program,
        dateEnrolled: enrollmentDate ? dayjs(enrollmentDate).format() : null,
        dateCompleted: completionDate ? dayjs(completionDate).format() : null,
        location: userLocation,
      };

      const abortController = new AbortController();
      const sub = createProgramEnrollment(payload, abortController).subscribe(
        (response) => {
          if (response.status === 201) {
            closeWorkspace();

            showToast({
              kind: 'success',
              description: t('programEnrollmentSaved', 'Program enrollment saved successfully'),
            });
          }
        },
        (err) => {
          createErrorHandler();

          showNotification({
            title: t('programEnrollmentSaveError', 'Error saving program enrollment'),
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
    [closeWorkspace, completionDate, enrollmentDate, patientUuid, t, userLocation, viewState.program, viewState.status],
  );

  return (
    <Form style={{ margin: '2rem' }} onSubmit={handleSubmit}>
      <FormGroup style={{ width: '50%' }} legendText={t('program', 'Program')}>
        <div className={styles.selectContainer}>
          <Select
            id="program"
            invalidText={t('required', 'Required')}
            labelText=""
            light={isTablet}
            onChange={handleProgramChange}>
            {!viewState?.program ? <SelectItem text={t('chooseProgram', 'Choose a program')} value="" /> : null}
            {viewState.eligiblePrograms?.length > 0 &&
              viewState.eligiblePrograms.map((program) => (
                <SelectItem key={program.uuid} text={program.display} value={program.uuid}>
                  {program.display}
                </SelectItem>
              ))}
          </Select>
          {(() => {
            if (viewState.status !== ActionTypes.selectProgram) return null;
            if (!viewState.eligiblePrograms) return <InlineLoading className={styles.loading} />;
          })()}
        </div>
        {viewState.eligiblePrograms?.length === 0 &&
          showNotification({
            title: t('error', 'Error'),
            kind: 'error',
            critical: true,
            description: t('alreadyEnrolledText', 'This patient is already enrolled in all of the available programs'),
          })}
      </FormGroup>
      <FormGroup legendText={t('dateEnrolled', 'Date enrolled')}>
        <DatePicker
          id="enrollmentDate"
          datePickerType="single"
          dateFormat="d/m/Y"
          light={isTablet}
          maxDate={new Date().toISOString()}
          placeholder="dd/mm/yyyy"
          onChange={([date]) => setEnrollmentDate(date)}
          value={enrollmentDate}>
          <DatePickerInput id="enrollmentDateInput" labelText="" />
        </DatePicker>
      </FormGroup>
      <FormGroup legendText={t('dateCompleted', 'Date completed')}>
        <DatePicker
          id="completionDate"
          datePickerType="single"
          dateFormat="d/m/Y"
          light={isTablet}
          minDate={new Date(enrollmentDate).toISOString()}
          maxDate={new Date().toISOString()}
          placeholder="dd/mm/yyyy"
          onChange={([date]) => setCompletionDate(date)}
          value={completionDate}>
          <DatePickerInput id="completionDateInput" labelText="" />
        </DatePicker>
      </FormGroup>
      <FormGroup style={{ width: '50%' }} legendText={t('enrollmentLocation', 'Enrollment location')}>
        <Select
          id="location"
          invalidText="Required"
          labelText=""
          light={isTablet}
          onChange={(event) => setUserLocation(event.target.value)}
          value={userLocation}>
          {!userLocation ? <SelectItem text={t('chooseLocation', 'Choose a location')} value="" /> : null}
          {availableLocations?.length > 0 &&
            availableLocations.map((location) => (
              <SelectItem key={location.uuid} text={location.display} value={location.uuid}>
                {location.display}
              </SelectItem>
            ))}
        </Select>
      </FormGroup>
      <div style={{ marginTop: '1.625rem' }}>
        <Button style={{ width: '50%' }} kind="secondary" type="button" onClick={closeWorkspace}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button style={{ width: '50%' }} kind="primary" type="submit" disabled={!viewState.program}>
          {t('enroll', 'Enroll')}
        </Button>
      </div>
    </Form>
  );
};

export default ProgramsForm;
