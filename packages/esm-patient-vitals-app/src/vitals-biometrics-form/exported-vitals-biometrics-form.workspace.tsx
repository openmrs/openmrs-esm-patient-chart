import React, { useCallback, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  ButtonSkeleton,
  ButtonSet,
  Column,
  Form,
  Row,
  Stack,
  DatePicker,
  DatePickerInput,
} from '@carbon/react';
import {
  showSnackbar,
  useAbortController,
  useConfig,
  useSession,
  type Visit,
  Workspace2,
  type Workspace2DefinitionProps,
} from '@openmrs/esm-framework';
import { useOptimisticVisitMutations } from '@openmrs/esm-patient-common-lib';
import { type ConfigObject } from '../config-schema';
import { calculateBodyMassIndex } from './vitals-biometrics-form.utils';
import {
  createOrUpdateVitalsAndBiometrics,
  invalidateCachedVitalsAndBiometrics,
  useConceptUnits,
  useEncounterVitalsAndBiometrics,
} from '../common';
import { prepareObsForSubmission } from '../common/helpers';
import { useVitalsConceptMetadata } from '../common/data.resource';
import { VitalsAndBiometricsFormSchema, type VitalsBiometricsFormData } from './schema';
import VitalsAndBiometricsInput from './vitals-biometrics-input.component';
import styles from './vitals-biometrics-form.scss';

export interface VitalsAndBiometricsFormProps {
  formContext: 'creating' | 'editing';
  editEncounterUuid?: string;
  patientUuid: string;
  patient: fhir.Patient;
  visitContext: Visit;
}

const ExportedVitalsAndBiometricsForm: React.FC<Workspace2DefinitionProps<VitalsAndBiometricsFormProps, {}, {}>> = ({
  closeWorkspace,
  workspaceProps: { editEncounterUuid, formContext = 'creating', patientUuid, patient, visitContext },
}) => {
  const { t } = useTranslation();
  const config = useConfig<ConfigObject>();
  const session = useSession();
  const { conceptUnits, isLoading: isLoadingConceptUnits } = useConceptUnits();
  const {
    getRefinedInitialValues,
    isLoading: isLoadingEncounter,
    mutate: mutateEncounter,
    vitalsAndBiometrics: initialFieldValuesMap,
  } = useEncounterVitalsAndBiometrics(formContext === 'editing' ? editEncounterUuid : null);
  const abortController = useAbortController();
  const { invalidateVisitRelatedData } = useOptimisticVisitMutations(patientUuid);

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
    defaultValues: { encounterDatetime: new Date().toISOString() },
  });

  useEffect(() => {
    if (formContext === 'editing' && !isLoadingEncounter && initialFieldValuesMap) {
      reset(getRefinedInitialValues());
    }
  }, [formContext, isLoadingEncounter, initialFieldValuesMap, getRefinedInitialValues, reset]);

  const savePatientVitalsAndBiometrics = useCallback(
    (data: VitalsBiometricsFormData) => {
      const { encounterDatetime, ...formData } = data;
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
        encounterDatetime,
      )
        .then(() => {
          if (mutateEncounter) mutateEncounter();
          invalidateVisitRelatedData({ observations: true, encounters: true });
          invalidateCachedVitalsAndBiometrics();
          closeWorkspace({ discardUnsavedChanges: true });
          showSnackbar({ kind: 'success', title: t('vitalsSaved', 'Vitals saved') });
        })
        .catch(() => {
          showSnackbar({ kind: 'error', title: t('saveError', 'Error saving vitals') });
        });
    },
    [
      abortController,
      closeWorkspace,
      config.concepts,
      config.vitals.encounterTypeUuid,
      dirtyFields,
      editEncounterUuid,
      formContext,
      initialFieldValuesMap,
      mutateEncounter,
      invalidateVisitRelatedData,
      patientUuid,
      session?.sessionLocation?.uuid,
      t,
    ],
  );

  const weight = watch('weight');
  const height = watch('height');
  useEffect(() => {
    if (height && weight) {
      const bmi = calculateBodyMassIndex(
        weight,
        height,
        conceptUnits.get(config.concepts.weightUuid) as any,
        conceptUnits.get(config.concepts.heightUuid) as any,
      );
      setValue('computedBodyMassIndex', bmi);
    }
  }, [weight, height, setValue, conceptUnits, config.concepts]);

  if (isLoadingConceptUnits || (formContext === 'editing' && isLoadingEncounter)) return <ButtonSkeleton />;

  return (
    <Workspace2
      title={editEncounterUuid ? t('editVitals', 'Edit Vitals') : t('recordVitals', 'Record Vitals')}
      hasUnsavedChanges={isDirty}
    >
      <Form className={styles.form}>
        <Stack gap={6}>
          <div style={{ padding: '0 1rem' }}>
            <Controller
              name="encounterDatetime"
              control={control}
              render={({ field: { onChange, value } }) => (
                <DatePicker datePickerType="single" onChange={([date]) => onChange(date?.toISOString())} value={value}>
                  <DatePickerInput
                    id="encounterDatetime"
                    labelText={t('encounterDate', 'Encounter Date')}
                    placeholder="yyyy-mm-dd"
                  />
                </DatePicker>
              )}
            />
          </div>

          <p className={styles.title} style={{ paddingLeft: '1rem' }}>
            {t('recordVitals', 'Record vitals')}
          </p>
          <Row className={styles.row}>
            <Column>
              <VitalsAndBiometricsInput
                control={control}
                label={t('temperature', 'Temperature')}
                fieldProperties={[{ id: 'temperature', name: 'Temperature', type: 'number' }]}
                unitSymbol={conceptUnits.get(config.concepts.temperatureUuid)}
              />
            </Column>
            <Column>
              <VitalsAndBiometricsInput
                control={control}
                label={t('bloodPressure', 'Blood pressure')}
                fieldProperties={[
                  { id: 'systolicBloodPressure', name: 'systolic', type: 'number', separator: '/' },
                  { id: 'diastolicBloodPressure', name: 'diastolic', type: 'number' },
                ]}
                unitSymbol="mmHg"
              />
            </Column>
          </Row>
          <Row className={styles.row}>
            <Column>
              <VitalsAndBiometricsInput
                control={control}
                label={t('heartRate', 'Heart rate')}
                fieldProperties={[{ id: 'pulse', name: 'Pulse', type: 'number' }]}
                unitSymbol={conceptUnits.get(config.concepts.pulseUuid)}
              />
            </Column>
            <Column>
              <VitalsAndBiometricsInput
                control={control}
                label={t('respirationRate', 'Respiration rate')}
                fieldProperties={[{ id: 'respiratoryRate', name: 'Respiratory Rate', type: 'number' }]}
                unitSymbol={conceptUnits.get(config.concepts.respiratoryRateUuid)}
              />
            </Column>
          </Row>

          <p className={styles.title} style={{ paddingLeft: '1rem' }}>
            {t('recordBiometrics', 'Record biometrics')}
          </p>
          <Row className={styles.row}>
            <Column>
              <VitalsAndBiometricsInput
                control={control}
                label={t('weight', 'Weight')}
                fieldProperties={[{ id: 'weight', name: 'Weight', type: 'number' }]}
                unitSymbol="kg"
              />
            </Column>
            <Column>
              <VitalsAndBiometricsInput
                control={control}
                label={t('height', 'Height')}
                fieldProperties={[{ id: 'height', name: 'Height', type: 'number' }]}
                unitSymbol="cm"
              />
            </Column>
          </Row>
          <Row className={styles.row}>
            <Column>
              <VitalsAndBiometricsInput
                control={control}
                label={t('muac', 'MUAC')}
                fieldProperties={[{ id: 'midUpperArmCircumference', name: 'MUAC', type: 'number' }]}
                unitSymbol="cm"
              />
            </Column>
          </Row>
        </Stack>
        <ButtonSet className={styles.desktop} style={{ marginTop: '2rem' }}>
          <Button kind="secondary" onClick={() => closeWorkspace()}>
            {t('discard', 'Discard')}
          </Button>
          <Button
            kind="primary"
            onClick={handleSubmit(savePatientVitalsAndBiometrics)}
            disabled={!isDirty || isSubmitting}
            type="submit"
          >
            {t('saveAndClose', 'Save and close')}
          </Button>
        </ButtonSet>
      </Form>
    </Workspace2>
  );
};

export default ExportedVitalsAndBiometricsForm;
