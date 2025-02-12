import React, { type ChangeEvent, type ComponentProps, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type TFunction, useTranslation } from 'react-i18next';
import classNames from 'classnames';
import {
  Button,
  ButtonSet,
  Checkbox,
  Column,
  ComboBox,
  IconButton,
  Form,
  FormGroup,
  FormLabel,
  Grid,
  InlineNotification,
  Layer,
  NumberInput,
  TextArea,
  TextInput,
  Toggle,
} from '@carbon/react';
import { Subtract } from '@carbon/react/icons';
import { capitalize } from 'lodash-es';
import {
  AddIcon,
  age,
  ArrowLeftIcon,
  ExtensionSlot,
  formatDate,
  getPatientName,
  OpenmrsDatePicker,
  parseDate,
  useConfig,
  useLayoutType,
} from '@openmrs/esm-framework';
import { type Control, Controller, useController, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useOrderConfig } from '../api/order-config';
import { type ConfigObject } from '../config-schema';
import type {
  CommonMedicationValueCoded,
  DosingUnit,
  DrugOrderBasketItem,
  DurationUnit,
  MedicationFrequency,
  MedicationRoute,
  QuantityUnit,
} from '../types';
import { useRequireOutpatientQuantity } from '../api';
import styles from './drug-order-form.scss';
import { usePatientChartStore } from '@openmrs/esm-patient-common-lib';

export interface DrugOrderFormProps {
  initialOrderBasketItem: DrugOrderBasketItem;
  onSave: (finalizedOrder: DrugOrderBasketItem) => void;
  onCancel: () => void;
  promptBeforeClosing: (testFcn: () => boolean) => void;
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

type MedicationOrderFormData = z.infer<ReturnType<typeof useCreateMedicationOrderFormSchema>>;

function MedicationInfoHeader({
  orderBasketItem,
  routeValue,
  unitValue,
  dosage,
}: {
  orderBasketItem: DrugOrderBasketItem;
  routeValue: string;
  unitValue: string;
  dosage: number;
}) {
  const { t } = useTranslation();

  return (
    <div className={styles.medicationInfo} id="medicationInfo">
      <strong className={styles.productiveHeading02}>
        {orderBasketItem?.drug?.display} {orderBasketItem?.drug?.strength && `(${orderBasketItem.drug?.strength})`}
      </strong>{' '}
      <span className={styles.bodyLong01}>
        {routeValue && <>&mdash; {routeValue}</>}{' '}
        {orderBasketItem?.drug?.dosageForm?.display && <>&mdash; {orderBasketItem?.drug?.dosageForm?.display}</>}{' '}
      </span>
      {dosage && unitValue ? (
        <>
          &mdash; <span className={styles.caption01}>{t('dose', 'Dose').toUpperCase()}</span>{' '}
          <strong>
            <span className={styles.productiveHeading02}>
              {dosage} {unitValue.toLowerCase()}
            </span>
          </strong>
        </>
      ) : null}{' '}
      <ExtensionSlot name="medication-info-slot" state={{ order: orderBasketItem }} />
    </div>
  );
}

function InputWrapper({ children }) {
  const isTablet = useLayoutType() === 'tablet';
  return (
    <Layer level={isTablet ? 1 : 0}>
      <div className={styles.field}>{children}</div>
    </Layer>
  );
}

export function DrugOrderForm({ initialOrderBasketItem, onSave, onCancel, promptBeforeClosing }: DrugOrderFormProps) {
  const { t } = useTranslation();
  const config = useConfig<ConfigObject>();
  const isTablet = useLayoutType() === 'tablet';
  const { orderConfigObject, error: errorFetchingOrderConfig } = useOrderConfig();

  const defaultStartDate = useMemo(() => {
    if (typeof initialOrderBasketItem?.startDate === 'string') parseDate(initialOrderBasketItem?.startDate);

    return initialOrderBasketItem?.startDate as Date;
  }, [initialOrderBasketItem?.startDate]);

  const medicationOrderFormSchema = useCreateMedicationOrderFormSchema();

  const {
    control,
    formState: { isDirty },
    getValues,
    handleSubmit,
    setValue,
    watch,
  } = useForm<MedicationOrderFormData>({
    mode: 'all',
    resolver: zodResolver(medicationOrderFormSchema),
    defaultValues: {
      isFreeTextDosage: initialOrderBasketItem?.isFreeTextDosage,
      freeTextDosage: initialOrderBasketItem?.freeTextDosage,
      dosage: initialOrderBasketItem?.dosage,
      unit: initialOrderBasketItem?.unit,
      route: initialOrderBasketItem?.route,
      patientInstructions: initialOrderBasketItem?.patientInstructions,
      asNeeded: initialOrderBasketItem?.asNeeded,
      asNeededCondition: initialOrderBasketItem?.asNeededCondition,
      duration: initialOrderBasketItem?.duration,
      durationUnit: initialOrderBasketItem?.durationUnit,
      pillsDispensed: initialOrderBasketItem?.pillsDispensed,
      quantityUnits: initialOrderBasketItem?.quantityUnits,
      numRefills: initialOrderBasketItem?.numRefills,
      indication: initialOrderBasketItem?.indication,
      frequency: initialOrderBasketItem?.frequency,
      startDate: defaultStartDate,
    },
  });

  useEffect(() => {
    promptBeforeClosing(() => isDirty);
  }, [isDirty, promptBeforeClosing]);

  const handleUnitAfterChange = useCallback(
    (newValue: MedicationOrderFormData['unit'], prevValue: MedicationOrderFormData['unit']) => {
      if (prevValue?.valueCoded === getValues('quantityUnits')?.valueCoded) {
        setValue('quantityUnits', newValue, { shouldValidate: true });
      }
    },
    [setValue, getValues],
  );

  const routeValue = watch('route')?.value;
  const unitValue = watch('unit')?.value;
  const dosage = watch('dosage');

  const handleFormSubmission = (data: MedicationOrderFormData) => {
    const newBasketItems = {
      ...initialOrderBasketItem,
      isFreeTextDosage: data.isFreeTextDosage,
      freeTextDosage: data.freeTextDosage,
      dosage: data.dosage,
      unit: data.unit,
      route: data.route,
      patientInstructions: data.patientInstructions,
      asNeeded: data.asNeeded,
      asNeededCondition: data.asNeededCondition,
      duration: data.duration,
      durationUnit: data.durationUnit,
      pillsDispensed: data.pillsDispensed,
      quantityUnits: data.quantityUnits,
      numRefills: data.numRefills,
      indication: data.indication,
      frequency: data.frequency,
      startDate: data.startDate,
    };
    onSave(newBasketItems as DrugOrderBasketItem);
  };

  const drugDosingUnits: Array<DosingUnit> = useMemo(
    () =>
      orderConfigObject?.drugDosingUnits ?? [
        {
          valueCoded: initialOrderBasketItem?.drug?.dosageForm?.uuid,
          value: initialOrderBasketItem?.drug?.dosageForm?.display,
        },
      ],
    [orderConfigObject, initialOrderBasketItem?.drug?.dosageForm],
  );

  const drugRoutes: Array<MedicationRoute> = useMemo(() => orderConfigObject?.drugRoutes ?? [], [orderConfigObject]);

  const drugDispensingUnits: Array<QuantityUnit> = useMemo(
    () =>
      orderConfigObject?.drugDispensingUnits ?? [
        {
          valueCoded: initialOrderBasketItem?.drug?.dosageForm?.uuid,
          value: initialOrderBasketItem?.drug?.dosageForm?.display,
        },
      ],
    [orderConfigObject, initialOrderBasketItem?.drug?.dosageForm],
  );

  const durationUnits: Array<DurationUnit> = useMemo(
    () =>
      orderConfigObject?.durationUnits ?? [
        {
          valueCoded: config?.daysDurationUnit?.uuid,
          value: config?.daysDurationUnit?.display,
        },
      ],
    [orderConfigObject, config?.daysDurationUnit],
  );

  const orderFrequencies: Array<MedicationFrequency> = useMemo(() => {
    return orderConfigObject?.orderFrequencies ?? [];
  }, [orderConfigObject]);

  const filterItemsByName = useCallback((menu) => {
    return menu?.item?.value?.toLowerCase().includes(menu?.inputValue?.toLowerCase());
  }, []);

  const filterItemsBySynonymNames = useCallback((menu) => {
    if (menu?.inputValue?.length) {
      return menu.item?.names?.some((abbr: string) => abbr.toLowerCase().includes(menu.inputValue.toLowerCase()));
    }
    return menu?.item?.names ?? [];
  }, []);

  const [showStickyMedicationHeader, setShowMedicationHeader] = useState(false);
  const { patient } = usePatientChartStore();
  const patientName = patient ? getPatientName(patient) : '';
  const { maxDispenseDurationInDays } = useConfig<ConfigObject>();

  const observer = useRef(null);
  const medicationInfoHeaderRef = useCallback(
    (node: HTMLElement) => {
      if (observer.current) {
        observer.current.disconnect();
      }

      observer.current = new IntersectionObserver(
        ([e]) => {
          setShowMedicationHeader(e.intersectionRatio < 1);
        },
        {
          threshold: 1,
        },
      );

      if (node) {
        observer.current.observe(node);
      }
    },
    [setShowMedicationHeader],
  );

  return (
    <div className={styles.container}>
      {showStickyMedicationHeader && (
        <div className={styles.stickyMedicationInfo}>
          <MedicationInfoHeader
            dosage={dosage}
            orderBasketItem={initialOrderBasketItem}
            routeValue={routeValue}
            unitValue={unitValue}
          />
        </div>
      )}
      {isTablet && (
        <div className={styles.patientHeader}>
          <span className={styles.bodyShort02}>{patientName}</span>
          <span className={classNames(styles.text02, styles.bodyShort01)}>
            {capitalize(patient?.gender)} &middot; {age(patient?.birthDate)} &middot;{' '}
            <span>{formatDate(parseDate(patient?.birthDate), { mode: 'wide', time: false })}</span>
          </span>
        </div>
      )}
      <Form className={styles.orderForm} onSubmit={handleSubmit(handleFormSubmission)} id="drugOrderForm">
        <div>
          {errorFetchingOrderConfig && (
            <InlineNotification
              kind="error"
              lowContrast
              className={styles.inlineNotification}
              title={t('errorFetchingOrderConfig', 'Error occured when fetching Order config')}
              subtitle={t('tryReopeningTheForm', 'Please try launching the form again')}
            />
          )}
          {!isTablet && (
            <div className={styles.backButton}>
              <Button
                kind="ghost"
                renderIcon={(props: ComponentProps<typeof ArrowLeftIcon>) => <ArrowLeftIcon size={24} {...props} />}
                iconDescription="Return to order basket"
                size="sm"
                onClick={onCancel}
              >
                <span>{t('backToOrderBasket', 'Back to order basket')}</span>
              </Button>
            </div>
          )}

          <h1 className={styles.orderFormHeading}>{t('orderForm', 'Order Form')}</h1>
          <div ref={medicationInfoHeaderRef}>
            <MedicationInfoHeader
              dosage={dosage}
              orderBasketItem={initialOrderBasketItem}
              routeValue={routeValue}
              unitValue={unitValue}
            />
          </div>
          <section className={styles.formSection}>
            <Grid className={styles.gridRow}>
              <Column lg={12} md={6} sm={4}>
                <h3 className={styles.sectionHeader}>{t('dosageInstructions', '1. Dosage instructions')}</h3>
              </Column>
              <Column className={styles.freeTextDosageToggle} lg={4} md={2} sm={4}>
                <ControlledFieldInput
                  name="isFreeTextDosage"
                  type="toggle"
                  control={control}
                  size="sm"
                  id="freeTextDosageToggle"
                  aria-label={t('freeTextDosage', 'Free text dosage')}
                  labelText={t('freeTextDosage', 'Free text dosage')}
                />
              </Column>
            </Grid>
            {watch('isFreeTextDosage') ? (
              <Grid className={styles.gridRow}>
                <Column md={8}>
                  <ControlledFieldInput
                    control={control}
                    name="freeTextDosage"
                    type="textArea"
                    labelText={t('freeTextDosage', 'Free text dosage')}
                    placeholder={t('freeTextDosage', 'Free text dosage')}
                    maxLength={65535}
                  />
                </Column>
              </Grid>
            ) : (
              <>
                <Grid className={styles.gridRow}>
                  <Column lg={8} md={4} sm={4} className={styles.linkedInput}>
                    <InputWrapper>
                      <div className={styles.numberInput}>
                        <ControlledFieldInput
                          control={control}
                          type="number"
                          name="dosage"
                          id="doseSelection"
                          placeholder={t('editDoseComboBoxPlaceholder', 'Dose')}
                          label={t('editDoseComboBoxTitle', 'Dose')}
                          min={0}
                          hideSteppers={true}
                          step={0.01}
                        />
                      </div>
                    </InputWrapper>
                  </Column>
                  <Column lg={8} md={4} sm={4}>
                    <InputWrapper>
                      <ControlledFieldInput
                        control={control}
                        name="unit"
                        type="comboBox"
                        getValues={getValues}
                        id="dosingUnits"
                        shouldFilterItem={filterItemsByName}
                        placeholder={t('editDosageUnitsPlaceholder', 'Unit')}
                        titleText={t('editDosageUnitsTitle', 'Dose unit')}
                        items={drugDosingUnits}
                        itemToString={(item: CommonMedicationValueCoded) => item?.value}
                        handleAfterChange={handleUnitAfterChange}
                      />
                    </InputWrapper>
                  </Column>
                </Grid>
                <Grid className={styles.gridRow}>
                  <Column lg={8} md={4} sm={4}>
                    <InputWrapper>
                      <ControlledFieldInput
                        control={control}
                        id="editRoute"
                        items={drugRoutes}
                        itemToString={(item: CommonMedicationValueCoded) => item?.value}
                        name="route"
                        placeholder={t('editRouteComboBoxTitle', 'Route')}
                        shouldFilterItem={filterItemsByName}
                        titleText={t('editRouteComboBoxTitle', 'Route')}
                        type="comboBox"
                      />
                    </InputWrapper>
                  </Column>
                  <Column lg={8} md={4} sm={4}>
                    <InputWrapper>
                      <ControlledFieldInput
                        control={control}
                        name="frequency"
                        type="comboBox"
                        id="editFrequency"
                        items={orderFrequencies}
                        shouldFilterItem={filterItemsBySynonymNames}
                        placeholder={t('editFrequencyComboBoxTitle', 'Frequency')}
                        titleText={t('editFrequencyComboBoxTitle', 'Frequency')}
                        itemToString={(item: CommonMedicationValueCoded) => item?.value}
                      />
                    </InputWrapper>
                  </Column>
                </Grid>

                <Grid className={styles.gridRow}>
                  <Column lg={16} md={4} sm={4}>
                    <InputWrapper>
                      <ControlledFieldInput
                        control={control}
                        name="patientInstructions"
                        type="textArea"
                        labelText={t('patientInstructions', 'Patient instructions')}
                        placeholder={t(
                          'patientInstructionsPlaceholder',
                          'Additional dosing instructions (e.g. "Take after eating")',
                        )}
                        maxLength={65535}
                        rows={isTablet ? 6 : 4}
                      />
                    </InputWrapper>
                  </Column>
                  <Column className={styles.prn} lg={16} md={4} sm={4}>
                    <Grid className={styles.gridRow}>
                      <Column lg={6} md={8} sm={4}>
                        <InputWrapper>
                          <FormGroup legendText={t('prn', 'P.R.N.')}>
                            <ControlledFieldInput
                              control={control}
                              name="asNeeded"
                              type="checkbox"
                              id="prn"
                              labelText={t('takeAsNeeded', 'Take as needed')}
                            />
                          </FormGroup>
                        </InputWrapper>
                      </Column>

                      <Column lg={10} md={8} sm={4}>
                        <InputWrapper>
                          <ControlledFieldInput
                            control={control}
                            name="asNeededCondition"
                            type="textArea"
                            labelText={t('prnReason', 'P.R.N. reason')}
                            placeholder={t('prnReasonPlaceholder', 'Reason to take medicine')}
                            rows={3}
                            maxLength={255}
                            disabled={!watch('asNeeded')}
                          />
                        </InputWrapper>
                      </Column>
                    </Grid>
                  </Column>
                </Grid>
              </>
            )}
          </section>
          <section className={styles.formSection}>
            <h3 className={styles.sectionHeader}>{t('prescriptionDuration', '2. Prescription duration')}</h3>
            <Grid className={styles.gridRow}>
              {/* TODO: This input does nothing */}
              <Column lg={16} md={4} sm={4}>
                <div className={styles.fullWidthDatePickerContainer}>
                  <InputWrapper>
                    <Controller
                      name="startDate"
                      control={control}
                      render={({ field: { onBlur, value, onChange, ref } }) => (
                        <OpenmrsDatePicker
                          maxDate={new Date().toISOString()}
                          value={value}
                          onChange={(newStartDate) => onChange(newStartDate)}
                          onBlur={onBlur}
                          ref={ref}
                          id="startDatePicker"
                          labelText={t('startDate', 'Start date')}
                          size={isTablet ? 'lg' : 'sm'}
                          aria-labelledby="startDatePickerLabel"
                          aria-describedby="startDatePickerDescription"
                        />
                      )}
                    />
                  </InputWrapper>
                </div>
              </Column>
              <Column lg={8} md={2} sm={4} className={styles.linkedInput}>
                <InputWrapper>
                  {!isTablet ? (
                    <ControlledFieldInput
                      control={control}
                      name="duration"
                      type="number"
                      id="durationInput"
                      label={t('duration', 'Duration')}
                      min={0}
                      step={1}
                      max={maxDispenseDurationInDays}
                      allowEmpty={true}
                    />
                  ) : (
                    <CustomNumberInput
                      control={control}
                      isTablet={isTablet}
                      setValue={setValue}
                      name="duration"
                      labelText={t('duration', 'Duration')}
                    />
                  )}
                </InputWrapper>
              </Column>
              <Column className={styles.durationUnit} lg={8} md={2} sm={4}>
                <InputWrapper>
                  <ControlledFieldInput
                    control={control}
                    name="durationUnit"
                    type="comboBox"
                    id="durationUnitPlaceholder"
                    titleText={t('durationUnit', 'Duration unit')}
                    items={durationUnits}
                    itemToString={(item: CommonMedicationValueCoded) => item?.value}
                    placeholder={t('durationUnitPlaceholder', 'Duration Unit')}
                    shouldFilterItem={filterItemsByName}
                  />
                </InputWrapper>
              </Column>
            </Grid>
          </section>
          <section className={styles.formSection}>
            <h3 className={styles.sectionHeader}>{t('dispensingInformation', '3. Dispensing instructions')}</h3>
            <Grid className={styles.gridRow}>
              <Column lg={8} md={3} sm={4}>
                <InputWrapper>
                  <ControlledFieldInput
                    control={control}
                    name="pillsDispensed"
                    type="number"
                    id="quantityDispensed"
                    label={t('quantityToDispense', 'Quantity to dispense')}
                    min={0}
                    hideSteppers
                    allowEmpty
                  />
                </InputWrapper>
              </Column>
              <Column lg={8} md={3} sm={4}>
                <InputWrapper>
                  <ControlledFieldInput
                    control={control}
                    id="dispensingUnits"
                    items={drugDispensingUnits}
                    itemToString={(item: CommonMedicationValueCoded) => item?.value}
                    name="quantityUnits"
                    placeholder={t('editDispensingUnit', 'Quantity unit')}
                    shouldFilterItem={filterItemsByName}
                    titleText={t('editDispensingUnit', 'Quantity unit')}
                    type="comboBox"
                  />
                </InputWrapper>
              </Column>
              <Column lg={8} md={3} sm={4}>
                <InputWrapper>
                  {!isTablet ? (
                    <ControlledFieldInput
                      control={control}
                      name="numRefills"
                      type="number"
                      id="prescriptionRefills"
                      min={0}
                      label={t('prescriptionRefills', 'Prescription refills')}
                      max={99}
                      allowEmpty
                    />
                  ) : (
                    <CustomNumberInput
                      control={control}
                      isTablet={isTablet}
                      setValue={setValue}
                      name="numRefills"
                      labelText={t('prescriptionRefills', 'Prescription refills')}
                    />
                  )}
                </InputWrapper>
              </Column>
            </Grid>
            <Grid className={styles.gridRow}>
              <Column lg={16} md={6} sm={4}>
                <InputWrapper>
                  <ControlledFieldInput
                    control={control}
                    name="indication"
                    type="textInput"
                    id="indication"
                    labelText={t('indication', 'Indication')}
                    placeholder={t('indicationPlaceholder', 'e.g. "Hypertension"')}
                    maxLength={150}
                  />
                </InputWrapper>
              </Column>
            </Grid>
          </section>
        </div>

        <ButtonSet
          className={classNames(styles.buttonSet, isTablet ? styles.tabletButtonSet : styles.desktopButtonSet)}
        >
          <Button className={styles.button} kind="secondary" onClick={onCancel} size="xl">
            {t('discard', 'Discard')}
          </Button>
          <Button
            className={styles.button}
            kind="primary"
            type="submit"
            size="xl"
            disabled={!!errorFetchingOrderConfig}
          >
            {t('saveOrder', 'Save order')}
          </Button>
        </ButtonSet>
      </Form>
    </div>
  );
}

const CustomNumberInput = ({ setValue, control, name, labelText, isTablet, ...inputProps }) => {
  const { t } = useTranslation();
  const { maxDispenseDurationInDays } = useConfig();
  const responsiveSize = isTablet ? 'lg' : 'sm';

  const {
    field: { onBlur, onChange, value, ref },
  } = useController<MedicationOrderFormData>({ name: name, control });

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/[^\d]/g, '').slice(0, 2);
      onChange(val ? parseInt(val) : 0);
    },
    [onChange],
  );

  const increment = () => {
    setValue(name, Math.min(Number(value) + 1, maxDispenseDurationInDays));
  };

  const decrement = () => {
    setValue(name, Math.max(Number(value) - 1, 0));
  };

  return (
    <div className={styles.customElement}>
      <span className="cds--label">{labelText}</span>
      <div className={styles.customNumberInput}>
        <IconButton onClick={decrement} label={t('decrement', 'Decrement')} size={responsiveSize}>
          <Subtract size={16} />
        </IconButton>
        <TextInput
          onChange={handleChange}
          className={styles.customInput}
          onBlur={onBlur}
          ref={ref}
          value={!!value ? value : '--'}
          size={responsiveSize}
          {...inputProps}
        />
        <IconButton onClick={increment} label={t('increment', 'Increment')} size={responsiveSize}>
          <AddIcon size={16} />
        </IconButton>
      </div>{' '}
    </div>
  );
};

type MedicationOrderFormValue = MedicationOrderFormData[keyof MedicationOrderFormData];

interface BaseControlledFieldInputProps {
  name: keyof MedicationOrderFormData;
  type: 'toggle' | 'checkbox' | 'number' | 'textArea' | 'textInput' | 'comboBox';
  handleAfterChange?: (newValue: MedicationOrderFormValue, prevValue: MedicationOrderFormValue) => void;
  control: Control<MedicationOrderFormData>;
  getValues?: (name: keyof MedicationOrderFormData) => MedicationOrderFormValue;
}

type ControlledFieldInputProps = Omit<BaseControlledFieldInputProps, 'type'> &
  (
    | ({ type: 'toggle' } & ComponentProps<typeof Toggle>)
    | ({ type: 'checkbox' } & ComponentProps<typeof Checkbox>)
    | ({ type: 'number' } & ComponentProps<typeof NumberInput>)
    | ({ type: 'textArea' } & ComponentProps<typeof TextArea>)
    | ({ type: 'textInput' } & ComponentProps<typeof TextInput>)
    | ({ type: 'comboBox' } & ComponentProps<typeof ComboBox>)
  );

const ControlledFieldInput = ({
  name,
  type,
  control,
  getValues,
  handleAfterChange,
  ...restProps
}: ControlledFieldInputProps) => {
  const {
    field: { onBlur, onChange, value, ref },
    fieldState: { error },
  } = useController<MedicationOrderFormData>({ name: name, control });
  const isTablet = useLayoutType() === 'tablet';
  const responsiveSize = isTablet ? 'lg' : 'sm';

  const fieldErrorStyles = classNames({
    [styles.fieldError]: error?.message,
  });

  const handleChange = useCallback(
    (newValue: MedicationOrderFormValue) => {
      const prevValue = getValues?.(name);
      onChange(newValue);
      handleAfterChange?.(newValue, prevValue);
    },
    [getValues, onChange, handleAfterChange, name],
  );

  const component = useMemo(() => {
    if (type === 'toggle') {
      return (
        <Toggle toggled={value} onToggle={(value: MedicationOrderFormValue) => handleChange(value)} {...restProps} />
      );
    }

    if (type === 'checkbox') {
      return <Checkbox checked={value} onChange={(e, { checked }) => handleChange(checked)} {...restProps} />;
    }

    if (type === 'number') {
      return (
        <NumberInput
          className={fieldErrorStyles}
          disableWheel
          onBlur={onBlur}
          onChange={(e, { value }) => {
            const number = parseFloat(value);
            handleChange(isNaN(number) ? null : number);
          }}
          ref={ref}
          size={responsiveSize}
          value={!!value ? value : 0}
          {...restProps}
        />
      );
    }

    if (type === 'textArea') {
      return (
        <TextArea
          className={fieldErrorStyles}
          onBlur={onBlur}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleChange(e.target.value)}
          ref={ref}
          size={responsiveSize}
          value={value}
          {...restProps}
        />
      );
    }

    if (type === 'textInput') {
      return (
        <TextInput
          className={fieldErrorStyles}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e.target.value)}
          onBlur={onBlur}
          ref={ref}
          size={responsiveSize}
          value={value}
          {...restProps}
        />
      );
    }

    if (type === 'comboBox') {
      return (
        <ComboBox
          className={fieldErrorStyles}
          onBlur={onBlur}
          onChange={({ selectedItem }) => handleChange(selectedItem)}
          ref={ref}
          size={responsiveSize}
          selectedItem={value}
          {...restProps}
        />
      );
    }

    return null;
  }, [type, value, restProps, handleChange, fieldErrorStyles, onBlur, ref, responsiveSize]);

  return (
    <>
      {component}
      <FormLabel className={styles.errorLabel}>{error?.message}</FormLabel>
    </>
  );
};
