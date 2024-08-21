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
import { LocationPicker } from '@openmrs/esm-framework'; // Check the import path is correct //location picker imported
import styles from './programs-form.scss';

interface ProgramsFormProps extends DefaultPatientWorkspaceProps {}

const ProgramsForm: React.FC<ProgramsFormProps> = ({
  patientUuid,
  closeWorkspaceWithSavedChanges,
  programEnrollmentId,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const session = useSession();
  const { data: availablePrograms } = useAvailablePrograms();
  const { data: enrollments, mutateEnrollments } = useEnrollments(patientUuid);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const programsFormSchema = useMemo(() => createProgramsFormSchema(t), [t]);

  const currentEnrollment = programEnrollmentId && enrollments.find((e) => e.uuid === programEnrollmentId);
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
      return session.sessionLocation.uuid;
    }
    return currentEnrollment?.location?.uuid ?? '';
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(programsFormSchema),
    defaultValues: {
      selectedProgram: currentEnrollment?.program.uuid ?? '',
      enrollmentDate: currentEnrollment?.dateEnrolled ? parseDate(currentEnrollment.dateEnrolled) : new Date(),
      completionDate: currentEnrollment?.dateCompleted ? parseDate(currentEnrollment.dateCompleted) : null,
      enrollmentLocation: getLocationUuid(),
    },
  });

  const onSubmit = async (data) => {
    setIsSubmittingForm(true);

    try {
      if (currentEnrollment) {
        await updateProgramEnrollment(currentEnrollment.uuid, data);
      } else {
        await createProgramEnrollment(patientUuid, data);
      }
      mutateEnrollments();
      showSnackbar({
        message: t('programEnrollmentSaved', 'Program enrollment saved successfully'),
        kind: 'success',
      });
      closeWorkspaceWithSavedChanges();
    } catch (error) {
      showSnackbar({
        message: t('programEnrollmentSaveFailed', 'Failed to save program enrollment'),
        kind: 'error',
      });
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const programSelect = (
    <Controller
      name="selectedProgram"
      control={control}
      render={({ field: { onChange, value } }) => (
        <Select
          aria-label="program selection"
          id="program"
          labelText={t('selectProgram', 'Select Program')}
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

  const locationPicker = (
    <Controller
      name="enrollmentLocation"
      control={control}
      render={({ field: { onChange, value } }) => (
        <LocationPicker
          selectedLocationUuid={value}
          defaultLocationUuid={session?.sessionLocation?.uuid}
          onChange={onChange}
          locationsPerRequest={10} // Adjust as needed or remove if unnecessary //the props are added
        />
      )}
    />
  );

  const formGroups = [
    {
      style: { maxWidth: isTablet ? '50%' : 'auto' },
      legendText: '',
      value: programSelect,
    },
    {
      style: { maxWidth: isTablet ? '50%' : 'auto' },
      legendText: '',
      value: locationPicker,
    },
  ];

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      {formGroups.map((group, index) => (
        <fieldset key={index} style={group.style}>
          <legend>{group.legendText}</legend>
          {group.value}
        </fieldset>
      ))}
      <ButtonSet>
        <Button kind="secondary" onClick={() => closeWorkspaceWithSavedChanges()}>
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
