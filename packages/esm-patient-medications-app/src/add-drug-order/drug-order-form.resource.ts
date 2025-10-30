import { useMemo } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { parseDate, useConfig } from '@openmrs/esm-framework';
import { careSettingUuid, useRequireOutpatientQuantity } from '../api';
import { type ConfigObject } from '../config-schema';
import { type DrugOrderBasketItem } from '../types';
import { type Drug } from '@openmrs/esm-patient-common-lib';

export function useDrugOrderForm(initialOrderBasketItem: DrugOrderBasketItem, defaultPrescribingProviderUuid: string) {
  const medicationOrderFormSchema = useCreateMedicationOrderFormSchema();

  const defaultValues = useMemo(() => {
    const defaultStartDate =
      typeof initialOrderBasketItem?.startDate === 'string'
        ? parseDate(initialOrderBasketItem?.startDate)
        : (initialOrderBasketItem?.startDate as Date) ?? new Date();

    return drugOrderBasketItemToFormValue(initialOrderBasketItem, defaultStartDate, defaultPrescribingProviderUuid);
  }, [initialOrderBasketItem, defaultPrescribingProviderUuid]);

  const drugOrderForm: UseFormReturn<MedicationOrderFormData> = useForm<MedicationOrderFormData>({
    mode: 'all',
    resolver: zodResolver(medicationOrderFormSchema),
    defaultValues,
  });

  return drugOrderForm;
}

export function drugOrderBasketItemToFormValue(
  item: DrugOrderBasketItem,
  startDate: Date,
  providerUuid: string,
): MedicationOrderFormData {
  return {
    orderer: {
      uuid: providerUuid,
    },
    drug: item?.drug as Partial<Drug>,
    careSetting: careSettingUuid,
    isFreeTextDosage: item?.isFreeTextDosage ?? false,
    freeTextDosage: item?.freeTextDosage,
    dosage: item?.dosage ?? null,
    unit: item?.unit,
    route: item?.route,
    patientInstructions: item?.patientInstructions ?? '',
    asNeeded: item?.asNeeded ?? false,
    asNeededCondition: item?.asNeededCondition ?? '',
    duration: item?.duration,
    durationUnit: item?.durationUnit,
    pillsDispensed: item?.pillsDispensed ?? null,
    quantityUnits: item?.quantityUnits,
    numRefills: item?.numRefills ?? null,
    indication: item?.indication,
    frequency: item?.frequency,
    startDate,
  };
}

function useCreateMedicationOrderFormSchema() {
  const { t } = useTranslation();
  const { requireOutpatientQuantity } = useRequireOutpatientQuantity();
  const { requireIndication } = useConfig<ConfigObject>();

  const schema = useMemo(() => {
    const comboSchema = {
      default: z.boolean().optional(),
      value: z.string(),
      valueCoded: z.string(),
    };

    const baseSchemaFields = {
      drug: z
        .object(
          {
            uuid: z.string(),
            concept: z
              .object({
                uuid: z.string(),
              })
              .passthrough(),
            dosageForm: z
              .object({
                uuid: z.string(),
              })
              .passthrough()
              .nullable(),
            strength: z.string().nullable(),
            display: z.string().nullable(),
          },
          {
            message: t('drugRequiredErrorMessage', 'Drug is required'),
          },
        )
        .passthrough(),
      orderer: z.object(
        {
          uuid: z.string(),
        },
        {
          message: t('prescribingClinicianRequiredErrorMessage', 'Prescribing clinician is required'),
        },
      ),
      careSetting: z.string(),
      freeTextDosage: z.string().refine((value) => !!value, {
        message: t('freeDosageErrorMessage', 'Add free dosage note'),
      }),
      dosage: z.number({
        invalid_type_error: t('dosageRequiredErrorMessage', 'Dosage is required'),
      }),
      unit: z.object(
        { ...comboSchema },
        {
          invalid_type_error: t('selectUnitErrorMessage', 'Dose unit is required'),
        },
      ),
      route: z.object(
        { ...comboSchema },
        {
          invalid_type_error: t('selectRouteErrorMessage', 'Route is required'),
        },
      ),
      patientInstructions: z.string().nullable(),
      asNeeded: z.boolean(),
      asNeededCondition: z.string().nullable(),
      duration: z.number().nullable(),
      durationUnit: z.object({ ...comboSchema }).nullable(),
      indication: requireIndication
        ? z.string().refine((value) => value !== '', {
            message: t('indicationErrorMessage', 'Indication is required'),
          })
        : z.string().nullish(),
      startDate: z.date(),
      frequency: z.object(
        { ...comboSchema },
        {
          invalid_type_error: t('selectFrequencyErrorMessage', 'Frequency is required'),
        },
      ),
    };

    const outpatientDrugOrderFields = {
      pillsDispensed: z
        .number()
        .nullable()
        .refine(
          (value) => {
            if (requireOutpatientQuantity && (typeof value !== 'number' || value < 1)) {
              return false;
            }
            return true;
          },
          {
            message: t('pillDispensedErrorMessage', 'Quantity to dispense is required'),
          },
        ),
      quantityUnits: z
        .object(comboSchema)
        .nullable()
        .refine(
          (value) => {
            if (requireOutpatientQuantity && !value) {
              return false;
            }
            return true;
          },
          {
            message: t('selectQuantityUnitsErrorMessage', 'Quantity unit is required'),
          },
        ),
      numRefills: z
        .number()
        .nullable()
        .refine(
          (value) => {
            if (requireOutpatientQuantity && (typeof value !== 'number' || value < 0)) {
              return false;
            }
            return true;
          },
          {
            message: t('numRefillsErrorMessage', 'Number of refills is required'),
          },
        ),
    };

    const nonFreeTextDosageSchema = z.object({
      ...baseSchemaFields,
      ...outpatientDrugOrderFields,
      isFreeTextDosage: z.literal(false),
      freeTextDosage: z.string().optional(),
    });

    const freeTextDosageSchema = z.object({
      ...baseSchemaFields,
      ...outpatientDrugOrderFields,
      isFreeTextDosage: z.literal(true),
      dosage: z.number().nullable(),
      unit: z.object(comboSchema).nullable(),
      route: z.object(comboSchema).nullable(),
      frequency: z.object(comboSchema).nullable(),
    });

    return z.discriminatedUnion('isFreeTextDosage', [nonFreeTextDosageSchema, freeTextDosageSchema]);
  }, [requireIndication, requireOutpatientQuantity, t]);

  return schema;
}

export type MedicationOrderFormData = z.infer<ReturnType<typeof useCreateMedicationOrderFormSchema>>;
