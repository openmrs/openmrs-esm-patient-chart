import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  ButtonSkeleton,
  ButtonSet,
  Column,
  Form,
  InlineNotification,
  NumberInputSkeleton,
  Row,
  Stack,
} from '@carbon/react';
import {
  age,
  createErrorHandler,
  showSnackbar,
  useConfig,
  useLayoutType,
  useSession,
  ExtensionSlot,
  usePatient,
  useVisit,
} from '@openmrs/esm-framework';
import { type DefaultPatientWorkspaceProps } from '@openmrs/esm-patient-common-lib';
import type { ConfigObject } from '../config-schema';
import {
  calculateBodyMassIndex,
  extractNumbers,
  getMuacColorCode,
  isValueWithinReferenceRange,
} from './vitals-biometrics-form.utils';
import {
  assessValue,
  getReferenceRangesForConcept,
  interpretBloodPressure,
  invalidateCachedVitalsAndBiometrics,
  saveVitalsAndBiometrics as savePatientVitals,
  useVitalsConceptMetadata,
} from '../common';
import VitalsAndBiometricsInput from './vitals-biometrics-input.component';
import styles from './vitals-biometrics-form.scss';
import { type VitalsBiometricsFormData } from './types';

const VitalsAndBiometricsForm: React.FC<DefaultPatientWorkspaceProps> = ({
  patientUuid,
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  promptBeforeClosing,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const config = useConfig<ConfigObject>();
  const biometricsUnitsSymbols = config.biometrics;
  const useMuacColorStatus = config.vitals.useMuacColors;

  const session = useSession();
  const patient = usePatient(patientUuid);
  const { currentVisit } = useVisit(patientUuid);
  const { data: conceptUnits, conceptMetadata, conceptRanges, isLoading } = useVitalsConceptMetadata();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [muacColorCode, setMuacColorCode] = useState('');
  const [showFormSubmissionErrorNotifications, setShowFormSubmissionErrorNotifications] = useState(false);

  const concepts = useMemo(
    () => ({
      midUpperArmCircumference: conceptRanges.get(config.concepts.midUpperArmCircumferenceUuid),
      diastolicBloodPressure: conceptRanges.get(config.concepts.diastolicBloodPressureUuid),
      systolicBloodPressure: conceptRanges.get(config.concepts.systolicBloodPressureUuid),
      oxygenSaturation: conceptRanges.get(config.concepts.oxygenSaturationUuid),
      respiratoryRate: conceptRanges.get(config.concepts.respiratoryRateUuid),
      temperature: conceptRanges.get(config.concepts.temperatureUuid),
      weight: conceptRanges.get(config.concepts.weightUuid),
      height: conceptRanges.get(config.concepts.heightUuid),
      pulse: conceptRanges.get(config.concepts.pulseUuid),
    }),
    [
      conceptRanges,
      config.concepts.diastolicBloodPressureUuid,
      config.concepts.heightUuid,
      config.concepts.midUpperArmCircumferenceUuid,
      config.concepts.oxygenSaturationUuid,
      config.concepts.pulseUuid,
      config.concepts.respiratoryRateUuid,
      config.concepts.systolicBloodPressureUuid,
      config.concepts.temperatureUuid,
      config.concepts.weightUuid,
    ],
  );

  const VitalsAndBiometricFormSchema = useMemo(() => {
    const fieldKeyToLabelMap: Record<keyof VitalsBiometricsFormData, string> = {
      systolicBloodPressure: t('systolic', 'Systolic'),
      diastolicBloodPressure: t('diastolic', 'Diastolic'),
      respiratoryRate: t('respirationRate', 'Respiration rate'),
      oxygenSaturation: t('oxygenSaturation', 'Oxygen saturation'),
      pulse: t('pulse', 'Pulse'),
      temperature: t('temperature', 'Temperature'),
      generalPatientNote: t('notes', 'Notes'),
      weight: t('weight', 'Weight'),
      height: t('height', 'Height'),
      midUpperArmCircumference: t('muac', 'MUAC'),
      computedBodyMassIndex: t('bmi', 'BMI'),
    };
    function getMaxDecimalCountAllowedForField(key: keyof VitalsBiometricsFormData) {
      switch (key) {
        case 'temperature':
        case 'weight':
        case 'oxygenSaturation':
          return 1;

        default:
          return 0;
      }
    }

    const decimalRefinement = (key: keyof VitalsBiometricsFormData, schema: z.ZodNumber) => {
      const maxDecimalCountsAllowed = getMaxDecimalCountAllowedForField(key);
      return schema.refine(
        (value) => {
          if (value === undefined) {
            return true;
          }

          if (Math.floor(value) === value) {
            return true;
          }

          const decimalCount = value.toString().split('.')?.[1]?.length ?? 0;
          return decimalCount <= maxDecimalCountsAllowed;
        },
        maxDecimalCountsAllowed
          ? t('limitedDecimalPlacesAllowed', '{{fieldName}} value must be a number with {{count}} decimal places', {
              count: maxDecimalCountsAllowed,
              fieldName: fieldKeyToLabelMap[key],
            })
          : t('valueMustBeInteger', 'Value must be an integer'),
      );
    };

    const getZodNumberSchema = (key: keyof VitalsBiometricsFormData, min: number, max: number) => {
      let numberSchema = z.number();
      if (min) {
        numberSchema = numberSchema.min(
          min,
          t('validationInputError', '{{fieldName}} value must be between {{min}} and {{max}}', {
            min,
            max,
            fieldName: fieldKeyToLabelMap[key],
          }),
        );
      }
      if (max) {
        numberSchema = numberSchema.max(
          max,
          t('validationInputError', '{{fieldName}} value must be between {{min}} and {{max}}', {
            min,
            max,
            fieldName: fieldKeyToLabelMap[key],
          }),
        );
      }
      return decimalRefinement(key, numberSchema);
    };

    return z
      .object({
        systolicBloodPressure: getZodNumberSchema(
          'systolicBloodPressure',
          concepts.systolicBloodPressure.lowAbsolute,
          concepts.systolicBloodPressure.highAbsolute,
        ),
        diastolicBloodPressure: getZodNumberSchema(
          'diastolicBloodPressure',
          concepts.diastolicBloodPressure.lowAbsolute,
          concepts.diastolicBloodPressure.highAbsolute,
        ),
        respiratoryRate: getZodNumberSchema(
          'respiratoryRate',
          concepts.respiratoryRate.lowAbsolute,
          concepts.respiratoryRate.highAbsolute,
        ),
        oxygenSaturation: getZodNumberSchema(
          'oxygenSaturation',
          concepts.oxygenSaturation.lowAbsolute,
          concepts.oxygenSaturation.highAbsolute,
        ),
        pulse: getZodNumberSchema('pulse', concepts.pulse.lowAbsolute, concepts.pulse.highAbsolute),
        temperature: getZodNumberSchema(
          'temperature',
          concepts.temperature.lowAbsolute,
          concepts.temperature.highAbsolute,
        ),
        generalPatientNote: z.string(),
        weight: getZodNumberSchema('weight', concepts.weight.lowAbsolute, concepts.weight.highAbsolute),
        height: getZodNumberSchema('height', concepts.height.lowAbsolute, concepts.height.highAbsolute),
        midUpperArmCircumference: getZodNumberSchema(
          'midUpperArmCircumference',
          concepts.midUpperArmCircumference.lowAbsolute,
          concepts.midUpperArmCircumference.highAbsolute,
        ),
        computedBodyMassIndex: z.number(),
      })
      .partial()
      .refine(
        (fields) => {
          return Object.values(fields).some((value) => Boolean(value));
        },
        {
          message: t('fillAtleaseOneField', 'Please enter at least one vital sign field'),
          path: ['oneFieldRequired'],
        },
      );
  }, [t, concepts]);

  const methods = useForm<VitalsBiometricsFormData>({
    mode: 'all',
    resolver: zodResolver(VitalsAndBiometricFormSchema),
  });

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { isDirty, errors },
  } = methods;

  useEffect(() => {
    promptBeforeClosing(() => isDirty);
  }, [isDirty, promptBeforeClosing]);

  const encounterUuid = currentVisit?.encounters?.find((encounter) => encounter?.form?.uuid === config.vitals.formUuid)
    ?.uuid;

  const midUpperArmCircumference = watch('midUpperArmCircumference');
  const systolicBloodPressure = watch('systolicBloodPressure');
  const diastolicBloodPressure = watch('diastolicBloodPressure');
  const respiratoryRate = watch('respiratoryRate');
  const oxygenSaturation = watch('oxygenSaturation');
  const temperature = watch('temperature');
  const pulse = watch('pulse');
  const weight = watch('weight');
  const height = watch('height');

  useEffect(() => {
    getMuacColorCode(extractNumbers(age(patient.patient?.birthDate)), midUpperArmCircumference, setMuacColorCode);
  }, [watch, patient.patient?.birthDate, midUpperArmCircumference]);

  useEffect(() => {
    if (height && weight) {
      const computedBodyMassIndex = calculateBodyMassIndex(weight, height);
      setValue('computedBodyMassIndex', computedBodyMassIndex);
    }
  }, [weight, height, setValue]);

  function onError(err) {
    setShowFormSubmissionErrorNotifications(true);
  }

  const savePatientVitalsAndBiometrics = useCallback(
    (data: VitalsBiometricsFormData) => {
      const formData = data;
      setShowFormSubmissionErrorNotifications(false);

      data?.computedBodyMassIndex && delete data.computedBodyMassIndex;

      setIsSubmitting(true);

      savePatientVitals(
        config.vitals.encounterTypeUuid,
        config.vitals.formUuid,
        config.concepts,
        patientUuid,
        formData,
        session?.sessionLocation?.uuid,
      )
        .then((response) => {
          if (response.status === 201) {
            invalidateCachedVitalsAndBiometrics();
            closeWorkspaceWithSavedChanges();
            showSnackbar({
              isLowContrast: true,
              kind: 'success',
              title: t('vitalsAndBiometricsRecorded', 'Vitals and Biometrics saved'),
              subtitle: t(
                'vitalsAndBiometricsNowAvailable',
                'The latest results are now visible on the Vitals and Biometrics page',
              ),
            });
          }
        })
        .catch((err) => {
          setIsSubmitting(false);
          createErrorHandler();
          showSnackbar({
            title: t('vitalsAndBiometricsSaveError', 'Error saving vitals and biometrics'),
            kind: 'error',
            isLowContrast: false,
            subtitle: t('checkForValidity', 'Some of the values entered are invalid'),
          });
        });
    },
    [
      closeWorkspaceWithSavedChanges,
      config.concepts,
      config.vitals.encounterTypeUuid,
      config.vitals.formUuid,
      patientUuid,
      session?.sessionLocation?.uuid,
      t,
    ],
  );

  if (config.vitals.useFormEngine) {
    return (
      <ExtensionSlot
        name="form-widget-slot"
        state={{
          view: 'form',
          formUuid: config.vitals.formUuid,
          visitUuid: currentVisit?.uuid,
          visitTypeUuid: currentVisit?.visitType?.uuid,
          patientUuid: patientUuid ?? null,
          patient,
          encounterUuid,
          closeWorkspaceWithSavedChanges,
        }}
      />
    );
  }

  if (isLoading) {
    return (
      <Form className={styles.form}>
        <div className={styles.grid}>
          <Stack>
            <Column>
              <p className={styles.title}>{t('recordVitals', 'Record vitals')}</p>
            </Column>
            <Row className={styles.row}>
              <Column>
                <NumberInputSkeleton />
              </Column>
              <Column>
                <NumberInputSkeleton />
              </Column>
              <Column>
                <NumberInputSkeleton />
              </Column>
              <Column>
                <NumberInputSkeleton />
              </Column>
            </Row>
          </Stack>
        </div>
        <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
          <ButtonSkeleton className={styles.button} />
          <ButtonSkeleton className={styles.button} type="submit" />
        </ButtonSet>
      </Form>
    );
  }

  return (
    <FormProvider {...methods}>
      <Form className={styles.form}>
        <div className={styles.grid}>
          <Stack>
            <Column>
              <p className={styles.title}>{t('recordVitals', 'Record vitals')}</p>
            </Column>
            <Row className={styles.row}>
              <Column>
                <VitalsAndBiometricsInput
                  fieldProperties={[
                    {
                      id: 'temperature',
                      name: t('temperature', 'Temperature'),
                      type: 'number',
                    },
                  ]}
                  interpretation={
                    temperature &&
                    assessValue(
                      temperature,
                      getReferenceRangesForConcept(config.concepts.temperatureUuid, conceptMetadata),
                    )
                  }
                  showFormSubmissionErrorNotifications={showFormSubmissionErrorNotifications}
                  label={t('temperature', 'Temperature')}
                  unitSymbol={conceptUnits.get(config.concepts.temperatureUuid) ?? ''}
                />
              </Column>
              <Column>
                <VitalsAndBiometricsInput
                  fieldProperties={[
                    {
                      name: t('systolic', 'systolic'),
                      separator: '/',
                      type: 'number',
                      id: 'systolicBloodPressure',
                    },
                    {
                      name: t('diastolic', 'diastolic'),
                      type: 'number',
                      id: 'diastolicBloodPressure',
                    },
                  ]}
                  interpretation={
                    systolicBloodPressure &&
                    diastolicBloodPressure &&
                    interpretBloodPressure(
                      systolicBloodPressure,
                      diastolicBloodPressure,
                      config.concepts,
                      conceptMetadata,
                    )
                  }
                  showFormSubmissionErrorNotifications={showFormSubmissionErrorNotifications}
                  label={t('bloodPressure', 'Blood pressure')}
                  unitSymbol={conceptUnits.get(config.concepts.systolicBloodPressureUuid) ?? ''}
                />
              </Column>
              <Column>
                <VitalsAndBiometricsInput
                  fieldProperties={[
                    {
                      name: t('pulse', 'Pulse'),
                      type: 'number',
                      id: 'pulse',
                    },
                  ]}
                  interpretation={
                    pulse &&
                    assessValue(pulse, getReferenceRangesForConcept(config.concepts.pulseUuid, conceptMetadata))
                  }
                  label={t('heartRate', 'Heart rate')}
                  showFormSubmissionErrorNotifications={showFormSubmissionErrorNotifications}
                  unitSymbol={conceptUnits.get(config.concepts.pulseUuid) ?? ''}
                />
              </Column>
              <Column>
                <VitalsAndBiometricsInput
                  fieldProperties={[
                    {
                      name: t('respirationRate', 'Respiration rate'),
                      type: 'number',
                      id: 'respiratoryRate',
                    },
                  ]}
                  interpretation={
                    respiratoryRate &&
                    assessValue(
                      respiratoryRate,
                      getReferenceRangesForConcept(config.concepts.respiratoryRateUuid, conceptMetadata),
                    )
                  }
                  showFormSubmissionErrorNotifications={showFormSubmissionErrorNotifications}
                  label={t('respirationRate', 'Respiration rate')}
                  unitSymbol={conceptUnits.get(config.concepts.respiratoryRateUuid) ?? ''}
                />
              </Column>
              <Column>
                <VitalsAndBiometricsInput
                  fieldProperties={[
                    {
                      name: t('oxygenSaturation', 'Oxygen saturation'),
                      type: 'number',
                      id: 'oxygenSaturation',
                    },
                  ]}
                  interpretation={
                    oxygenSaturation &&
                    assessValue(
                      oxygenSaturation,
                      getReferenceRangesForConcept(config.concepts.oxygenSaturationUuid, conceptMetadata),
                    )
                  }
                  showFormSubmissionErrorNotifications={showFormSubmissionErrorNotifications}
                  label={t('spo2', 'SpO2')}
                  unitSymbol={conceptUnits.get(config.concepts.oxygenSaturationUuid) ?? ''}
                />
              </Column>
            </Row>

            <Row className={styles.row}>
              <Column className={styles.noteInput}>
                <VitalsAndBiometricsInput
                  fieldWidth={isTablet ? '70%' : '100%'}
                  fieldProperties={[
                    {
                      name: t('notes', 'Notes'),
                      type: 'textarea',
                      id: 'generalPatientNote',
                    },
                  ]}
                  placeholder={t('additionalNoteText', 'Type any additional notes here')}
                  label={t('notes', 'Notes')}
                />
              </Column>
            </Row>
          </Stack>
          <Stack className={styles.spacer}>
            <Column>
              <p className={styles.title}>{t('recordBiometrics', 'Record biometrics')}</p>
            </Column>
            <Row className={styles.row}>
              <Column>
                <VitalsAndBiometricsInput
                  fieldProperties={[
                    {
                      name: t('weight', 'Weight'),
                      type: 'number',
                      id: 'weight',
                    },
                  ]}
                  interpretation={
                    weight &&
                    assessValue(weight, getReferenceRangesForConcept(config.concepts.weightUuid, conceptMetadata))
                  }
                  showFormSubmissionErrorNotifications={showFormSubmissionErrorNotifications}
                  label={t('weight', 'Weight')}
                  unitSymbol={conceptUnits.get(config.concepts.weightUuid) ?? ''}
                />
              </Column>
              <Column>
                <VitalsAndBiometricsInput
                  fieldProperties={[
                    {
                      name: t('height', 'Height'),
                      type: 'number',
                      id: 'height',
                    },
                  ]}
                  interpretation={
                    height &&
                    assessValue(height, getReferenceRangesForConcept(config.concepts.heightUuid, conceptMetadata))
                  }
                  showFormSubmissionErrorNotifications={showFormSubmissionErrorNotifications}
                  label={t('height', 'Height')}
                  unitSymbol={conceptUnits.get(config.concepts.heightUuid) ?? ''}
                />
              </Column>
              <Column>
                <VitalsAndBiometricsInput
                  fieldProperties={[
                    {
                      name: t('bmi', 'BMI'),
                      type: 'number',
                      id: 'computedBodyMassIndex',
                    },
                  ]}
                  readOnly
                  label={t('calculatedBmi', 'BMI (calc.)')}
                  unitSymbol={biometricsUnitsSymbols['bmiUnit']}
                />
              </Column>
              <Column>
                <VitalsAndBiometricsInput
                  fieldProperties={[
                    {
                      name: t('muac', 'MUAC'),
                      type: 'number',
                      id: 'midUpperArmCircumference',
                    },
                  ]}
                  muacColorCode={muacColorCode}
                  showFormSubmissionErrorNotifications={showFormSubmissionErrorNotifications}
                  label={t('muac', 'MUAC')}
                  unitSymbol={conceptUnits.get(config.concepts.midUpperArmCircumferenceUuid) ?? ''}
                  useMuacColors={useMuacColorStatus}
                />
              </Column>
            </Row>
          </Stack>
          {showFormSubmissionErrorNotifications && (
            <Stack>
              {Object.entries(errors).map(([key, { message }]) => (
                <Row key={key}>
                  <Column>
                    <InlineNotification
                      role="alert"
                      aria-label={'vineet'}
                      lowContrast
                      title={t('error', 'Error')}
                      subtitle={message}
                      hideCloseButton
                    />
                  </Column>
                </Row>
              ))}
            </Stack>
          )}
        </div>

        <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
          <Button className={styles.button} kind="secondary" onClick={closeWorkspace}>
            {t('discard', 'Discard')}
          </Button>
          <Button
            className={styles.button}
            kind="primary"
            onClick={handleSubmit(savePatientVitalsAndBiometrics, onError)}
            disabled={isSubmitting}
            type="submit"
          >
            {t('saveAndClose', 'Save and close')}
          </Button>
        </ButtonSet>
      </Form>
    </FormProvider>
  );
};

export default VitalsAndBiometricsForm;
