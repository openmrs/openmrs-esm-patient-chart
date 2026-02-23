import { useMemo } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { parseDate, useConfig, openmrsFetch, restBaseUrl, useDebounce } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { type Drug, type DrugOrderBasketItem } from '@openmrs/esm-patient-common-lib';
import { useRequireOutpatientQuantity } from '../api';
import { type ConfigObject } from '../config-schema';

export function useDrugOrderForm(initialOrderBasketItem: DrugOrderBasketItem) {
  const medicationOrderFormSchema = useCreateMedicationOrderFormSchema();

  const defaultValues = useMemo(() => {
    const defaultStartDate =
      typeof initialOrderBasketItem?.startDate === 'string'
        ? parseDate(initialOrderBasketItem?.startDate)
        : (initialOrderBasketItem?.startDate as Date) ?? new Date();

    return drugOrderBasketItemToFormValue(initialOrderBasketItem, defaultStartDate);
  }, [initialOrderBasketItem]);

  const drugOrderForm: UseFormReturn<MedicationOrderFormData> = useForm<MedicationOrderFormData>({
    mode: 'all',
    resolver: zodResolver(medicationOrderFormSchema),
    defaultValues,
  });

  return drugOrderForm;
}

export function drugOrderBasketItemToFormValue(item: DrugOrderBasketItem, startDate: Date): MedicationOrderFormData {
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
    indicationCoded: item?.indicationCoded ?? null,
    frequency: item?.frequency,
    startDate,
  };
}

function useCreateMedicationOrderFormSchema() {
  const { t } = useTranslation();
  const { requireOutpatientQuantity } = useRequireOutpatientQuantity();
  const { requireIndication, useCodedIndication } = useConfig<ConfigObject>();

  const schema = useMemo(() => {
    const comboSchema = {
      default: z.boolean().optional(),
      value: z.string(),
      valueCoded: z.string(),
    };

    const indicationBaseSchema = z.string().nullish();

    const indicationSchema =
      requireIndication && !useCodedIndication
        ? z.string().refine((value) => value !== '', {
            message: t('indicationErrorMessage', 'Indication is required'),
          })
        : indicationBaseSchema;

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
      indication: indicationSchema,
      indicationCoded:
        requireIndication && useCodedIndication
          ? z
              .object({
                uuid: z.string(),
                display: z.string(),
              })
              .nullable()
              .refine((value) => value != null, {
                message: t('indicationErrorMessage', 'Indication is required'),
              })
          : z
              .object({
                uuid: z.string(),
                display: z.string(),
              })
              .nullable(),
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
      freeTextDosage: z.string().nullable(),
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
  }, [requireIndication, requireOutpatientQuantity, t, useCodedIndication]);

  return schema;
}

export type MedicationOrderFormData = z.infer<ReturnType<typeof useCreateMedicationOrderFormSchema>>;

export interface CodedIndication {
  uuid: string;
  display: string;
}

export function useIndicationSearch(searchTerm: string, conceptClassUuid?: string) {
  const classParam = conceptClassUuid ? `&class=${encodeURIComponent(conceptClassUuid)}` : '';
  const url =
    debouncedSearchTerm && debouncedSearchTerm.length >= 0
      ? `${restBaseUrl}/concept?name=${encodeURIComponent(
          debouncedSearchTerm,
        )}&searchType=fuzzy${classParam}&v=custom:(uuid,display)`
      : null;

  const { data, error, isLoading } = useSWR<{ data: { results: Array<CodedIndication> } }, Error>(url, openmrsFetch);

  return {
    searchResults: data?.data?.results ?? [],
    isSearching: isLoading,
    error,
  };
}
