import React, { useCallback, useEffect, useMemo } from 'react';
import classNames from 'classnames';
import { type TFunction, useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import {
  Button,
  ButtonSet,
  Form,
  FormGroup,
  FormLabel,
  InlineLoading,
  InlineNotification,
  Layer,
  Select,
  SelectItem,
  Stack,
} from '@carbon/react';
import { z } from 'zod';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  OpenmrsDatePicker,
  parseDate,
  showSnackbar,
  useConfig,
  useLayoutType,
  useLocations,
  useSession,
  LocationPicker,
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
    completionDate: z.date().nullable(),
    enrollmentLocation: z.string(),
    selectedProgramStatus: z.string(),
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

      const payload = {
        patient: patientUuid,
        program: selectedProgram,
        dateEnrolled: enrollmentDate ? dayjs(enrollmentDate).format() : null,
        dateCompleted: completionDate ? dayjs(completionDate).format() : null,
        location: enrollmentLocation,
        states:
          !!selectedProgramStatus && selectedProgramStatus != currentState?.state.uuid
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
    <Controller
      name="enrollmentDate"
      control={control}
      render={({ field, fieldState }) => (
        <OpenmrsDatePicker
          {...field}
          id="enrollmentDate"
          data-testid="enrollmentDate"
          maxDate={new Date()}
          labelText={t('dateEnrolled', 'Date enrolled')}
          invalid={Boolean(fieldState?.error?.message)}
          invalidText={fieldState?.error?.message}
        />
      )}
    />
  );

  const completionDate = (
    <Controller
      name="completionDate"
      control={control}
      render={({ field, fieldState }) => (
        <OpenmrsDatePicker
          {...field}
          id="completionDate"
          data-testid="completionDate"
          minDate={new Date(watch('enrollmentDate'))}
          maxDate={new Date()}
          labelText={t('dateCompleted', 'Date completed')}
          invalid={Boolean(fieldState?.error?.message)}
          invalidText={fieldState?.error?.message}
        />
      )}
    />
  );

  const enrollmentLocation = (
    <Controller
      name="enrollmentLocation"
      control={control}
      render={({ field: { onChange, value } }) => (
        <LocationPicker
          selectedLocationUuid={value}
          defaultLocationUuid={session?.sessionLocation?.uuid}
          locationTag="Login Location"
          onChange={(locationUuid) => onChange(locationUuid)}
        />
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
