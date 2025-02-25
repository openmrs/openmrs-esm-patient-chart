import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  TimePickerSelect,
  TimePicker,
} from '@carbon/react';
import { z } from 'zod';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ResponsiveWrapper,
  parseDate,
  showSnackbar,
  useConfig,
  useLayoutType,
  useLocations,
  useSession,
} from '@openmrs/esm-framework';
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
    completionDate: z
      .date()
      .nullable()
      .refine((date) => !date || date <= new Date(), {
        message: t('completionDateFuture', 'Completion date cannot be in the future'),
      })
      .superRefine((date, ctx) => {
        const enrollmentDate = (ctx.parent as any).enrollmentDate;
        if (date && enrollmentDate && date < enrollmentDate) {
          ctx.addIssue({
            path: ['completionDate'],
            message: t('completionDateBeforeEnrollment', 'Completion date cannot be before enrollment date'),
            code: z.ZodIssueCode.custom,
          });
        }
      }),
    enrollmentLocation: z.string(),
    selectedProgramStatus: z.string(),
    enrollmentTime: z.string(),
    enrollmentTimeFormat: z.string(),
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
  const { showProgramStatusField } = useConfig<ConfigObject>();
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
    setValue,
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
      const { selectedProgram, enrollmentDate, completionDate, enrollmentLocation, selectedProgramStatus } = data;

      let finalCompletionDate: string | null = null;
      if (completionDate) {
        const today = dayjs().startOf('day');
        const completionDay = dayjs(completionDate).startOf('day');

        if (completionDay.isSame(today, 'day')) {
          finalCompletionDate = dayjs().utc().format();
        } else {
          finalCompletionDate = dayjs(completionDate).endOf('day').utc().format();
        }
      }

      const payload = {
        patient: patientUuid,
        program: selectedProgram,
        dateEnrolled: enrollmentDate ? dayjs(enrollmentDate).format() : null,
        dateCompleted: finalCompletionDate,
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

  const [selectedDate, setSelectedDate] = useState<Date | null>(
    currentEnrollment?.dateEnrolled ? parseDate(currentEnrollment.dateEnrolled) : new Date(),
  );
  const timepickerEnabled = true;
  const [selectedTime, setSelectedTime] = useState<string>(
    new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
  );

  const handleDateChange = (date: Date | null) => {
    if (date) {
      const dateWithMidnightTime = new Date(date);
      dateWithMidnightTime.setHours(0, 0, 0, 0);
      setValue('enrollmentDate', dateWithMidnightTime);
    }
  };

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const time = event.target.value;
    setSelectedTime(time);
    updateDateTime(selectedDate, time);
  };

  const updateDateTime = (date: Date | null, time: string) => {
    if (date) {
      const formattedTime = dayjs(time, 'h:mm A');
      const updatedDateTime = new Date(date);
      updatedDateTime.setHours(formattedTime.hour());
      updatedDateTime.setMinutes(formattedTime.minute());
      setValue('enrollmentDate', updatedDateTime);
    }
  };
  const enrollmentDate = (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
      <DatePicker
        aria-label="enrollment date"
        id="enrollmentDate"
        datePickerType="single"
        dateFormat="d/m/Y"
        maxDate={new Date().toISOString()}
        placeholder="dd/mm/yyyy"
        onChange={handleDateChange}
        value={selectedDate}
      >
        <DatePickerInput id="enrollmentDateInput" labelText={t('dateEnrolled', 'Date enrolled')} />
      </DatePicker>

      {timepickerEnabled && (
        <ResponsiveWrapper>
          <Controller
            name="enrollmentTime"
            control={control}
            render={({ field: { onBlur, onChange, value } }) => {
              const getCurrentTime = () => {
                const now = new Date();
                let hours = now.getHours();
                const minutes = now.getMinutes().toString().padStart(2, '0');
                const amPm = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12 || 12;
                return { time: `${hours}:${minutes}`, format: amPm };
              };

              if (!value) {
                const { time, format } = getCurrentTime();
                onChange(time);
                setValue('enrollmentTimeFormat', format);
              }

              return (
                <TimePicker
                  id="enrollmentTimePicker"
                  labelText={t('timeEnrolled', 'Time enrolled')}
                  onChange={(event) => {
                    handleTimeChange(event);
                    onChange(event.target.value);
                  }}
                  pattern="^(1[0-2]|0?[1-9]):([0-5]?[0-9])$"
                  value={value}
                  onBlur={onBlur}
                >
                  <Controller
                    name="enrollmentTimeFormat"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <TimePickerSelect
                        id="enrollmentTimeFormatSelect"
                        onChange={(event) => onChange(event.target.value)}
                        value={value}
                        aria-label={t('timeFormat', 'Time Format')}
                      >
                        <SelectItem value="AM" text="AM" />
                        <SelectItem value="PM" text="PM" />
                      </TimePickerSelect>
                    )}
                  />
                </TimePicker>
              );
            }}
          />
        </ResponsiveWrapper>
      )}
    </div>
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
          placeholder="dd/mm/yyyy"
          onChange={([date]) => onChange(date)}
          value={value}
        >
          <DatePickerInput id="completionDateInput" labelText={t('dateCompleted', 'Date completed')} />
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
