import React, { useCallback, useEffect, useMemo } from 'react';
import classNames from 'classnames';
import { type TFunction, useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import {
  Button,
  ButtonSet,
  DatePicker,
  DatePickerInput,
  Form,
  FormGroup,
  FormLabel,
  InlineLoading,
  InlineNotification,
  Layer,
  Select,
  SelectItem,
  Stack,
  TimePicker,
} from '@carbon/react';
import { z } from 'zod';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { parseDate, showSnackbar, useConfig, useLayoutType, useLocations, useSession } from '@openmrs/esm-framework';
import { type DefaultPatientWorkspaceProps } from '@openmrs/esm-patient-common-lib';
import { type ConfigObject } from '../config-schema';
import {
  createProgramEnrollment,
  useAvailablePrograms,
  useEnrollments,
  updateProgramEnrollment,
  findLastState,
} from './programs.resource';
import styles from './programs-form.scss';

interface ProgramsFormProps extends DefaultPatientWorkspaceProps {
  programEnrollmentId?: string;
}

const createProgramsFormSchema = (t: TFunction) =>
  z.object({
    selectedProgram: z.string().refine((value) => !!value, t('programRequired', 'Program is required')),
    enrollmentDate: z.date(),
    completionDate: z.date().nullable(),
    enrollmentLocation: z.string(),
    selectedProgramStatus: z.string(),
    enrollmentDateTime: z.string(),
  });

export type ProgramsFormData = z.infer<ReturnType<typeof createProgramsFormSchema>>;

const ProgramsForm: React.FC<ProgramsFormProps> = ({
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  patientUuid,
  programEnrollmentId,
  promptBeforeClosing,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const session = useSession();
  const availableLocations = useLocations();
  const { data: availablePrograms } = useAvailablePrograms();
  const { data: enrollments, mutateEnrollments } = useEnrollments(patientUuid);
  const { showProgramStatusField, allowCompletionTime } = useConfig<ConfigObject>();
  const inEditMode = Boolean(programEnrollmentId);

  const programsFormSchema = useMemo(() => createProgramsFormSchema(t), [t]);

  const currentEnrollment = programEnrollmentId && enrollments.filter((e) => e.uuid === programEnrollmentId)[0];
  const currentProgram = currentEnrollment
    ? {
        display: currentEnrollment.program.name,
        ...currentEnrollment.program,
      }
    : null;

  const eligiblePrograms = currentProgram
    ? [currentProgram]
    : availablePrograms.filter((program) => {
        const enrollment = enrollments.find((e) => e.program.uuid === program.uuid);
        return !enrollment || enrollment.dateCompleted !== null;
      });

  const getLocationUuid = () => {
    if (!currentEnrollment?.location?.uuid && session?.sessionLocation?.uuid) {
      return session?.sessionLocation?.uuid;
    }
    return currentEnrollment?.location?.uuid ?? null;
  };

  const currentState = currentEnrollment ? findLastState(currentEnrollment.states) : null;

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProgramsFormData>({
    mode: 'all',
    resolver: zodResolver(programsFormSchema),
    defaultValues: {
      selectedProgram: currentEnrollment?.program.uuid ?? '',
      enrollmentDate: currentEnrollment?.dateEnrolled ? parseDate(currentEnrollment.dateEnrolled) : new Date(),
      completionDate: currentEnrollment?.dateCompleted ? parseDate(currentEnrollment.dateCompleted) : null,
      enrollmentLocation: getLocationUuid() ?? '',
      selectedProgramStatus: currentState?.state.uuid ?? '',
    },
  });

  const selectedProgram = useWatch({ control, name: 'selectedProgram' });

  useEffect(() => {
    promptBeforeClosing(() => isDirty);
  }, [isDirty, promptBeforeClosing]);

  const onSubmit = useCallback(
    async (data: ProgramsFormData) => {
      const {
        selectedProgram,
        enrollmentDate,
        enrollmentDateTime,
        completionDate,
        enrollmentLocation,
        selectedProgramStatus,
      } = data;

      let formattedEnrollmentDate = dayjs(enrollmentDate).startOf('day').format();

      if (!dayjs(enrollmentDate).isSame(dayjs(), 'day')) {
        formattedEnrollmentDate = dayjs(enrollmentDate).endOf('day').utc(true).format();
      } else if (enrollmentDateTime) {
        const formattedEnrollmentDateTime = dayjs(enrollmentDateTime).format('HH:mm:ss');
        formattedEnrollmentDate = dayjs(`${dayjs(enrollmentDate).format('YYYY-MM-DD')} ${formattedEnrollmentDateTime}`)
          .utc(true)
          .format();
      }

      const formattedCompletionDate = completionDate ? dayjs(completionDate).startOf('day').format() : null;

      let formattedCompletionDateWithTime = formattedCompletionDate;
      if (formattedCompletionDate && dayjs(formattedCompletionDate).isSame(dayjs(), 'day')) {
        formattedCompletionDateWithTime = dayjs().utc().format();
      } else if (formattedCompletionDate && dayjs(formattedCompletionDate).isBefore(dayjs(), 'day')) {
        formattedCompletionDateWithTime = dayjs(formattedCompletionDate)
          .set('hour', 23)
          .set('minute', 59)
          .set('second', 59)
          .utc(true)
          .format();
      }

      const payload = {
        patient: patientUuid,
        program: selectedProgram,
        dateEnrolled: formattedEnrollmentDate,
        dateCompleted: dayjs(formattedCompletionDateWithTime).isSame(dayjs(), 'day')
          ? dayjs().utc().format()
          : dayjs(formattedCompletionDateWithTime).endOf('day').utc(true).format(),
        location: enrollmentLocation,
        states:
          !!selectedProgramStatus && selectedProgramStatus !== currentState?.state.uuid
            ? [{ state: { uuid: selectedProgramStatus } }]
            : [],
      };

      try {
        const abortController = new AbortController();

        if (currentEnrollment) {
          await updateProgramEnrollment(currentEnrollment.uuid, payload, abortController);
        } else {
          await createProgramEnrollment(payload, abortController);
        }

        await mutateEnrollments();
        closeWorkspaceWithSavedChanges();

        showSnackbar({
          kind: 'success',
          title: currentEnrollment
            ? t('enrollmentUpdated', 'Program enrollment updated')
            : t('enrollmentSaved', 'Program enrollment saved'),
          subtitle: currentEnrollment
            ? t('enrollmentUpdatesNowVisible', 'Changes to the program are now visible in the Programs table')
            : t('enrollmentNowVisible', 'It is now visible in the Programs table'),
        });
      } catch (error) {
        showSnackbar({
          kind: 'error',
          title: t('programEnrollmentSaveError', 'Error saving program enrollment'),
          subtitle: error instanceof Error ? error.message : 'An unknown error occurred',
        });
      }
    },
    [closeWorkspaceWithSavedChanges, currentEnrollment, currentState, mutateEnrollments, patientUuid, t],
  );

  const programName = (
    <FormGroup legendText={t('programName', 'Program name')}>
      <FormLabel className={styles.programName}>{currentProgram?.display}</FormLabel>
    </FormGroup>
  );

  const programSelect = (
    <Controller
      name="selectedProgram"
      control={control}
      render={({ field: { onChange, value } }) => (
        <Select
          aria-label="program name"
          id="program"
          invalid={!!errors?.selectedProgram}
          invalidText={errors?.selectedProgram?.message}
          labelText={t('programName', 'Program name')}
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
      )}
    />
  );

  const enrollmentDate = (
    <div className="flex items-center space-x-4">
      <Controller
        name="enrollmentDate"
        control={control}
        render={({ field: { onChange, value } }) => {
          const date = value ? new Date(value) : new Date();
          const dateValue = date.toISOString().split('T')[0];
          const timeValue = date.toTimeString().slice(0, 5);
          const isTimePickerDisabled = false;

          const handleDateChange = ([selectedDate]) => {
            if (selectedDate) {
              const combinedDate = new Date(selectedDate);

              if (isTimePickerDisabled) {
                combinedDate.setHours(0, 0, 0, 0);
              } else {
                const [hours, minutes] = timeValue.split(':').map(Number);
                combinedDate.setHours(hours, minutes);
              }
              onChange(combinedDate.toISOString());
            }
          };

          const handleTimeChange = (event) => {
            const time = event.target.value;
            if (dateValue) {
              const [hours, minutes] = time.split(':').map(Number);
              const combinedDate = new Date(dateValue);
              combinedDate.setHours(hours, minutes);
              onChange(combinedDate.toISOString());
            }
          };

          return (
            <>
              <DatePicker
                aria-label="enrollment date"
                id="enrollmentDate"
                datePickerType="single"
                dateFormat="d/m/Y"
                maxDate={new Date().toISOString()}
                placeholder="dd/mm/yyyy"
                onChange={handleDateChange}
                value={dateValue}
              >
                <DatePickerInput id="enrollmentDateInput" labelText={t('dateEnrolled', 'Date enrolled')} />
              </DatePicker>

              {!isTimePickerDisabled && (
                <TimePicker
                  id="enrollmentTime"
                  labelText={t('timeEnrolled', 'Time enrolled')}
                  onChange={handleTimeChange}
                  value={timeValue}
                  placeholder="HH:mm"
                  pattern="^([01]?[0-9]|2[0-3]):[0-5][0-9]$"
                  format="24hr"
                />
              )}
            </>
          );
        }}
      />
    </div>
  );

  const completionDate = (
    <Controller
      name="completionDate"
      control={control}
      render={({ field: { onChange, value } }) => (
        <>
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
            <DatePickerInput id="completionDateInput" labelText={t('dateCompleted', 'Date completed')} />
          </DatePicker>
          {allowCompletionTime && (
            <TimePicker
              id="completionTime"
              value={value ? dayjs(value).format('HH:mm') : ''}
              onChange={(time) =>
                onChange(
                  time
                    ? dayjs(value).set('hour', time.split(':')[0]).set('minute', time.split(':')[1]).toISOString()
                    : '',
                )
              }
              labelText={t('selectTime', 'Select time')}
            />
          )}
        </>
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
          labelText={t('enrollmentLocation', 'Enrollment location')}
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

  let workflowStates = [];
  if (!currentProgram && !!selectedProgram) {
    const program = eligiblePrograms.find((p) => p.uuid === selectedProgram);
    if (program?.allWorkflows.length > 0) workflowStates = program.allWorkflows[0].states;
  } else if (currentProgram?.allWorkflows.length > 0) {
    workflowStates = currentProgram.allWorkflows[0].states;
  }

  const programStatusDropdown = (
    <Controller
      name="selectedProgramStatus"
      control={control}
      render={({ field: { onChange, value } }) => (
        <Select
          aria-label={t('programStatus', 'Program status')}
          id="programStatus"
          invalid={!!errors?.selectedProgramStatus}
          invalidText={errors?.selectedProgramStatus?.message}
          labelText={t('programStatus', 'Program status')}
          onChange={(event) => onChange(event.target.value)}
          value={value}
        >
          <SelectItem text={t('chooseStatus', 'Choose a program status')} value="" />
          {workflowStates.map((state) => (
            <SelectItem key={state.uuid} text={state.concept.display} value={state.uuid}>
              {state.concept.display}
            </SelectItem>
          ))}
        </Select>
      )}
    />
  );

  const formGroups = [
    inEditMode
      ? {
          style: { maxWidth: isTablet && '50%' },
          legendText: '',
          value: programName,
        }
      : {
          style: { maxWidth: isTablet && '50%' },
          legendText: '',
          value: programSelect,
        },
    {
      style: { maxWidth: '50%' },
      legendText: '',
      value: enrollmentDate,
    },
    {
      style: { width: '50%' },
      legendText: '',
      value: completionDate,
    },
    {
      style: { width: '50%' },
      legendText: '',
      value: enrollmentLocation,
    },
  ];

  if (showProgramStatusField) {
    formGroups.push({
      style: { width: '50%' },
      legendText: '',
      value: programStatusDropdown,
    });
  }

  return (
    <Form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <Stack className={styles.formContainer} gap={7}>
        {!availablePrograms.length && (
          <InlineNotification
            className={styles.notification}
            kind="error"
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
      <ButtonSet className={classNames(isTablet ? styles.tablet : styles.desktop)}>
        <Button className={styles.button} kind="secondary" onClick={closeWorkspace}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button className={styles.button} disabled={isSubmitting} kind="primary" type="submit">
          {isSubmitting ? (
            <InlineLoading description={t('saving', 'Saving') + '...'} />
          ) : (
            <span>{t('saveAndClose', 'Save and close')}</span>
          )}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default ProgramsForm;
