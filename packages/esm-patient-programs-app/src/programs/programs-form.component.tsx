import React from 'react';
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
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createErrorHandler,
  showNotification,
  showToast,
  useSession,
  useLocations,
  useLayoutType,
  parseDate,
} from '@openmrs/esm-framework';
import { type DefaultWorkspaceProps } from '@openmrs/esm-patient-common-lib';
import {
  createProgramEnrollment,
  useAvailablePrograms,
  useEnrollments,
  updateProgramEnrollment,
} from './programs.resource';
import styles from './programs-form.scss';

interface ProgramsFormProps extends DefaultWorkspaceProps {
  programEnrollmentId?: string;
}

const programsFormSchema = z.object({
  selectedProgram: z.string().refine((value) => value != '', 'Please select a valid program'),
  enrollmentDate: z.date(),
  completionDate: z.date().nullable(),
  enrollmentLocation: z.string(),
});

export type ProgramsFormData = z.infer<typeof programsFormSchema>;

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

  const getLocationUuid = () => {
    if (!currentEnrollment?.location.uuid && session?.sessionLocation?.uuid) {
      return session?.sessionLocation?.uuid;
    }
    return currentEnrollment?.location.uuid ?? null;
  };

  const { control, handleSubmit, watch } = useForm<ProgramsFormData>({
    mode: 'all',
    resolver: zodResolver(programsFormSchema),
    defaultValues: {
      selectedProgram: currentEnrollment?.program.uuid ?? '',
      enrollmentDate: currentEnrollment?.dateEnrolled ? parseDate(currentEnrollment.dateEnrolled) : new Date(),
      completionDate: currentEnrollment?.dateCompleted ? parseDate(currentEnrollment.dateCompleted) : null,
      enrollmentLocation: getLocationUuid() ?? '',
    },
  });

  const onSubmit = React.useCallback(
    (data: ProgramsFormData) => {
      const { selectedProgram, enrollmentDate, completionDate, enrollmentLocation } = data;

      const payload = {
        patient: patientUuid,
        program: selectedProgram,
        dateEnrolled: enrollmentDate ? dayjs(enrollmentDate).format() : null,
        dateCompleted: completionDate ? dayjs(completionDate).format() : null,
        location: enrollmentLocation,
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
    [patientUuid, currentEnrollment, mutateEnrollments, closeWorkspace, t],
  );

  const programSelect = (
    <Controller
      name="selectedProgram"
      control={control}
      render={({ fieldState, field: { onChange, value } }) => (
        <>
          <Select
            aria-label="program name"
            id="program"
            invalidText={t('required', 'Required')}
            labelText=""
            onChange={(event) => onChange(event.target.value)}
            value={value}
          >
            <SelectItem text={t('chooseProgram', 'Choose a program')} value="" />
            {eligiblePrograms?.length > 0 &&
              eligiblePrograms.map((program) => (
                <SelectItem key={program.uuid} text={program.display} value={program.uuid}>
                  {program.display}
                </SelectItem>
              ))}
          </Select>
          <p className={styles.errorMessage}>{fieldState?.error?.message}</p>
        </>
      )}
    />
  );

  const enrollmentDate = (
    <Controller
      name="enrollmentDate"
      control={control}
      render={({ field: { onChange, value } }) => (
        <DatePicker
          aria-label="enrollment date"
          id="enrollmentDate"
          datePickerType="single"
          dateFormat="d/m/Y"
          maxDate={new Date().toISOString()}
          placeholder="dd/mm/yyyy"
          onChange={([date]) => onChange(date)}
          value={value}
        >
          <DatePickerInput id="enrollmentDateInput" labelText="" />
        </DatePicker>
      )}
    />
  );

  const completionDate = (
    <Controller
      name="completionDate"
      control={control}
      render={({ field: { onChange, value } }) => (
        <DatePicker
          aria-label="completion date"
          id="completionDate"
          datePickerType="single"
          dateFormat="d/m/Y"
          minDate={new Date(watch('enrollmentDate')).toISOString()}
          maxDate={new Date().toISOString()}
          placeholder="dd/mm/yyyy"
          onChange={([date]) => onChange(date)}
          value={value}
        >
          <DatePickerInput id="completionDateInput" labelText="" />
        </DatePicker>
      )}
    />
  );

  const enrollmentLocation = (
    <Controller
      name="enrollmentLocation"
      control={control}
      render={({ field: { onChange, value } }) => (
        <Select
          aria-label="enrollment location"
          id="location"
          invalidText="Required"
          labelText=""
          onChange={(event) => onChange(event.target.value)}
          value={value}
        >
          {availableLocations?.length > 0 &&
            availableLocations.map((location) => (
              <SelectItem key={location.uuid} text={location.display} value={location.uuid}>
                {location.display}
              </SelectItem>
            ))}
        </Select>
      )}
    />
  );

  const formGroups = [
    {
      style: { maxWidth: isTablet ? '50%' : 'fit-content' },
      legendText: t('programName', 'Program name'),
      value: programSelect,
    },
    {
      style: { maxWidth: '50%' },
      legendText: t('dateEnrolled', 'Date enrolled'),
      value: enrollmentDate,
    },
    {
      style: { width: '50%' },
      legendText: t('dateCompleted', 'Date completed'),
      value: completionDate,
    },
    {
      style: { width: '50%' },
      legendText: t('enrollmentLocation', 'Enrollment location'),
      value: enrollmentLocation,
    },
  ];
  return (
    <Form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <Stack className={styles.formContainer} gap={7}>
        {!eligiblePrograms.length && (
          <InlineNotification
            style={{ minWidth: '100%', margin: '0rem', padding: '0rem' }}
            kind={'error'}
            lowContrast
            subtitle={t('configurePrograms', 'Please configure programs to continue.')}
            title={t('noProgramsConfigured', 'No programs configured')}
          />
        )}
        {formGroups.map((group, i) => (
          <FormGroup style={group.style} legendText={group.legendText} key={i}>
            <div className={styles.selectContainer}>{isTablet ? <Layer>{group.value}</Layer> : group.value}</div>
          </FormGroup>
        ))}
      </Stack>
      <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
        <Button className={styles.button} kind="secondary" onClick={() => closeWorkspace()}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button className={styles.button} kind="primary" type="submit">
          {t('saveAndClose', 'Save and close')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default ProgramsForm;
