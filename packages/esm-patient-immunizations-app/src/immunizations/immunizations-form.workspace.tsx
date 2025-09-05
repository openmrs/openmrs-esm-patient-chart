import React, { useEffect, useMemo, useState, useCallback } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, ButtonSet, Dropdown, Form, InlineLoading, Stack, TextArea, TextInput } from '@carbon/react';
import {
  getCoreTranslation,
  OpenmrsDatePicker,
  parseDate,
  ResponsiveWrapper,
  showSnackbar,
  useConfig,
  useLayoutType,
  useSession,
  useVisit,
} from '@openmrs/esm-framework';
import { type DefaultPatientWorkspaceProps } from '@openmrs/esm-patient-common-lib';
import { DoseInput } from './components/dose-input.component';
import { immunizationFormSub } from './utils';
import { mapToFHIRImmunizationResource } from './immunization-mapper';
import { savePatientImmunization } from './immunizations.resource';
import { type ImmunizationConfigObject } from '../config-schema';
import { type ImmunizationFormData } from '../types';
import { useImmunizations } from '../hooks/useImmunizations';
import { useImmunizationsConceptSet } from '../hooks/useImmunizationsConceptSet';
import styles from './immunizations-form.scss';

const ImmunizationsForm: React.FC<DefaultPatientWorkspaceProps> = ({
  patient,
  patientUuid,
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  promptBeforeClosing,
}) => {
  const config = useConfig<ImmunizationConfigObject>();
  const currentUser = useSession();
  const isTablet = useLayoutType() === 'tablet';
  const { t } = useTranslation();
  const { currentVisit } = useVisit(patientUuid);
  const { immunizationsConceptSet } = useImmunizationsConceptSet(config);
  const { mutate } = useImmunizations(patientUuid);

  const [immunizationToEditMeta, setImmunizationToEditMeta] = useState<{
    immunizationObsUuid: string;
    visitUuid?: string;
  }>();

  const immunizationFormSchema = useMemo(() => {
    return z.object({
      vaccineUuid: z.string().min(1, t('vaccineRequired', 'Vaccine is required')),
      vaccinationDate: z
        .date()
        .min(new Date(patient.birthDate), {
          message: t('vaccinationDateCannotBeBeforeBirthDate', 'Vaccination date cannot precede birth date'),
        })
        .refine(
          (date) => {
            // Normalize both dates to start of day in local timezone
            const inputDate = dayjs(date).startOf('day');
            const today = dayjs().startOf('day');
            return inputDate.isSame(today) || inputDate.isBefore(today);
          },
          {
            message: t('vaccinationDateCannotBeInTheFuture', 'Vaccination date cannot be in the future'),
          },
        ),
      // null means unset; when provided, must be an integer ≥ 1
      doseNumber: z.union([z.number({ coerce: true }).int().min(1), z.null()]).optional(),
      note: z.string().trim().max(255).optional(),
      nextDoseDate: z.date().nullable().optional(),
      expirationDate: z.date().nullable().optional(),
      lotNumber: z.string().nullable().optional(),
      manufacturer: z.string().nullable().optional(),
    });
  }, [patient.birthDate, t]);

  type ImmunizationFormInputData = z.infer<typeof immunizationFormSchema>;
  const formProps = useForm<ImmunizationFormInputData>({
    mode: 'all',
    resolver: zodResolver(immunizationFormSchema),
    defaultValues: {
      vaccineUuid: '',
      vaccinationDate: dayjs().startOf('day').toDate(),
      doseNumber: 1,
      nextDoseDate: null,
      note: '',
      expirationDate: null,
      lotNumber: '',
      manufacturer: '',
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
    watch,
  } = formProps;
  const vaccinationDate = watch('vaccinationDate');

  useEffect(() => {
    promptBeforeClosing(() => isDirty);
  }, [isDirty, promptBeforeClosing]);

  const vaccineUuid = watch('vaccineUuid');

  useEffect(() => {
    const sub = immunizationFormSub.subscribe((props) => {
      if (props) {
        const vaccinationDateOrNow = props.vaccinationDate ? parseDate(props.vaccinationDate) : new Date();
        reset({
          vaccineUuid: props.vaccineUuid,
          vaccinationDate: vaccinationDateOrNow,
          doseNumber: props.doseNumber,
          nextDoseDate: props.nextDoseDate ? parseDate(props.nextDoseDate) : null,
          note: props.note,
          expirationDate: props.expirationDate ? parseDate(props.expirationDate) : null,
          lotNumber: props.lotNumber,
          manufacturer: props.manufacturer,
        });
        setImmunizationToEditMeta({ immunizationObsUuid: props.immunizationId, visitUuid: props.visitId });
      }
    });

    return () => {
      sub.unsubscribe();
      immunizationFormSub.next(null);
    };
  }, [reset]);

  const onSubmit = useCallback(
    async (data: ImmunizationFormInputData) => {
      try {
        const {
          vaccineUuid,
          vaccinationDate,
          doseNumber,
          expirationDate,
          lotNumber,
          manufacturer,
          note,
          nextDoseDate,
        } = data;
        const abortController = new AbortController();

        const immunization: ImmunizationFormData = {
          patientUuid,
          immunizationId: immunizationToEditMeta?.immunizationObsUuid,
          vaccineName: immunizationsConceptSet.answers.find((answer) => answer.uuid === vaccineUuid).display,
          vaccineUuid: vaccineUuid,
          vaccinationDate: dayjs(vaccinationDate).startOf('day').toDate().toISOString(),
          doseNumber,
          nextDoseDate: nextDoseDate ? dayjs(nextDoseDate).startOf('day').toDate().toISOString() : null,
          note,
          expirationDate: expirationDate ? dayjs(expirationDate).startOf('day').toDate().toISOString() : null,
          lotNumber,
          manufacturer,
        };

        await savePatientImmunization(
          mapToFHIRImmunizationResource(
            immunization,
            immunizationToEditMeta?.visitUuid || currentVisit?.uuid,
            currentUser?.sessionLocation?.uuid,
            currentUser?.currentProvider?.uuid,
          ),
          immunizationToEditMeta?.immunizationObsUuid,
          abortController,
        );
        closeWorkspaceWithSavedChanges();
        mutate();
        showSnackbar({
          kind: 'success',
          title: t('vaccinationSaved', 'Vaccination saved successfully'),
          isLowContrast: true,
        });
      } catch (err) {
        showSnackbar({
          title: t('errorSaving', 'Error saving vaccination'),
          kind: 'error',
          isLowContrast: false,
          subtitle: err?.message,
        });
      }
    },
    [
      currentUser?.sessionLocation?.uuid,
      patientUuid,
      currentUser?.currentProvider?.uuid,
      currentVisit?.uuid,
      immunizationToEditMeta,
      immunizationsConceptSet,
      closeWorkspaceWithSavedChanges,
      t,
      mutate,
    ],
  );
  return (
    <FormProvider {...formProps}>
      <Form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <Stack gap={5} className={styles.container}>
          <ResponsiveWrapper>
            <Controller
              name="vaccinationDate"
              control={control}
              render={({ field, fieldState }) => (
                <OpenmrsDatePicker
                  {...field}
                  className={styles.datePicker}
                  id="vaccinationDate"
                  invalid={Boolean(fieldState?.error?.message)}
                  invalidText={fieldState?.error?.message}
                  labelText={t('vaccinationDate', 'Vaccination date')}
                  maxDate={new Date()}
                />
              )}
            />
          </ResponsiveWrapper>
          <ResponsiveWrapper>
            <Controller
              name="vaccineUuid"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Dropdown
                  disabled={!!immunizationToEditMeta}
                  id="immunization"
                  invalid={!!errors?.vaccineUuid}
                  invalidText={errors?.vaccineUuid?.message}
                  itemToString={(item) =>
                    immunizationsConceptSet?.answers.find((candidate) => candidate.uuid == item)?.display
                  }
                  items={immunizationsConceptSet?.answers?.map((item) => item.uuid) || []}
                  label={t('selectImmunization', 'Select immunization')}
                  onChange={(val) => onChange(val.selectedItem)}
                  selectedItem={value}
                  titleText={t('immunization', 'Immunization')}
                />
              )}
            />
          </ResponsiveWrapper>
          {vaccineUuid && (
            <ResponsiveWrapper>
              <DoseInput vaccine={vaccineUuid} sequences={config.sequenceDefinitions} control={control} />
            </ResponsiveWrapper>
          )}
          <div className={styles.vaccineBatchHeading}>{t('vaccineBatchInformation', 'Vaccine Batch Information')}</div>
          <ResponsiveWrapper>
            <Controller
              name="manufacturer"
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  id="manufacturer"
                  labelText={t('manufacturer', 'Manufacturer')}
                  onChange={(evt) => onChange(evt.target.value)}
                  type="text"
                  value={value}
                />
              )}
            />
          </ResponsiveWrapper>
          <ResponsiveWrapper>
            <Controller
              name="lotNumber"
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  id="lotNumber"
                  labelText={t('lotNumber', 'Lot Number')}
                  onChange={(evt) => onChange(evt.target.value)}
                  type="text"
                  value={value}
                />
              )}
            />
          </ResponsiveWrapper>
          <ResponsiveWrapper>
            <Controller
              name="expirationDate"
              control={control}
              render={({ field, fieldState }) => (
                <OpenmrsDatePicker
                  {...field}
                  className={styles.datePicker}
                  id="vaccinationExpiration"
                  invalid={Boolean(fieldState?.error?.message)}
                  invalidText={fieldState?.error?.message}
                  labelText={t('expirationDate', 'Expiration date')}
                  minDate={vaccinationDate}
                />
              )}
            />
          </ResponsiveWrapper>
          <ResponsiveWrapper>
            <Controller
              name="note"
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextArea
                  enableCounter
                  id="note"
                  invalidText={errors?.note?.message}
                  labelText={t('note', 'Note')}
                  maxCount={255}
                  onChange={(evt) => onChange(evt.target.value)}
                  placeholder={t('immunizationNotePlaceholder', 'For example: mild redness at injection site')}
                  value={value}
                />
              )}
            />
          </ResponsiveWrapper>
          <ResponsiveWrapper>
            <Controller
              name="nextDoseDate"
              control={control}
              render={({ field, fieldState }) => (
                <OpenmrsDatePicker
                  {...field}
                  className={styles.datePicker}
                  id="nextDoseDate"
                  invalid={Boolean(fieldState?.error?.message)}
                  invalidText={fieldState?.error?.message}
                  labelText={t('nextDoseDate', 'Next dose date')}
                  minDate={vaccinationDate}
                />
              )}
            />
          </ResponsiveWrapper>
        </Stack>
        <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
          <Button className={styles.button} kind="secondary" onClick={() => closeWorkspace()}>
            {getCoreTranslation('cancel')}
          </Button>
          <Button className={styles.button} kind="primary" disabled={isSubmitting} type="submit">
            {isSubmitting ? (
              <InlineLoading className={styles.spinner} description={t('saving', 'Saving') + '...'} />
            ) : (
              <span>{getCoreTranslation('save')}</span>
            )}
          </Button>
        </ButtonSet>
      </Form>
    </FormProvider>
  );
};

export default ImmunizationsForm;
