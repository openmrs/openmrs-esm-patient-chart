import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { type DefaultWorkspaceProps, useVitalsConceptMetadata } from '@openmrs/esm-patient-common-lib';
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
} from '../common';
import VitalsAndBiometricsInput from './vitals-biometrics-input.component';
import styles from './vitals-biometrics-form.scss';

const VitalsAndBiometricFormSchema = z
  .object({
    systolicBloodPressure: z.number(),
    diastolicBloodPressure: z.number(),
    respiratoryRate: z.number(),
    oxygenSaturation: z.number(),
    pulse: z.number(),
    temperature: z.number(),
    generalPatientNote: z.string(),
    weight: z.number(),
    height: z.number(),
    midUpperArmCircumference: z.number(),
    computedBodyMassIndex: z.number(),
  })
  .partial()
  .refine(
    (fields) => {
      return Object.values(fields).some((value) => Boolean(value));
    },
    {
      message: 'Please fill at least one field',
      path: ['oneFieldRequired'],
    },
  );

export type VitalsBiometricsFormData = z.infer<typeof VitalsAndBiometricFormSchema>;

const VitalsAndBiometricsForm: React.FC<DefaultWorkspaceProps> = ({ patientUuid, closeWorkspace }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const config = useConfig<ConfigObject>();
  const biometricsUnitsSymbols = config.biometrics;
  const useMuacColorStatus = config.vitals.useMuacColors;

  const session = useSession();
  const patient = usePatient(patientUuid);
  const { currentVisit } = useVisit(patientUuid);
  const { data: conceptUnits, conceptMetadata, conceptRanges, isLoading, isError } = useVitalsConceptMetadata();
  const [hasInvalidVitals, setHasInvalidVitals] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [muacColorCode, setMuacColorCode] = useState('');
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  const { control, handleSubmit, watch, setValue } = useForm<VitalsBiometricsFormData>({
    mode: 'all',
    resolver: zodResolver(VitalsAndBiometricFormSchema),
  });

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
    if (err?.oneFieldRequired) {
      setShowErrorNotification(true);
    }
  }

  const concepts = useMemo(
    () => ({
      midUpperArmCircumferenceRange: conceptRanges.get(config.concepts.midUpperArmCircumferenceUuid),
      diastolicBloodPressureRange: conceptRanges.get(config.concepts.diastolicBloodPressureUuid),
      systolicBloodPressureRange: conceptRanges.get(config.concepts.systolicBloodPressureUuid),
      oxygenSaturationRange: conceptRanges.get(config.concepts.oxygenSaturationUuid),
      respiratoryRateRange: conceptRanges.get(config.concepts.respiratoryRateUuid),
      temperatureRange: conceptRanges.get(config.concepts.temperatureUuid),
      weightRange: conceptRanges.get(config.concepts.weightUuid),
      heightRange: conceptRanges.get(config.concepts.heightUuid),
      pulseRange: conceptRanges.get(config.concepts.pulseUuid),
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

  const savePatientVitalsAndBiometrics = useCallback((data: VitalsBiometricsFormData) => {
    const formData = data;
    setShowErrorMessage(true);
    setShowErrorNotification(false);

    data?.computedBodyMassIndex && delete data.computedBodyMassIndex;

    const allFieldsAreValid = Object.entries(formData)
      .filter(([, value]) => Boolean(value))
      .every(([key, value]) => isValueWithinReferenceRange(conceptMetadata, config.concepts[`${key}Uuid`], value));

    if (allFieldsAreValid) {
      setIsSubmitting(true);
      setShowErrorMessage(false);
      const abortController = new AbortController();

      savePatientVitals(
        config.vitals.encounterTypeUuid,
        config.vitals.formUuid,
        config.concepts,
        patientUuid,
        formData,
        new Date(),
        abortController,
        session?.sessionLocation?.uuid,
      )
        .then((response) => {
          if (response.status === 201) {
            invalidateCachedVitalsAndBiometrics();
            closeWorkspace();
            showSnackbar({
              isLowContrast: true,
              kind: 'success',
              title: t('vitalsAndBiometricsRecorded', 'Vitals and Biometrics saved'),
              subtitle: t('vitalsAndBiometricsNowAvailable', 'They are now visible on the Vitals and Biometrics page'),
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
        })
        .finally(() => {
          abortController.abort();
        });
    } else {
      setHasInvalidVitals(true);
    }
  }, []);

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
          closeWorkspace,
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
    <Form className={styles.form}>
      <div className={styles.grid}>
        <Stack>
          <Column>
            <p className={styles.title}>{t('recordVitals', 'Record vitals')}</p>
          </Column>
          <Row className={styles.row}>
            <Column>
              <VitalsAndBiometricsInput
                control={control}
                fieldProperties={[
                  {
                    id: 'temperature',
                    max: concepts.temperatureRange?.highAbsolute,
                    min: concepts.temperatureRange?.lowAbsolute,
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
                isValueWithinReferenceRange={
                  temperature
                    ? isValueWithinReferenceRange(conceptMetadata, config.concepts['temperatureUuid'], temperature)
                    : true
                }
                showErrorMessage={showErrorMessage}
                label={t('temperature', 'Temperature')}
                unitSymbol={conceptUnits.get(config.concepts.temperatureUuid) ?? ''}
              />
            </Column>
            <Column>
              <VitalsAndBiometricsInput
                control={control}
                fieldProperties={[
                  {
                    name: t('systolic', 'systolic'),
                    separator: '/',
                    type: 'number',
                    min: concepts.systolicBloodPressureRange?.lowAbsolute,
                    max: concepts.systolicBloodPressureRange?.highAbsolute,
                    id: 'systolicBloodPressure',
                  },
                  {
                    name: t('diastolic', 'diastolic'),
                    type: 'number',
                    min: concepts.diastolicBloodPressureRange?.lowAbsolute,
                    max: concepts.diastolicBloodPressureRange?.highAbsolute,
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
                isValueWithinReferenceRange={
                  systolicBloodPressure &&
                  diastolicBloodPressure &&
                  isValueWithinReferenceRange(
                    conceptMetadata,
                    config.concepts.systolicBloodPressureUuid,
                    systolicBloodPressure,
                  ) &&
                  isValueWithinReferenceRange(
                    conceptMetadata,
                    config.concepts.diastolicBloodPressureUuid,
                    diastolicBloodPressure,
                  )
                }
                label={t('bloodPressure', 'Blood pressure')}
                unitSymbol={conceptUnits.get(config.concepts.systolicBloodPressureUuid) ?? ''}
              />
            </Column>
            <Column>
              <VitalsAndBiometricsInput
                control={control}
                fieldProperties={[
                  {
                    name: t('pulse', 'Pulse'),
                    type: 'number',
                    min: concepts.pulseRange?.lowAbsolute,
                    max: concepts.pulseRange?.highAbsolute,
                    id: 'pulse',
                  },
                ]}
                interpretation={
                  pulse && assessValue(pulse, getReferenceRangesForConcept(config.concepts.pulseUuid, conceptMetadata))
                }
                isValueWithinReferenceRange={
                  pulse && isValueWithinReferenceRange(conceptMetadata, config.concepts['pulseUuid'], pulse)
                }
                label={t('heartRate', 'Heart rate')}
                unitSymbol={conceptUnits.get(config.concepts.pulseUuid) ?? ''}
              />
            </Column>
            <Column>
              <VitalsAndBiometricsInput
                control={control}
                fieldProperties={[
                  {
                    name: t('respirationRate', 'Respiration rate'),
                    type: 'number',
                    min: concepts.respiratoryRateRange?.lowAbsolute,
                    max: concepts.respiratoryRateRange?.highAbsolute,
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
                isValueWithinReferenceRange={
                  respiratoryRate &&
                  isValueWithinReferenceRange(conceptMetadata, config.concepts['respiratoryRateUuid'], respiratoryRate)
                }
                showErrorMessage={showErrorMessage}
                label={t('respirationRate', 'Respiration rate')}
                unitSymbol={conceptUnits.get(config.concepts.respiratoryRateUuid) ?? ''}
              />
            </Column>
            <Column>
              <VitalsAndBiometricsInput
                control={control}
                fieldProperties={[
                  {
                    name: t('oxygenSaturation', 'Oxygen saturation'),
                    type: 'number',
                    min: concepts.oxygenSaturationRange?.lowAbsolute,
                    max: concepts.oxygenSaturationRange?.highAbsolute,
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
                isValueWithinReferenceRange={
                  oxygenSaturation &&
                  isValueWithinReferenceRange(
                    conceptMetadata,
                    config.concepts['oxygenSaturationUuid'],
                    oxygenSaturation,
                  )
                }
                showErrorMessage={showErrorMessage}
                label={t('spo2', 'SpO2')}
                unitSymbol={conceptUnits.get(config.concepts.oxygenSaturationUuid) ?? ''}
              />
            </Column>
          </Row>

          <Row className={styles.row}>
            <Column className={styles.noteInput}>
              <VitalsAndBiometricsInput
                control={control}
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
                control={control}
                fieldProperties={[
                  {
                    name: t('weight', 'Weight'),
                    type: 'number',
                    min: concepts.weightRange?.lowAbsolute,
                    max: concepts.weightRange?.highAbsolute,
                    id: 'weight',
                  },
                ]}
                interpretation={
                  weight &&
                  assessValue(weight, getReferenceRangesForConcept(config.concepts.weightUuid, conceptMetadata))
                }
                isValueWithinReferenceRange={
                  height && isValueWithinReferenceRange(conceptMetadata, config.concepts['weightUuid'], weight)
                }
                showErrorMessage={showErrorMessage}
                label={t('weight', 'Weight')}
                unitSymbol={conceptUnits.get(config.concepts.weightUuid) ?? ''}
              />
            </Column>
            <Column>
              <VitalsAndBiometricsInput
                control={control}
                fieldProperties={[
                  {
                    name: t('height', 'Height'),
                    type: 'number',
                    min: concepts.heightRange?.lowAbsolute,
                    max: concepts.heightRange?.highAbsolute,
                    id: 'height',
                  },
                ]}
                interpretation={
                  height &&
                  assessValue(height, getReferenceRangesForConcept(config.concepts.heightUuid, conceptMetadata))
                }
                isValueWithinReferenceRange={
                  weight && isValueWithinReferenceRange(conceptMetadata, config.concepts['heightUuid'], height)
                }
                showErrorMessage={showErrorMessage}
                label={t('height', 'Height')}
                unitSymbol={conceptUnits.get(config.concepts.heightUuid) ?? ''}
              />
            </Column>
            <Column>
              <VitalsAndBiometricsInput
                control={control}
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
                control={control}
                fieldProperties={[
                  {
                    name: t('muac', 'MUAC'),
                    type: 'number',
                    min: concepts.midUpperArmCircumferenceRange?.lowAbsolute,
                    max: concepts.midUpperArmCircumferenceRange?.highAbsolute,
                    id: 'midUpperArmCircumference',
                  },
                ]}
                muacColorCode={muacColorCode}
                isValueWithinReferenceRange={
                  height &&
                  weight &&
                  isValueWithinReferenceRange(
                    conceptMetadata,
                    config.concepts['midUpperArmCircumferenceUuid'],
                    midUpperArmCircumference,
                  )
                }
                showErrorMessage={showErrorMessage}
                label={t('muac', 'MUAC')}
                unitSymbol={conceptUnits.get(config.concepts.midUpperArmCircumferenceUuid) ?? ''}
                useMuacColors={useMuacColorStatus}
              />
            </Column>
          </Row>
        </Stack>
      </div>

      {showErrorNotification && (
        <Column className={styles.errorContainer}>
          <InlineNotification
            lowContrast
            title={t('error', 'Error')}
            subtitle={t('pleaseFillField', 'Please fill at least one field') + '.'}
            onClose={() => setShowErrorNotification(false)}
          />
        </Column>
      )}

      {hasInvalidVitals && (
        <Column className={styles.errorContainer}>
          <InlineNotification
            className={styles.errorNotification}
            lowContrast={false}
            title={t('vitalsAndBiometricsSaveError', 'Error saving vitals and biometrics')}
            subtitle={t('checkForValidity', 'Some of the values entered are invalid')}
          />
        </Column>
      )}

      <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
        <Button className={styles.button} kind="secondary" onClick={() => closeWorkspace()}>
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
  );
};

export default VitalsAndBiometricsForm;
