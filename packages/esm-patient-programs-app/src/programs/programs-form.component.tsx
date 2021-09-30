import React, { SyntheticEvent } from 'react';
import dayjs from 'dayjs';
import { mutate } from 'swr';
import filter from 'lodash-es/filter';
import includes from 'lodash-es/includes';
import map from 'lodash-es/map';
import styles from './programs-form.scss';
import { useTranslation } from 'react-i18next';
import {
  createErrorHandler,
  detach,
  showNotification,
  showToast,
  useSessionUser,
  useLocations,
} from '@openmrs/esm-framework';
import { Button, DatePicker, DatePickerInput, Select, SelectItem, Form, FormGroup } from 'carbon-components-react';
import { createProgramEnrollment, useAvailablePrograms, useEnrollments } from './programs.resource';
import { Program } from '../types';

interface ProgramsFormProps {
  patientUuid: string;
  isTablet: boolean;
}

const ProgramsForm: React.FC<ProgramsFormProps> = ({ patientUuid, isTablet }) => {
  const { t } = useTranslation();
  const session = useSessionUser();
  const availableLocations = useLocations();

  const { data: availablePrograms } = useAvailablePrograms();
  const { data: enrollments } = useEnrollments(patientUuid);

  const eligiblePrograms = filter(
    availablePrograms,
    (program) => !includes(map(enrollments, 'program.uuid'), program.uuid),
  );

  const [completionDate, setCompletionDate] = React.useState(null);
  const [enrollmentDate, setEnrollmentDate] = React.useState(new Date());
  const [selectedProgram, setSelectedProgram] = React.useState<Program | null>(null);
  const [userLocation, setUserLocation] = React.useState('');

  if (!userLocation && session?.sessionLocation?.uuid) {
    setUserLocation(session?.sessionLocation?.uuid);
  }

  function handleProgramChange(event) {
    setSelectedProgram(event.target.value);
  }

  const closeWorkspace = React.useCallback(() => detach('patient-chart-workspace-slot', 'programs-form-workspace'), []);

  const handleSubmit = React.useCallback(
    (event: SyntheticEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!selectedProgram) return;

      const payload = {
        patient: patientUuid,
        program: selectedProgram,
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
              critical: true,
              kind: 'success',
              description: t('enrollmentNowVisible', 'It is now visible on the Programs page'),
              title: t('enrollmentSaved', 'Program enrollment saved'),
            });

            mutate(`/ws/rest/v1/programenrollment?patient=${patientUuid}`);
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
      );
      return () => {
        sub.unsubscribe();
      };
    },
    [closeWorkspace, completionDate, enrollmentDate, patientUuid, selectedProgram, t, userLocation],
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
            {!selectedProgram ? <SelectItem text={t('chooseProgram', 'Choose a program')} value="" /> : null}
            {eligiblePrograms?.length > 0 &&
              eligiblePrograms.map((program) => (
                <SelectItem key={program.uuid} text={program.display} value={program.uuid}>
                  {program.display}
                </SelectItem>
              ))}
          </Select>
        </div>
        {eligiblePrograms?.length === 0 &&
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
        <Button style={{ width: '50%' }} kind="primary" type="submit" disabled={!selectedProgram}>
          {t('enroll', 'Enroll')}
        </Button>
      </div>
    </Form>
  );
};

export default ProgramsForm;
