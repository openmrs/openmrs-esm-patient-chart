import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { type TFunction, useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import {
  Button,
  ButtonSet,
  DatePicker,
  DatePickerInput,
  Form,
  FormGroup,
  InlineLoading,
  InlineNotification,
  Layer,
  Select,
  SelectItem,
  Stack,
} from '@carbon/react';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { parseDate, showSnackbar, useLayoutType, useLocations, useSession } from '@openmrs/esm-framework';
import { type DefaultPatientWorkspaceProps } from '@openmrs/esm-patient-common-lib';
import {
  createProgramEnrollment,
  useAvailablePrograms,
  useEnrollments,
  updateProgramEnrollment,
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
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

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

  const isEnrolledInAllPrograms = useMemo(() => {
    if (!availablePrograms?.length || !enrollments?.length) {
      return false;
    }

    const activeEnrollments = enrollments.filter((enrollment) => !enrollment.dateCompleted);
    return activeEnrollments.length === availablePrograms.length;
  }, [availablePrograms, enrollments]);

  const getLocationUuid = () => {
    if (!currentEnrollment?.location.uuid && session?.sessionLocation?.uuid) {
      return session?.sessionLocation?.uuid;
    }
    return currentEnrollment?.location.uuid ?? null;
  };

  const {
    control,
    handleSubmit,
    watch,
    formState: { isDirty },
  } = useForm<ProgramsFormData>({
    mode: 'all',
    resolver: zodResolver(programsFormSchema),
    defaultValues: {
      selectedProgram: currentEnrollment?.program.uuid ?? '',
      enrollmentDate: currentEnrollment?.dateEnrolled ? parseDate(currentEnrollment.dateEnrolled) : new Date(),
      completionDate: currentEnrollment?.dateCompleted ? parseDate(currentEnrollment.dateCompleted) : null,
      enrollmentLocation: getLocationUuid() ?? '',
    },
  });

  useEffect(() => {
    promptBeforeClosing(() => isDirty);
  }, [isDirty, promptBeforeClosing]);

  const onSubmit = useCallback(
    async (data: ProgramsFormData) => {
      const { selectedProgram, enrollmentDate, completionDate, enrollmentLocation } = data;

      const payload = {
        patient: patientUuid,
        program: selectedProgram,
        dateEnrolled: enrollmentDate ? dayjs(enrollmentDate).format() : null,
        dateCompleted: completionDate ? dayjs(completionDate).format() : null,
        location: enrollmentLocation,
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

      setIsSubmittingForm(false);
    },
    [closeWorkspaceWithSavedChanges, currentEnrollment, mutateEnrollments, patientUuid, t],
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
            invalid={!!fieldState?.error}
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
          <DatePickerInput id="enrollmentDateInput" labelText={t('dateEnrolled', 'Date enrolled')} />
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

  const formGroups = [
    {
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

  return (
    <Form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <Stack className={styles.formContainer} gap={7}>
        {isEnrolledInAllPrograms && (
          <InlineNotification
            className={styles.notification}
            lowContrast
            subtitle={t('noEligibleEnrollments', 'There are no more programs left to enroll this patient in')}
            title={t('fullyEnrolled', 'Enrolled in all programs')}
          />
        )}
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
      <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
        <Button className={styles.button} kind="secondary" onClick={closeWorkspace}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button className={styles.button} kind="primary" type="submit">
          {isSubmittingForm ? (
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
