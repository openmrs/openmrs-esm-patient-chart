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
  ResponsiveWrapper,
  showSnackbar,
  toDateObjectStrict,
  toOmrsIsoString,
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
import { type ConfigObject } from '../config-schema';
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
  const currentUser = useSession();
  const isTablet = useLayoutType() === 'tablet';
  const { t } = useTranslation();
  const { currentVisit } = useVisit(patientUuid);
  const { immunizationsConfig } = useConfig<ConfigObject>();
  const { immunizationsConceptSet } = useImmunizationsConceptSet(immunizationsConfig);
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
        .refine((vaccinationDate) => vaccinationDate <= new Date(), {
          message: t('vaccinationDateCannotBeInTheFuture', 'Vaccination date cannot be in the future'),
        }),
      doseNumber: z
        .number()
        .nullable()
        // The backend will attempt to convert the dose number to a positive integer
        // so we need to set it to null if the value is less than 1
        .transform((value) => (value < 1 ? null : value)),
      note: z.string().trim().max(255).optional(),
      expirationDate: z.date().nullable(),
      lotNumber: z.string().nullable(),
      manufacturer: z.string().nullable(),
    });
  }, [patient.birthDate, t]);

  type ImmunizationFormInputData = z.infer<typeof immunizationFormSchema>;
  const formProps = useForm<ImmunizationFormInputData>({
    mode: 'all',
    resolver: zodResolver(immunizationFormSchema),
    defaultValues: {
      vaccineUuid: '',
      vaccinationDate: new Date(),
      doseNumber: 1,
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

  useEffect(() => {
    promptBeforeClosing(() => isDirty);
  }, [isDirty, promptBeforeClosing]);

  const vaccineUuid = watch('vaccineUuid');

  useEffect(() => {
    const sub = immunizationFormSub.subscribe((props) => {
      if (props) {
        const vaccinationDateOrNow = props.vaccinationDate || new Date();
        reset({
          vaccineUuid: props.vaccineUuid,
          vaccinationDate: vaccinationDateOrNow,
          doseNumber: props.doseNumber,
          note: props.note,
          expirationDate: props.expirationDate,
          lotNumber: props.lotNumber,
          manufacturer: props.manufacturer,
        });
        setImmunizationToEditMeta({ immunizationObsUuid: props.immunizationId, visitUuid: props.visitId });
      }
    });

    return () => {
      // cleanup
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
        } = data;
        const abortController = new AbortController();

        const immunization: ImmunizationFormData = {
          patientUuid,
          immunizationId: immunizationToEditMeta?.immunizationObsUuid,
          vaccineName: immunizationsConceptSet.answers.find((answer) => answer.uuid === vaccineUuid).display,
          vaccineUuid: vaccineUuid,
          vaccinationDate: toDateObjectStrict(toOmrsIsoString(dayjs(vaccinationDate).startOf('day').toDate())),
          doseNumber,
          note,
          expirationDate,
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
      <Form className={styles.form} onSubmit={handleSubmit(onSubmit)} data-testid="immunization-form">
        <Stack gap={5} className={styles.container}>
          <ResponsiveWrapper>
            <Controller
              name="vaccinationDate"
              control={control}
              render={({ field, fieldState }) => (
                <div className={styles.row}>
                  <OpenmrsDatePicker
                    {...field}
                    className={styles.datePicker}
                    data-testid="vaccinationDate"
                    id="vaccinationDate"
                    invalid={Boolean(fieldState?.error?.message)}
                    invalidText={fieldState?.error?.message}
                    labelText={t('vaccinationDate', 'Vaccination date')}
                    maxDate={new Date()}
                  />
                </div>
              )}
            />
          </ResponsiveWrapper>
          <ResponsiveWrapper>
            <Controller
              name="vaccineUuid"
              control={control}
              render={({ field: { onChange, value } }) => (
                <div className={styles.row}>
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
                </div>
              )}
            />
          </ResponsiveWrapper>
          {vaccineUuid && (
            <ResponsiveWrapper>
              <DoseInput vaccine={vaccineUuid} sequences={immunizationsConfig.sequenceDefinitions} control={control} />
            </ResponsiveWrapper>
          )}
          <section>
            <ResponsiveWrapper>
              <Controller
                name="note"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <div className={styles.row}>
                    <TextArea
                      enableCounter
                      id="note"
                      invalidText={errors?.note?.message}
                      labelText={t('note', 'Note')}
                      value={value}
                      onChange={(evt) => onChange(evt.target.value)}
                    />
                  </div>
                )}
              />
            </ResponsiveWrapper>
          </section>
          <div className={styles.vaccineBatchHeading}> {t('vaccineBatchInformation', 'Vaccine Batch Information')}</div>
          <ResponsiveWrapper>
            <Controller
              name="manufacturer"
              control={control}
              render={({ field: { onChange, value } }) => (
                <div className={styles.row}>
                  <TextInput
                    id="manufacturer"
                    labelText={t('manufacturer', 'Manufacturer')}
                    onChange={(evt) => onChange(evt.target.value)}
                    type="text"
                    value={value}
                  />
                </div>
              )}
            />
          </ResponsiveWrapper>
          <ResponsiveWrapper>
            <Controller
              name="lotNumber"
              control={control}
              render={({ field: { onChange, value } }) => (
                <div className={styles.row}>
                  <TextInput
                    id="lotNumber"
                    labelText={t('lotNumber', 'Lot Number')}
                    onChange={(evt) => onChange(evt.target.value)}
                    type="text"
                    value={value}
                  />
                </div>
              )}
            />
          </ResponsiveWrapper>
          <ResponsiveWrapper>
            <Controller
              name="expirationDate"
              control={control}
              render={({ field, fieldState }) => (
                <div className={styles.row}>
                  <OpenmrsDatePicker
                    {...field}
                    className={styles.datePicker}
                    data-testid="vaccinationExpiration"
                    id="vaccinationExpiration"
                    invalid={Boolean(fieldState?.error?.message)}
                    invalidText={fieldState?.error?.message}
                    labelText={t('expirationDate', 'Expiration date')}
                    minDate={immunizationToEditMeta ? null : new Date()}
                  />
                </div>
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
