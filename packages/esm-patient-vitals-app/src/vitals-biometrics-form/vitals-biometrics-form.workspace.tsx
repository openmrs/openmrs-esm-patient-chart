import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
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
  ExtensionSlot,
  showSnackbar,
  useAbortController,
  useConfig,
  useLayoutType,
  useSession,
  useVisit,
  useVisitContextStore,
} from '@openmrs/esm-framework';
import { type DefaultPatientWorkspaceProps } from '@openmrs/esm-patient-common-lib';
import { type ConfigObject } from '../config-schema';
import {
  calculateBodyMassIndex,
  extractNumbers,
  getMuacColorCode,
  isValueWithinReferenceRange,
} from './vitals-biometrics-form.utils';
import {
  assessValue,
  createOrUpdateVitalsAndBiometrics,
  getReferenceRangesForConcept,
  interpretBloodPressure,
  invalidateCachedVitalsAndBiometrics,
  useConceptUnits,
  useEncounterVitalsAndBiometrics,
} from '../common';
import { prepareObsForSubmission } from '../common/helpers';
import { useVitalsConceptMetadata } from '../common/data.resource';
import { VitalsAndBiometricsFormSchema, type VitalsBiometricsFormData } from './schema';
import VitalsAndBiometricsInput from './vitals-biometrics-input.component';
import styles from './vitals-biometrics-form.scss';

interface VitalsAndBiometricsFormProps extends DefaultPatientWorkspaceProps {
  formContext: 'creating' | 'editing';
  editEncounterUuid?: string;
}

const VitalsAndBiometricsForm: React.FC<VitalsAndBiometricsFormProps> = ({
  patientUuid,
  patient,
  editEncounterUuid,
  formContext = 'creating',
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
  const { currentVisit } = useVisit(patientUuid);
  const { conceptUnits, isLoading: isLoadingConceptUnits } = useConceptUnits();
  const { conceptRanges, conceptRangeMap } = useVitalsConceptMetadata(patientUuid);
  const {
    getRefinedInitialValues,
    isLoading: isLoadingEncounter,
    mutate: mutateEncounter,
    vitalsAndBiometrics: initialFieldValuesMap,
  } = useEncounterVitalsAndBiometrics(formContext === 'editing' ? editEncounterUuid : null);
  const [hasInvalidVitals, setHasInvalidVitals] = useState(false);
  const [muacColorCode, setMuacColorCode] = useState('');
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const abortController = useAbortController();
  const { mutateVisit } = useVisitContextStore();

  const isLoadingInitialValues = useMemo(
    () => (formContext === 'creating' ? false : isLoadingEncounter),
    [formContext, isLoadingEncounter],
  );

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { isDirty, isSubmitting, dirtyFields },
    reset,
  } = useForm<VitalsBiometricsFormData>({
    mode: 'all',
    resolver: zodResolver(VitalsAndBiometricsFormSchema),
  });

  useEffect(() => {
    if (formContext === 'editing' && !isLoadingInitialValues && initialFieldValuesMap) {
      reset(getRefinedInitialValues());
    }
  }, [formContext, isLoadingInitialValues, initialFieldValuesMap, getRefinedInitialValues, reset]);

  useEffect(() => promptBeforeClosing(() => isDirty), [isDirty, promptBeforeClosing]);

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

  useEffect(() => {
    const patientBirthDate = patient?.birthDate;
    if (patientBirthDate && midUpperArmCircumference) {
      const patientAge = extractNumbers(age(patientBirthDate));
      getMuacColorCode(patientAge, midUpperArmCircumference, setMuacColorCode);
    }
  }, [watch, patient?.birthDate, midUpperArmCircumference]);

  useEffect(() => {
    if (height && weight) {
      const computedBodyMassIndex = calculateBodyMassIndex(
        weight,
        height,
        conceptUnits.get(config.concepts.weightUuid) as 'lb' | 'lbs' | 'g',
        conceptUnits.get(config.concepts.heightUuid) as 'm' | 'cm' | 'in',
      );
      setValue('computedBodyMassIndex', computedBodyMassIndex);
    }
  }, [weight, height, setValue, conceptUnits, config.concepts.weightUuid, config.concepts.heightUuid]);

  function onError(err) {
    if (err?.oneFieldRequired) {
      setShowErrorNotification(true);
    }
  }

  const concepts = useMemo(
    () => ({
      midUpperArmCircumferenceRange: conceptRangeMap.get(config.concepts.midUpperArmCircumferenceUuid),
      diastolicBloodPressureRange: conceptRangeMap.get(config.concepts.diastolicBloodPressureUuid),
      systolicBloodPressureRange: conceptRangeMap.get(config.concepts.systolicBloodPressureUuid),
      oxygenSaturationRange: conceptRangeMap.get(config.concepts.oxygenSaturationUuid),
      respiratoryRateRange: conceptRangeMap.get(config.concepts.respiratoryRateUuid),
      temperatureRange: conceptRangeMap.get(config.concepts.temperatureUuid),
      weightRange: conceptRangeMap.get(config.concepts.weightUuid),
      heightRange: conceptRangeMap.get(config.concepts.heightUuid),
      pulseRange: conceptRangeMap.get(config.concepts.pulseUuid),
    }),
    [conceptRangeMap, config.concepts],
  );

  const savePatientVitalsAndBiometrics = useCallback(
    (data: VitalsBiometricsFormData) => {
      const formData = data;
      setShowErrorMessage(true);
      setShowErrorNotification(false);

      data?.computedBodyMassIndex && delete data.computedBodyMassIndex;

      const allFieldsAreValid = Object.entries(formData)
        .filter(([, value]) => Boolean(value))
        .every(([key, value]) => isValueWithinReferenceRange(conceptRanges, config.concepts[`${key}Uuid`], value));

      if (allFieldsAreValid) {
        setShowErrorMessage(false);
        const { newObs, toBeVoided } = prepareObsForSubmission(
          formData,
          dirtyFields,
          formContext,
          initialFieldValuesMap,
          config.concepts,
        );

        createOrUpdateVitalsAndBiometrics(
          patientUuid,
          config.vitals.encounterTypeUuid,
          editEncounterUuid,
          session?.sessionLocation?.uuid,
          [...newObs, ...toBeVoided],
          abortController,
        )
          .then(() => {
            if (mutateEncounter) {
              mutateEncounter();
            }
            mutateVisit();
            invalidateCachedVitalsAndBiometrics();
            closeWorkspaceWithSavedChanges();
            showSnackbar({
              isLowContrast: true,
              kind: 'success',
              title:
                formContext === 'creating'
                  ? t('vitalsAndBiometricsSaved', 'Vitals and Biometrics saved')
                  : t('vitalsAndBiometricsUpdated', 'Vitals and Biometrics updated'),
              subtitle: t('vitalsAndBiometricsNowAvailable', 'They are now visible on the Vitals and Biometrics page'),
            });
          })
          .catch(() => {
            showSnackbar({
              title:
                formContext === 'creating'
                  ? t('vitalsAndBiometricsSaveError', 'Error saving Vitals and Biometrics')
                  : t('vitalsAndBiometricsUpdateError', 'Error updating Vitals and Biometrics'),
              kind: 'error',
              isLowContrast: false,
              subtitle: t('checkForValidity', 'Some of the values entered are invalid'),
            });
          });
      } else {
        setHasInvalidVitals(true);
      }
    },
    [
      abortController,
      closeWorkspaceWithSavedChanges,
      config.concepts,
      config.vitals.encounterTypeUuid,
      dirtyFields,
      editEncounterUuid,
      conceptRanges,
      formContext,
      initialFieldValuesMap,
      mutateEncounter,
      mutateVisit,
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

  if (isLoadingConceptUnits || isLoadingInitialValues) {
    return (
      <Form className={styles.form}>
        <ExtensionSlot name="visit-context-header-slot" state={{ patientUuid }} />
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
          <ButtonSkeleton className={styles.button} />
        </ButtonSet>
      </Form>
    );
  }

  return (
    <Form className={styles.form} data-openmrs-role="Vitals and Biometrics Form">
      <ExtensionSlot name="visit-context-header-slot" state={{ patientUuid }} />
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
                    max: concepts.temperatureRange?.hiAbsolute,
                    min: concepts.temperatureRange?.lowAbsolute,
                    name: t('temperature', 'Temperature'),
                    type: 'number',
                  },
                ]}
                interpretation={
                  temperature &&
                  assessValue(temperature, getReferenceRangesForConcept(config.concepts.temperatureUuid, conceptRanges))
                }
                isValueWithinReferenceRange={
                  temperature
                    ? isValueWithinReferenceRange(conceptRanges, config.concepts['temperatureUuid'], temperature)
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
                    max: concepts.systolicBloodPressureRange?.hiAbsolute,
                    id: 'systolicBloodPressure',
                  },
                  {
                    name: t('diastolic', 'diastolic'),
                    type: 'number',
                    min: concepts.diastolicBloodPressureRange?.lowAbsolute,
                    max: concepts.diastolicBloodPressureRange?.hiAbsolute,
                    id: 'diastolicBloodPressure',
                  },
                ]}
                interpretation={
                  systolicBloodPressure &&
                  diastolicBloodPressure &&
                  interpretBloodPressure(systolicBloodPressure, diastolicBloodPressure, config.concepts, conceptRanges)
                }
                isValueWithinReferenceRange={
                  systolicBloodPressure &&
                  diastolicBloodPressure &&
                  isValueWithinReferenceRange(
                    conceptRanges,
                    config.concepts.systolicBloodPressureUuid,
                    systolicBloodPressure,
                  ) &&
                  isValueWithinReferenceRange(
                    conceptRanges,
                    config.concepts.diastolicBloodPressureUuid,
                    diastolicBloodPressure,
                  )
                }
                showErrorMessage={showErrorMessage}
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
                    max: concepts.pulseRange?.hiAbsolute,
                    id: 'pulse',
                  },
                ]}
                interpretation={
                  pulse && assessValue(pulse, getReferenceRangesForConcept(config.concepts.pulseUuid, conceptRanges))
                }
                isValueWithinReferenceRange={
                  pulse && isValueWithinReferenceRange(conceptRanges, config.concepts['pulseUuid'], pulse)
                }
                label={t('heartRate', 'Heart rate')}
                showErrorMessage={showErrorMessage}
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
                    max: concepts.respiratoryRateRange?.hiAbsolute,
                    id: 'respiratoryRate',
                  },
                ]}
                interpretation={
                  respiratoryRate &&
                  assessValue(
                    respiratoryRate,
                    getReferenceRangesForConcept(config.concepts.respiratoryRateUuid, conceptRanges),
                  )
                }
                isValueWithinReferenceRange={
                  respiratoryRate &&
                  isValueWithinReferenceRange(conceptRanges, config.concepts['respiratoryRateUuid'], respiratoryRate)
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
                    max: concepts.oxygenSaturationRange?.hiAbsolute,
                    id: 'oxygenSaturation',
                  },
                ]}
                interpretation={
                  oxygenSaturation &&
                  assessValue(
                    oxygenSaturation,
                    getReferenceRangesForConcept(config.concepts.oxygenSaturationUuid, conceptRanges),
                  )
                }
                isValueWithinReferenceRange={
                  oxygenSaturation &&
                  isValueWithinReferenceRange(conceptRanges, config.concepts['oxygenSaturationUuid'], oxygenSaturation)
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
                    max: concepts.weightRange?.hiAbsolute,
                    id: 'weight',
                  },
                ]}
                interpretation={
                  weight && assessValue(weight, getReferenceRangesForConcept(config.concepts.weightUuid, conceptRanges))
                }
                isValueWithinReferenceRange={
                  height && isValueWithinReferenceRange(conceptRanges, config.concepts['weightUuid'], weight)
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
                    max: concepts.heightRange?.hiAbsolute,
                    id: 'height',
                  },
                ]}
                interpretation={
                  height && assessValue(height, getReferenceRangesForConcept(config.concepts.heightUuid, conceptRanges))
                }
                isValueWithinReferenceRange={
                  weight && isValueWithinReferenceRange(conceptRanges, config.concepts['heightUuid'], height)
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
                    max: concepts.midUpperArmCircumferenceRange?.hiAbsolute,
                    id: 'midUpperArmCircumference',
                  },
                ]}
                muacColorCode={muacColorCode}
                isValueWithinReferenceRange={
                  height &&
                  weight &&
                  isValueWithinReferenceRange(
                    conceptRanges,
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
            onClose={() => setHasInvalidVitals(false)}
            title={t('vitalsAndBiometricsSaveError', 'Error saving Vitals and Biometrics')}
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
          disabled={!isDirty || isSubmitting}
          type="submit"
        >
          {t('saveAndClose', 'Save and close')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default VitalsAndBiometricsForm;
