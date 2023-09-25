import React, { SyntheticEvent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonSet, Column, Form, InlineNotification, Row, Stack } from '@carbon/react';
import {
  age,
  createErrorHandler,
  showToast,
  showNotification,
  useConfig,
  useLayoutType,
  useSession,
  ExtensionSlot,
  usePatient,
  useVisit,
} from '@openmrs/esm-framework';
import { DefaultWorkspaceProps, useVitalsConceptMetadata } from '@openmrs/esm-patient-common-lib';
import {
  calculateBodyMassIndex,
  isValueWithinReferenceRange,
  extractNumbers,
  getColorCode,
} from './vitals-biometrics-form.utils';
import { savePatientVitals, useVitals } from '../vitals.resource';
import type { ConfigObject } from '../../config-schema';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import VitalsBiometricInput from './vitals-biometrics-input.component';
import styles from './vitals-biometrics-form.scss';
import { useForm } from 'react-hook-form';

const vitalsBiometricsFormSchema = z
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
      message: 'Atleast one fields is required',
      path: ['oneFieldRequired'],
    },
  );

export type VitalsBiometricsFormData = z.infer<typeof vitalsBiometricsFormSchema>;

const VitalsAndBiometricForms: React.FC<DefaultWorkspaceProps> = ({ patientUuid, closeWorkspace }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const config = useConfig<ConfigObject>();
  const biometricsUnitsSymbols = config.biometrics;
  const useMuacColorStatus = config.vitals.useMuacColors;

  const session = useSession();
  const patient = usePatient(patientUuid);
  const { currentVisit } = useVisit(patientUuid);
  const { mutate } = useVitals(patientUuid);
  const { data: conceptUnits, conceptMetadata, conceptRanges } = useVitalsConceptMetadata();
  const [bodyMassIndex, setBodyMassIndex] = useState<number>();
  const [muacColorCode, setMuacColorCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showErroNotification, setShowErrorNotification] = useState(false);

  const { control, handleSubmit, getValues, watch, setValue } = useForm<VitalsBiometricsFormData>({
    mode: 'all',
    resolver: zodResolver(vitalsBiometricsFormSchema),
  });

  const encounterUuid = currentVisit?.encounters?.find(
    (encounter) => encounter?.form?.uuid === config.vitals.formUuid,
  )?.uuid;

  const midUpperArmCircumference = watch('midUpperArmCircumference');
  const systolicBloodPressure = watch('systolicBloodPressure');
  const diastolicBloodPressure = watch('diastolicBloodPressure');
  const respiratoryRate = watch('respiratoryRate');
  const oxygenSaturation = watch('oxygenSaturation');
  const temperature = watch('temperature');
  const pulse = watch('pulse');
  const weight = watch('weight');
  const height = watch('height');

  const isBodyMassIndexValueAbnormal = (bmi: number) => {
    if (!bmi) return false;
    return bmi < 18.5 || bmi > 24.9;
  };

  useEffect(() => {
    getColorCode(extractNumbers(age(patient.patient?.birthDate)), midUpperArmCircumference, setMuacColorCode);
  }, [watch, patient.patient?.birthDate, midUpperArmCircumference]);

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

  const savePatientVitalsAndBiometrics = (data: VitalsBiometricsFormData) => {
    data?.computedBodyMassIndex && delete data.computedBodyMassIndex;
    const patientVitalAndBiometrics = data;

    let isFieldValid = true;
    for (let key in patientVitalAndBiometrics) {
      if (
        isValueWithinReferenceRange(conceptMetadata, config.concepts[key + 'Uuid'], patientVitalAndBiometrics[key]) ==
        false
      ) {
        isFieldValid = false;
        showNotification({
          title: t('vitalsAndBiometricsSaveError', 'Error saving vitals and biometrics'),
          kind: 'error',
          critical: true,
          description: t('checkForValidity', 'Some of the values entered are invalid'),
        });
        break;
      }
    }
    if (isFieldValid) {
      setIsSubmitting(true);
      const ac = new AbortController();
      savePatientVitals(
        config.vitals.encounterTypeUuid,
        config.vitals.formUuid,
        config.concepts,
        patientUuid,
        patientVitalAndBiometrics,
        new Date(),
        ac,
        session?.sessionLocation?.uuid,
      )
        .then((response) => {
          if (response.status === 201) {
            mutate();
            closeWorkspace();
            showToast({
              critical: true,
              kind: 'success',
              title: t('vitalsAndBiometricsRecorded', 'Vitals and Biometrics saved'),
              description: t(
                'vitalsAndBiometricsNowAvailable',
                'They are now visible on the Vitals and Biometrics page',
              ),
            });
          }
        })
        .catch((err) => {
          setIsSubmitting(false);
          createErrorHandler();
          showNotification({
            title: t('vitalsAndBiometricsSaveError', 'Error saving vitals and biometrics'),
            kind: 'error',
            critical: true,
            description: err?.message,
          });
        })
        .finally(() => {
          ac.abort();
        });
    }
  };

  useEffect(() => {
    if (height && weight) {
      const computedBodyMassIndex = calculateBodyMassIndex(weight, height);
      setValue('computedBodyMassIndex', computedBodyMassIndex);
    }
  }, [weight, height, setValue]);

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

  const onError = (err) => {
    if (err?.oneFieldRequired) {
      setShowErrorNotification(true);
    }
  };

  return (
    <Form className={styles.form}>
      <div className={styles.grid}>
        <Stack>
          <Column>
            <p className={styles.title}>{t('recordVitals', 'Record vitals')}</p>
          </Column>
          <Row className={styles.row}>
            <Column>
              <VitalsBiometricInput
                title={t('bloodPressure', 'Blood Pressure')}
                control={control}
                textFields={[
                  {
                    name: t('systolic', 'systolic'),
                    separator: '/',
                    type: 'number',
                    min: concepts.systolicBloodPressureRange.lowAbsolute,
                    max: concepts.systolicBloodPressureRange.highAbsolute,
                    id: 'systolicBloodPressure',
                  },
                  {
                    name: t('diastolic', 'diastolic'),
                    type: 'number',
                    min: concepts.diastolicBloodPressureRange.lowAbsolute,
                    max: concepts.diastolicBloodPressureRange.highAbsolute,
                    id: 'diastolicBloodPressure',
                  },
                ]}
                unitSymbol={conceptUnits.get(config.concepts.systolicBloodPressureUuid) ?? ''}
                isWithinNormalRange={
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
              />
            </Column>
            <Column>
              <VitalsBiometricInput
                title={t('pulse', 'Pulse')}
                control={control}
                textFields={[
                  {
                    name: t('pulse', 'Pulse'),
                    type: 'number',
                    min: concepts.pulseRange.lowAbsolute,
                    max: concepts.pulseRange.highAbsolute,
                    id: 'pulse',
                  },
                ]}
                unitSymbol={conceptUnits.get(config.concepts.pulseUuid) ?? ''}
                isWithinNormalRange={isValueWithinReferenceRange(conceptMetadata, config.concepts['pulseUuid'], pulse)}
              />
            </Column>

            <Column>
              <VitalsBiometricInput
                title={t('respirationRate', 'Respiration Rate')}
                control={control}
                textFields={[
                  {
                    name: t('respirationRate', 'Respiration Rate'),
                    type: 'number',
                    min: concepts.respiratoryRateRange.lowAbsolute,
                    max: concepts.respiratoryRateRange.highAbsolute,
                    id: 'respiratoryRate',
                  },
                ]}
                unitSymbol={conceptUnits.get(config.concepts.respiratoryRateUuid) ?? ''}
                isWithinNormalRange={isValueWithinReferenceRange(
                  conceptMetadata,
                  config.concepts['respiratoryRateUuid'],
                  respiratoryRate,
                )}
              />
            </Column>
            <Column>
              <VitalsBiometricInput
                title={t('spo2', 'SpO2')}
                control={control}
                textFields={[
                  {
                    name: t('oxygenSaturation', 'Oxygen Saturation'),
                    type: 'number',
                    min: concepts.oxygenSaturationRange.lowAbsolute,
                    max: concepts.oxygenSaturationRange.highAbsolute,
                    id: 'oxygenSaturation',
                  },
                ]}
                unitSymbol={conceptUnits.get(config.concepts.oxygenSaturationUuid) ?? ''}
                isWithinNormalRange={isValueWithinReferenceRange(
                  conceptMetadata,
                  config.concepts['oxygenSaturationUuid'],
                  oxygenSaturation,
                )}
              />
            </Column>

            <Column>
              <VitalsBiometricInput
                title={t('temp', 'Temp')}
                control={control}
                textFields={[
                  {
                    name: t('temperature', 'Temperature'),
                    type: 'number',
                    min: concepts.temperatureRange.lowAbsolute,
                    max: concepts.temperatureRange.highAbsolute,
                    id: 'temperature',
                  },
                ]}
                unitSymbol={conceptUnits.get(config.concepts.temperatureUuid) ?? ''}
                isWithinNormalRange={isValueWithinReferenceRange(
                  conceptMetadata,
                  config.concepts['temperatureUuid'],
                  temperature,
                )}
              />
            </Column>
          </Row>

          <Row className={styles.row}>
            <Column className={styles.noteInput}>
              <VitalsBiometricInput
                textFieldWidth={isTablet ? '70%' : '100%'}
                title={t('notes', 'Notes')}
                control={control}
                textFields={[
                  {
                    name: t('notes', 'Notes'),
                    type: 'textArea',
                    id: 'generalPatientNote',
                  },
                ]}
                placeholder={t('additionalNoteText', 'Type any additional notes here')}
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
              <VitalsBiometricInput
                title={t('weight', 'Weight')}
                control={control}
                textFields={[
                  {
                    name: t('weight', 'Weight'),
                    type: 'number',
                    min: concepts.weightRange.lowAbsolute,
                    max: concepts.weightRange.highAbsolute,
                    id: 'weight',
                  },
                ]}
                unitSymbol={conceptUnits.get(config.concepts.weightUuid) ?? ''}
                isWithinNormalRange={isValueWithinReferenceRange(
                  conceptMetadata,
                  config.concepts['weightUuid'],
                  weight,
                )}
              />
            </Column>
            <Column>
              <VitalsBiometricInput
                title={t('height', 'Height')}
                control={control}
                textFields={[
                  {
                    name: t('height', 'Height'),
                    type: 'number',
                    min: concepts.heightRange.lowAbsolute,
                    max: concepts.heightRange.highAbsolute,
                    id: 'height',
                  },
                ]}
                unitSymbol={conceptUnits.get(config.concepts.heightUuid) ?? ''}
                isWithinNormalRange={isValueWithinReferenceRange(
                  conceptMetadata,
                  config.concepts['heightUuid'],
                  height,
                )}
              />
            </Column>
            <Column>
              <VitalsBiometricInput
                title={t('calculatedBmi', 'BMI (calc.)')}
                control={control}
                textFields={[
                  {
                    name: t('bmi', 'BMI'),
                    type: 'number',
                    id: 'computedBodyMassIndex',
                  },
                ]}
                unitSymbol={biometricsUnitsSymbols['bmiUnit']}
                disabled
              />
            </Column>
            <Column>
              <VitalsBiometricInput
                title={t('muac', 'MUAC')}
                control={control}
                useMuacColors={useMuacColorStatus}
                muacColorCode={muacColorCode}
                textFields={[
                  {
                    name: t('muac', 'MUAC'),
                    type: 'number',
                    min: concepts.midUpperArmCircumferenceRange.lowAbsolute,
                    max: concepts.midUpperArmCircumferenceRange.highAbsolute,
                    id: 'midUpperArmCircumference',
                  },
                ]}
                unitSymbol={conceptUnits.get(config.concepts.midUpperArmCircumferenceUuid) ?? ''}
                isWithinNormalRange={isValueWithinReferenceRange(
                  conceptMetadata,
                  config.concepts['midUpperArmCircumferenceUuid'],
                  midUpperArmCircumference,
                )}
              />
            </Column>
          </Row>
          <Row>
            {showErroNotification && (
              <Column>
                <InlineNotification
                  lowContrast
                  title={t('error', 'Error')}
                  subtitle={t('pleaseFillField', 'Please fill at least one field') + '.'}
                  onClose={() => setShowErrorNotification(false)}
                />
              </Column>
            )}
          </Row>
        </Stack>
      </div>
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

export default VitalsAndBiometricForms;
