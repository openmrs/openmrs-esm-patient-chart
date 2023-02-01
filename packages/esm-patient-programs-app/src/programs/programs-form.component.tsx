import React, { SyntheticEvent } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import filter from 'lodash-es/filter';
import includes from 'lodash-es/includes';
import map from 'lodash-es/map';
import {
  Button,
  ButtonSet,
  DatePicker,
  DatePickerInput,
  Form,
  FormGroup,
  InlineNotification,
  Layer,
  Select,
  SelectItem,
  Stack,
} from '@carbon/react';
import {
  createErrorHandler,
  showNotification,
  showToast,
  useSession,
  useLocations,
  useLayoutType,
  parseDate,
} from '@openmrs/esm-framework';
import { DefaultWorkspaceProps } from '@openmrs/esm-patient-common-lib';
import {
  createProgramEnrollment,
  useAvailablePrograms,
  useEnrollments,
  customRepresentation,
  updateProgramEnrollment,
} from './programs.resource';
import styles from './programs-form.scss';

interface ProgramsFormProps extends DefaultWorkspaceProps {
  programEnrollmentId?: string;
}

const ProgramsForm: React.FC<ProgramsFormProps> = ({ closeWorkspace, patientUuid, programEnrollmentId }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const session = useSession();
  const availableLocations = useLocations();
  const { data: availablePrograms } = useAvailablePrograms();
  const { data: enrollments, mutateEnrollments } = useEnrollments(patientUuid);

  const currentEnrollment = programEnrollmentId && enrollments.filter((e) => e.uuid == programEnrollmentId)[0];
  const currentProgram = currentEnrollment
    ? {
        display: currentEnrollment.program.name,
        ...currentEnrollment.program,
      }
    : null;

  const eligiblePrograms = currentProgram
    ? [currentProgram]
    : filter(availablePrograms, (program) => !includes(map(enrollments, 'program.uuid'), program.uuid));

  const [completionDate, setCompletionDate] = React.useState<Date>(
    currentEnrollment?.dateCompleted ? parseDate(currentEnrollment.dateCompleted) : null,
  );
  const [enrollmentDate, setEnrollmentDate] = React.useState<Date>(
    currentEnrollment?.dateEnrolled ? parseDate(currentEnrollment.dateEnrolled) : new Date(),
  );
  const [selectedProgram, setSelectedProgram] = React.useState<string>(currentEnrollment?.program.uuid ?? '');
  const [userLocation, setUserLocation] = React.useState<string>(currentEnrollment?.location.uuid ?? '');

  if (!userLocation && session?.sessionLocation?.uuid) {
    setUserLocation(session?.sessionLocation?.uuid);
  }

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
      const sub = currentEnrollment
        ? updateProgramEnrollment(currentEnrollment.uuid, payload, abortController).subscribe(
            (response) => {
              if (response.status === 200) {
                mutateEnrollments();
                closeWorkspace();

                showToast({
                  critical: true,
                  kind: 'success',
                  description: t(
                    'enrollmentUpdatesNowVisible',
                    'Changes to the program are now visible in the Programs table',
                  ),
                  title: t('enrollmentUpdated', 'Program enrollment updated'),
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
          )
        : createProgramEnrollment(payload, abortController).subscribe(
            (response) => {
              if (response.status === 201) {
                mutateEnrollments();
                closeWorkspace();

                showToast({
                  critical: true,
                  kind: 'success',
                  description: t('enrollmentNowVisible', 'It is now visible in the Programs table'),
                  title: t('enrollmentSaved', 'Program enrollment saved'),
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
          );
      return () => {
        sub.unsubscribe();
      };
    },
    [
      selectedProgram,
      patientUuid,
      enrollmentDate,
      completionDate,
      userLocation,
      currentEnrollment,
      mutateEnrollments,
      closeWorkspace,
      t,
    ],
  );
  const programSelect = (
    <Select
      id="program"
      invalidText={t('required', 'Required')}
      labelText=""
      onChange={(event) => setSelectedProgram(event.target.value)}
    >
      {!selectedProgram ? <SelectItem text={t('chooseProgram', 'Choose a program')} value="" /> : null}
      {eligiblePrograms?.length > 0 &&
        eligiblePrograms.map((program) => (
          <SelectItem key={program.uuid} text={program.display} value={program.uuid}>
            {program.display}
          </SelectItem>
        ))}
    </Select>
  );
  return (
    <Form className={styles.form} onSubmit={handleSubmit}>
      <Stack className={styles.formContainer} gap={7}>
        {!eligiblePrograms.length ? (
          <InlineNotification
            style={{ minWidth: '100%', margin: '0rem', padding: '0rem' }}
            kind={'error'}
            lowContrast
            subtitle={t('configurePrograms', 'Please configure programs to continue.')}
            title={t('noProgramsConfigured', 'No programs configured')}
          />
        ) : null}
        <FormGroup style={{ maxWidth: '50%' }} legendText={t('programName', 'Program name')}>
          <div className={styles.selectContainer}>{isTablet ? <Layer>{programSelect}</Layer> : programSelect}</div>
        </FormGroup>
        <FormGroup style={{ maxWidth: '50%' }} legendText={t('dateEnrolled', 'Date enrolled')}>
          {isTablet ? (
            <Layer>
              <DatePicker
                id="enrollmentDate"
                datePickerType="single"
                dateFormat="d/m/Y"
                maxDate={new Date().toISOString()}
                placeholder="dd/mm/yyyy"
                onChange={([date]) => setEnrollmentDate(date)}
                value={enrollmentDate}
              >
                <DatePickerInput id="enrollmentDateInput" labelText="" />
              </DatePicker>
            </Layer>
          ) : (
            <DatePicker
              id="enrollmentDate"
              datePickerType="single"
              dateFormat="d/m/Y"
              maxDate={new Date().toISOString()}
              placeholder="dd/mm/yyyy"
              onChange={([date]) => setEnrollmentDate(date)}
              value={enrollmentDate}
            >
              <DatePickerInput id="enrollmentDateInput" labelText="" />
            </DatePicker>
          )}
        </FormGroup>
        <FormGroup style={{ width: '50%' }} legendText={t('dateCompleted', 'Date completed')}>
          {isTablet ? (
            <Layer>
              <DatePicker
                id="completionDate"
                datePickerType="single"
                dateFormat="d/m/Y"
                minDate={new Date(enrollmentDate).toISOString()}
                maxDate={new Date().toISOString()}
                placeholder="dd/mm/yyyy"
                onChange={([date]) => setCompletionDate(date)}
                value={completionDate}
              >
                <DatePickerInput id="completionDateInput" labelText="" />
              </DatePicker>
            </Layer>
          ) : (
            <DatePicker
              id="completionDate"
              datePickerType="single"
              dateFormat="d/m/Y"
              minDate={new Date(enrollmentDate).toISOString()}
              maxDate={new Date().toISOString()}
              placeholder="dd/mm/yyyy"
              onChange={([date]) => setCompletionDate(date)}
              value={completionDate}
            >
              <DatePickerInput id="completionDateInput" labelText="" />
            </DatePicker>
          )}
        </FormGroup>
        <FormGroup style={{ width: '50%' }} legendText={t('enrollmentLocation', 'Enrollment location')}>
          {isTablet ? (
            <Layer>
              <Select
                id="location"
                invalidText="Required"
                labelText=""
                onChange={(event) => setUserLocation(event.target.value)}
                value={userLocation}
              >
                {!userLocation ? <SelectItem text={t('chooseLocation', 'Choose a location')} value="" /> : null}
                {availableLocations?.length > 0 &&
                  availableLocations.map((location) => (
                    <SelectItem key={location.uuid} text={location.display} value={location.uuid}>
                      {location.display}
                    </SelectItem>
                  ))}
              </Select>
            </Layer>
          ) : (
            <Select
              id="location"
              invalidText="Required"
              labelText=""
              onChange={(event) => setUserLocation(event.target.value)}
              value={userLocation}
            >
              {!userLocation ? <SelectItem text={t('chooseLocation', 'Choose a location')} value="" /> : null}
              {availableLocations?.length > 0 &&
                availableLocations.map((location) => (
                  <SelectItem key={location.uuid} text={location.display} value={location.uuid}>
                    {location.display}
                  </SelectItem>
                ))}
            </Select>
          )}
        </FormGroup>
      </Stack>
      <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
        <Button className={styles.button} kind="secondary" onClick={() => closeWorkspace()}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button className={styles.button} kind="primary" disabled={!selectedProgram} type="submit">
          {t('saveAndClose', 'Save and close')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default ProgramsForm;
