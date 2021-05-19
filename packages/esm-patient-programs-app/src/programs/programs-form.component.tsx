import React, { SyntheticEvent } from 'react';
import dayjs from 'dayjs';
import filter from 'lodash-es/filter';
import includes from 'lodash-es/includes';
import map from 'lodash-es/map';
import Button from 'carbon-components-react/es/components/Button';
import DatePicker from 'carbon-components-react/es/components/DatePicker';
import DatePickerInput from 'carbon-components-react/es/components/DatePickerInput';
import Select from 'carbon-components-react/es/components/Select';
import SelectItem from 'carbon-components-react/es/components/SelectItem';
import Form from 'carbon-components-react/es/components/Form';
import FormGroup from 'carbon-components-react/es/components/FormGroup';
import { useTranslation } from 'react-i18next';
import { createErrorHandler, showToast, useSessionUser } from '@openmrs/esm-framework';
import {
  createProgramEnrollment,
  fetchEnrolledPrograms,
  fetchLocations,
  fetchAvailablePrograms,
} from './programs.resource';
import { Program } from '../types';

interface ProgramsFormProps {
  closeWorkspace(): void;
  patientUuid: string;
}

enum StateTypes {
  IDLE,
  RESOLVED,
  SUBMITTING,
}

interface IdleState {
  type: StateTypes.IDLE;
}

interface ResolvedState {
  availablePrograms?: Array<Program>;
  eligiblePrograms?: Array<Program>;
  program: Program | null;
  type: StateTypes.RESOLVED;
}

interface SubmittingState {
  type: StateTypes.SUBMITTING;
}

type ViewState = IdleState | ResolvedState | SubmittingState;

const ProgramsForm: React.FC<ProgramsFormProps> = ({ patientUuid, closeWorkspace }) => {
  const { t } = useTranslation();
  const session = useSessionUser();
  const [availableLocations, setAvailableLocations] = React.useState(null);
  const [completionDate, setCompletionDate] = React.useState(null);
  const [enrollmentDate, setEnrollmentDate] = React.useState(new Date());
  const [userLocation, setUserLocation] = React.useState('');
  const [viewState, setViewState] = React.useState<ViewState>({
    type: StateTypes.IDLE,
  });

  if (!userLocation && session?.sessionLocation?.uuid) {
    setUserLocation(session?.sessionLocation?.uuid);
  }

  React.useEffect(() => {
    if (patientUuid) {
      const sub1 = fetchAvailablePrograms().subscribe(
        (availablePrograms) =>
          setViewState((state) => ({
            ...state,
            availablePrograms: availablePrograms,
            program: null,
            type: StateTypes.RESOLVED,
          })),
        () => createErrorHandler(),
        () => sub1.unsubscribe(),
      );

      const sub2 = fetchLocations().subscribe(
        (locations) => setAvailableLocations(locations),
        () => createErrorHandler(),
        () => sub2.unsubscribe(),
      );
    }
  }, [patientUuid]);

  React.useEffect(() => {
    if ((viewState as ResolvedState)?.availablePrograms) {
      const sub = fetchEnrolledPrograms(patientUuid).subscribe(
        (enrolledPrograms) =>
          setViewState((state) => ({
            ...state,
            availablePrograms: (viewState as ResolvedState)?.availablePrograms,
            eligiblePrograms: filter(
              (viewState as ResolvedState)?.availablePrograms,
              (program) => !includes(map(enrolledPrograms, 'program.uuid'), program.uuid),
            ),
            program: null,
            type: StateTypes.RESOLVED,
          })),
        () => createErrorHandler(),
        () => sub.unsubscribe(),
      );
    }
  }, [patientUuid, (viewState as ResolvedState)?.availablePrograms]);

  const handleSubmit = React.useCallback(
    (event: SyntheticEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (viewState.type !== StateTypes.RESOLVED) return;

      const program = viewState.program;
      setViewState({ type: StateTypes.SUBMITTING });

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
              description: t('programEnrollmentSaved', 'Program enrollment saved successfully'),
            });
          }
        },
        () => createErrorHandler(),
        () => {
          setViewState({ type: StateTypes.IDLE });
          sub.unsubscribe();
        },
      );
    },
    [closeWorkspace, completionDate, enrollmentDate, patientUuid, t, userLocation, viewState],
  );

  return (
    <Form style={{ margin: '2rem' }} onSubmit={handleSubmit}>
      <FormGroup style={{ width: '50%' }} legendText={t('program', 'Program')}>
        <Select
          id="program"
          invalidText={t('required', 'Required')}
          labelText=""
          light
          onChange={(event) => {
            setViewState({
              availablePrograms: (viewState as ResolvedState)?.availablePrograms,
              eligiblePrograms: (viewState as ResolvedState)?.eligiblePrograms,
              program: event.target.value,
              type: StateTypes.RESOLVED,
            });
          }}>
          {!(viewState as ResolvedState)?.program ? (
            <SelectItem text={t('chooseProgram', 'Choose a program')} value="" />
          ) : null}
          {(viewState as ResolvedState).eligiblePrograms?.length > 0 &&
            (viewState as ResolvedState).eligiblePrograms.map((program) => (
              <SelectItem key={program.uuid} text={program.display} value={program.uuid}>
                {program.display}
              </SelectItem>
            ))}
        </Select>
      </FormGroup>
      <FormGroup legendText={t('dateEnrolled', 'Date enrolled')}>
        <DatePicker
          id="enrollmentDate"
          datePickerType="single"
          dateFormat="d/m/Y"
          light
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
          light
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
          light
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
        <Button style={{ width: '50%' }} kind="primary" type="submit" disabled={!(viewState as ResolvedState).program}>
          {t('enroll', 'Enroll')}
        </Button>
      </div>
    </Form>
  );
};

export default ProgramsForm;
