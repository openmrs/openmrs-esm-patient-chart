import React, { SyntheticEvent } from 'react';
import dayjs from 'dayjs';
import filter from 'lodash-es/filter';
import includes from 'lodash-es/includes';
import map from 'lodash-es/map';
import { useSWRConfig } from 'swr';
import styles from './programs-form.scss';
import { useTranslation } from 'react-i18next';
import {
  createErrorHandler,
  showNotification,
  showToast,
  useSessionUser,
  useLocations,
  useLayoutType,
} from '@openmrs/esm-framework';
import {
  Button,
  DatePicker,
  DatePickerInput,
  Select,
  SelectItem,
  Form,
  FormGroup,
  ButtonSet,
} from 'carbon-components-react';
import {
  createProgramEnrollment,
  useAvailablePrograms,
  useEnrollments,
  customRepresentation,
} from './programs.resource';
import { DefaultWorkspaceProps } from '@openmrs/esm-patient-common-lib';

const ProgramsForm: React.FC<DefaultWorkspaceProps> = ({ closeWorkspace, patientUuid }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const session = useSessionUser();
  const availableLocations = useLocations();
  const { mutate } = useSWRConfig();

  const { data: availablePrograms } = useAvailablePrograms();
  const { data: enrollments } = useEnrollments(patientUuid);

  const eligiblePrograms = filter(
    availablePrograms,
    (program) => !includes(map(enrollments, 'program.uuid'), program.uuid),
  );

  const [completionDate, setCompletionDate] = React.useState(null);
  const [enrollmentDate, setEnrollmentDate] = React.useState(new Date());
  const [selectedProgram, setSelectedProgram] = React.useState<string>('');
  const [userLocation, setUserLocation] = React.useState('');

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

            mutate(`/ws/rest/v1/programenrollment?patient=${patientUuid}&v=${customRepresentation}`);
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
    [closeWorkspace, completionDate, enrollmentDate, mutate, patientUuid, selectedProgram, t, userLocation],
  );

  return (
    <Form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formContainer}>
        <FormGroup style={{ width: '50%' }} legendText={t('program', 'Program')}>
          <div className={styles.selectContainer}>
            <Select
              id="program"
              invalidText={t('required', 'Required')}
              labelText=""
              light={isTablet}
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
          </div>
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
            value={enrollmentDate}
          >
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
            value={completionDate}
          >
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
        </FormGroup>
      </div>
      <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
        <Button className={styles.button} kind="secondary" onClick={closeWorkspace}>
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
