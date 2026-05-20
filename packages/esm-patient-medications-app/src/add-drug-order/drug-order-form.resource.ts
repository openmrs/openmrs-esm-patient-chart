import { useMemo } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { parseDate, useConfig } from '@openmrs/esm-framework';
import { type Drug, type DrugOrderBasketItem, type OrderAction } from '@openmrs/esm-patient-common-lib';
import { useRequireOutpatientQuantity } from '../api';
import { type ConfigObject } from '../config-schema';

/**
 * Returns the earliest selectable Start date for the drug order form. For REVISE,
 * the new order's dateActivated must be strictly after the previous order's
 * dateActivated (the backend computes previous.dateStopped = new.dateActivated - 1s),
 * so the floor is previous + 1s. For NEW/RENEW/DISCONTINUE the floor is the visit
 * start so the encounter the form ultimately writes to can hold the chosen
 * dateActivated.
 */
export function getStartDateMinimum(
  action: OrderAction | undefined,
  previousOrderDateActivated: string | undefined,
  visitStartDatetime: string | undefined,
): Date | undefined {
  if (action === 'REVISE' && previousOrderDateActivated) {
    return new Date(new Date(previousOrderDateActivated).getTime() + 1000);
  }
  return visitStartDatetime ? parseDate(visitStartDatetime) : undefined;
}

export function useDrugOrderForm(initialOrderBasketItem: DrugOrderBasketItem) {
  const medicationOrderFormSchema = useCreateMedicationOrderFormSchema();

  const defaultValues = useMemo(() => {
    const defaultScheduledDate =
      typeof initialOrderBasketItem?.scheduledDate === 'string'
        ? parseDate(initialOrderBasketItem?.scheduledDate)
        : (initialOrderBasketItem?.scheduledDate as Date) ?? new Date();

    return drugOrderBasketItemToFormValue(initialOrderBasketItem, defaultScheduledDate);
  }, [initialOrderBasketItem]);

  const drugOrderForm: UseFormReturn<MedicationOrderFormData> = useForm<MedicationOrderFormData>({
    mode: 'all',
    resolver: zodResolver(medicationOrderFormSchema),
    defaultValues,
  });

  return drugOrderForm;
}

export function drugOrderBasketItemToFormValue(
  item: DrugOrderBasketItem,
  scheduledDate: Date,
): MedicationOrderFormData {
  return {
    drug: item?.drug as Partial<Drug>,
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
    scheduledDate,
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

    const frequencySchema = {
      ...comboSchema,
      frequencyPerDay: z.number().nullish(),
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
      freeTextDosage: z.string().refine((value) => !!value, {
        message: t('freeDosageErrorMessage', 'Add free dosage note'),
      }),
      dosage: z
        .number({
          invalid_type_error: t('dosageRequiredErrorMessage', 'Dosage is required'),
        })
        .gt(0, { message: t('dosageGreaterThanZeroErrorMessage', 'Dose must be greater than 0') }),
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
      scheduledDate: z.date(),
      frequency: z.object(
        { ...frequencySchema },
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
      freeTextDosage: z.string().nullable(),
    });

    const freeTextDosageSchema = z.object({
      ...baseSchemaFields,
      ...outpatientDrugOrderFields,
      isFreeTextDosage: z.literal(true),
      dosage: z.number().nullable(),
      unit: z.object(comboSchema).nullable(),
      route: z.object(comboSchema).nullable(),
      frequency: z.object(frequencySchema).nullable(),
    });

    return z.discriminatedUnion('isFreeTextDosage', [nonFreeTextDosageSchema, freeTextDosageSchema]);
  }, [requireIndication, requireOutpatientQuantity, t]);

  return schema;
}

export type MedicationOrderFormData = z.infer<ReturnType<typeof useCreateMedicationOrderFormSchema>>;

export function durationToDays(
  duration: number | null,
  durationUnitUuid: string | null,
  durationUnitsDaysMap: Record<string, number>,
): number | null {
  if (duration == null || !durationUnitUuid) {
    return null;
  }
  const multiplier = durationUnitsDaysMap[durationUnitUuid];
  if (multiplier == null) {
    return null;
  }
  return duration * multiplier;
}
