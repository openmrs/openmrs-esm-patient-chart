import React, { type ChangeEvent, type ComponentProps, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { capitalize } from 'lodash-es';
import { Subtract } from '@carbon/react/icons';
import { type Control, Controller, useController, useForm } from 'react-hook-form';
import { type TFunction, useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Button,
  ButtonSet,
  Checkbox,
  Column,
  ComboBox,
  DatePicker,
  DatePickerInput,
  Form,
  FormGroup,
  FormLabel,
  Grid,
  IconButton,
  InlineNotification,
  Layer,
  NumberInput,
  TextArea,
  TextInput,
  Toggle,
} from '@carbon/react';
import {
  AddIcon,
  age,
  ArrowLeftIcon,
  ExtensionSlot,
  formatDate,
  getPatientName,
  parseDate,
  useConfig,
  useLayoutType,
  usePatient,
} from '@openmrs/esm-framework';
import { usePatientChartStore } from '@openmrs/esm-patient-common-lib';
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

export interface DrugOrderFormProps {
  initialOrderBasketItem: DrugOrderBasketItem;
  onSave: (finalizedOrder: DrugOrderBasketItem) => void;
  onCancel: () => void;
  promptBeforeClosing: (testFcn: () => boolean) => void;
}

const createMedicationOrderFormSchema = (requireOutpatientQuantity: boolean, t: TFunction) => {
  const comboSchema = {
    default: z.boolean().optional(),
    value: z.string(),
    valueCoded: z.string(),
  };

  const baseSchemaFields = {
    activationDate: z.date(),
    asNeeded: z.boolean(),
    asNeededCondition: z.string().nullable(),
    dosage: z.number({
      invalid_type_error: t('dosageRequiredErrorMessage', 'Dosage is required'),
    }),
    duration: z.number().nullable(),
    durationUnit: z.object({ ...comboSchema }).nullable(),
    frequency: z.object(
      { ...comboSchema },
      {
        invalid_type_error: t('selectFrequencyErrorMessage', 'Frequency is required'),
      },
    ),
    freeTextDosage: z.string().refine((value) => !!value, {
      message: t('freeDosageErrorMessage', 'Add free dosage note'),
    }),
    indication: z.string().refine((value) => value !== '', {
      message: t('indicationErrorMessage', 'Indication is required'),
    }),
    patientInstructions: z.string().nullable(),
    route: z.object(
      { ...comboSchema },
      {
        invalid_type_error: t('selectRouteErrorMessage', 'Route is required'),
      },
    ),
    unit: z.object(
      { ...comboSchema },
      {
        invalid_type_error: t('selectUnitErrorMessage', 'Dose unit is required'),
      },
    ),
  };

  const outpatientDrugOrderFields = {
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
  };

  const nonFreeTextDosageSchema = z.object({
    ...baseSchemaFields,
    ...outpatientDrugOrderFields,
    freeTextDosage: z.string().optional(),
    isFreeTextDosage: z.literal(false),
  });

  const freeTextDosageSchema = z.object({
    ...baseSchemaFields,
    ...outpatientDrugOrderFields,
    dosage: z.number().nullable(),
    frequency: z.object(comboSchema).nullable(),
    isFreeTextDosage: z.literal(true),
    route: z.object(comboSchema).nullable(),
    unit: z.object(comboSchema).nullable(),
  });

  return z.discriminatedUnion('isFreeTextDosage', [nonFreeTextDosageSchema, freeTextDosageSchema]);
};

type MedicationOrderFormData = z.infer<ReturnType<typeof createMedicationOrderFormSchema>>;

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
  const { requireOutpatientQuantity } = useRequireOutpatientQuantity();

  const defaultActivationDate = useMemo(() => {
    if (typeof initialOrderBasketItem?.dateActivated === 'string') {
      return parseDate(initialOrderBasketItem?.dateActivated);
    }
    return initialOrderBasketItem?.dateActivated;
  }, [initialOrderBasketItem]);

  const medicationOrderFormSchema = useMemo(
    () => createMedicationOrderFormSchema(requireOutpatientQuantity, t),
    [requireOutpatientQuantity, t],
  );

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
      activationDate: defaultActivationDate,
      asNeeded: initialOrderBasketItem?.asNeeded,
      asNeededCondition: initialOrderBasketItem?.asNeededCondition,
      dosage: initialOrderBasketItem?.dosage,
      duration: initialOrderBasketItem?.duration,
      durationUnit: initialOrderBasketItem?.durationUnit,
      freeTextDosage: initialOrderBasketItem?.freeTextDosage,
      frequency: initialOrderBasketItem?.frequency,
      indication: initialOrderBasketItem?.indication,
      isFreeTextDosage: initialOrderBasketItem?.isFreeTextDosage,
      numRefills: initialOrderBasketItem?.numRefills,
      patientInstructions: initialOrderBasketItem?.patientInstructions,
      pillsDispensed: initialOrderBasketItem?.pillsDispensed,
      quantityUnits: initialOrderBasketItem?.quantityUnits,
      route: initialOrderBasketItem?.route,
      unit: initialOrderBasketItem?.unit,
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
    const { activationDate, ...formData } = data;
    const newBasketItems: DrugOrderBasketItem = {
      ...initialOrderBasketItem,
      ...formData,
      dateActivated: activationDate,
    };
    onSave(newBasketItems);
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
  const { patientUuid } = usePatientChartStore();
  const { patient, isLoading: isLoadingPatientDetails } = usePatient(patientUuid);
  const patientName = patient ? getPatientName(patient) : '';
  const { maxDispenseDurationInDays } = useConfig<ConfigObject>();

  const observer = useRef(null);
  const medicationInfoHeaderRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        ([e]) => {
          setShowMedicationHeader(e.intersectionRatio < 1);
        },
        {
          threshold: 1,
        },
      );
      if (node) observer.current.observe(node);
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
      {isTablet && !isLoadingPatientDetails && (
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
              className={styles.inlineNotification}
              kind="error"
              lowContrast
              subtitle={t('tryReopeningTheForm', 'Please try launching the form again')}
              title={t('errorFetchingOrderConfig', 'Error occured when fetching Order config')}
            />
          )}
          {!isTablet && (
            <div className={styles.backButton}>
              <Button
                iconDescription="Return to order basket"
                kind="ghost"
                onClick={onCancel}
                renderIcon={(props: ComponentProps<typeof ArrowLeftIcon>) => <ArrowLeftIcon size={24} {...props} />}
                size="sm"
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
                  aria-label={t('freeTextDosage', 'Free text dosage')}
                  control={control}
                  id="freeTextDosageToggle"
                  labelText={t('freeTextDosage', 'Free text dosage')}
                  name="isFreeTextDosage"
                  size="sm"
                  type="toggle"
                />
              </Column>
            </Grid>
            {watch('isFreeTextDosage') ? (
              <Grid className={styles.gridRow}>
                <Column md={8}>
                  <ControlledFieldInput
                    control={control}
                    labelText={t('freeTextDosage', 'Free text dosage')}
                    maxLength={65535}
                    name="freeTextDosage"
                    placeholder={t('freeTextDosage', 'Free text dosage')}
                    type="textArea"
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
                          hideSteppers
                          id="doseSelection"
                          label={t('editDoseComboBoxTitle', 'Dose')}
                          min={0}
                          name="dosage"
                          placeholder={t('editDoseComboBoxPlaceholder', 'Dose')}
                          step={0.01}
                          type="number"
                        />
                      </div>
                    </InputWrapper>
                  </Column>
                  <Column lg={8} md={4} sm={4}>
                    <InputWrapper>
                      <ControlledFieldInput
                        control={control}
                        getValues={getValues}
                        handleAfterChange={handleUnitAfterChange}
                        id="dosingUnits"
                        items={drugDosingUnits}
                        itemToString={(item: CommonMedicationValueCoded) => item?.value}
                        name="unit"
                        placeholder={t('editDosageUnitsPlaceholder', 'Unit')}
                        shouldFilterItem={filterItemsByName}
                        titleText={t('editDosageUnitsTitle', 'Dose unit')}
                        type="comboBox"
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
                        id="editFrequency"
                        items={orderFrequencies}
                        itemToString={(item: CommonMedicationValueCoded) => item?.value}
                        name="frequency"
                        placeholder={t('editFrequencyComboBoxTitle', 'Frequency')}
                        shouldFilterItem={filterItemsBySynonymNames}
                        titleText={t('editFrequencyComboBoxTitle', 'Frequency')}
                        type="comboBox"
                      />
                    </InputWrapper>
                  </Column>
                </Grid>

                <Grid className={styles.gridRow}>
                  <Column lg={16} md={4} sm={4}>
                    <InputWrapper>
                      <ControlledFieldInput
                        control={control}
                        labelText={t('patientInstructions', 'Patient instructions')}
                        maxLength={65535}
                        name="patientInstructions"
                        placeholder={t(
                          'patientInstructionsPlaceholder',
                          'Additional dosing instructions (e.g. "Take after eating")',
                        )}
                        rows={isTablet ? 6 : 4}
                        type="textArea"
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
                              id="prn"
                              labelText={t('takeAsNeeded', 'Take as needed')}
                              name="asNeeded"
                              type="checkbox"
                            />
                          </FormGroup>
                        </InputWrapper>
                      </Column>

                      <Column lg={10} md={8} sm={4}>
                        <InputWrapper>
                          <ControlledFieldInput
                            control={control}
                            disabled={!watch('asNeeded')}
                            labelText={t('prnReason', 'P.R.N. reason')}
                            maxLength={255}
                            name="asNeededCondition"
                            placeholder={t('prnReasonPlaceholder', 'Reason to take medicine')}
                            rows={3}
                            type="textArea"
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
              <Column lg={16} md={4} sm={4}>
                <div className={styles.fullWidthDatePickerContainer}>
                  <InputWrapper>
                    <Controller
                      name="activationDate"
                      control={control}
                      render={({ field: { onBlur, value, onChange, ref } }) => (
                        <DatePicker
                          dateFormat="d/m/Y"
                          datePickerType="single"
                          maxDate={new Date().toISOString()}
                          onBlur={onBlur}
                          onChange={([newActivationDate]) => onChange(newActivationDate)}
                          ref={ref}
                          value={value}
                        >
                          <DatePickerInput
                            id="activationDatePicker"
                            labelText={t('activationDate', 'Activation date')}
                            placeholder="dd/mm/yyyy"
                            size={isTablet ? 'lg' : 'sm'}
                          />
                        </DatePicker>
                      )}
                    />
                  </InputWrapper>
                </div>
              </Column>
              <Column lg={8} md={2} sm={4} className={styles.linkedInput}>
                <InputWrapper>
                  {!isTablet ? (
                    <ControlledFieldInput
                      allowEmpty
                      control={control}
                      id="durationInput"
                      label={t('duration', 'Duration')}
                      max={maxDispenseDurationInDays}
                      min={0}
                      name="duration"
                      step={1}
                      type="number"
                    />
                  ) : (
                    <CustomNumberInput
                      control={control}
                      isTablet={isTablet}
                      labelText={t('duration', 'Duration')}
                      name="duration"
                      setValue={setValue}
                    />
                  )}
                </InputWrapper>
              </Column>
              <Column className={styles.durationUnit} lg={8} md={2} sm={4}>
                <InputWrapper>
                  <ControlledFieldInput
                    control={control}
                    id="durationUnitPlaceholder"
                    items={durationUnits}
                    itemToString={(item: CommonMedicationValueCoded) => item?.value}
                    name="durationUnit"
                    placeholder={t('durationUnitPlaceholder', 'Duration Unit')}
                    shouldFilterItem={filterItemsByName}
                    titleText={t('durationUnit', 'Duration unit')}
                    type="comboBox"
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
                    allowEmpty
                    control={control}
                    hideSteppers
                    id="quantityDispensed"
                    label={t('quantityToDispense', 'Quantity to dispense')}
                    min={0}
                    name="pillsDispensed"
                    type="number"
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
                      allowEmpty
                      control={control}
                      id="prescriptionRefills"
                      label={t('prescriptionRefills', 'Prescription refills')}
                      max={99}
                      min={0}
                      name="numRefills"
                      type="number"
                    />
                  ) : (
                    <CustomNumberInput
                      control={control}
                      isTablet={isTablet}
                      labelText={t('prescriptionRefills', 'Prescription refills')}
                      name="numRefills"
                      setValue={setValue}
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
                    id="indication"
                    labelText={t('indication', 'Indication')}
                    maxLength={150}
                    name="indication"
                    placeholder={t('indicationPlaceholder', 'e.g. "Hypertension"')}
                    type="textInput"
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
            disabled={!!errorFetchingOrderConfig}
            kind="primary"
            size="xl"
            type="submit"
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
          className={styles.customInput}
          onBlur={onBlur}
          onChange={handleChange}
          ref={ref}
          size={responsiveSize}
          value={!!value ? value : '--'}
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
          onChange={(e, { value }) => {
            const number = parseFloat(value);
            handleChange(isNaN(number) ? null : number);
          }}
          onBlur={onBlur}
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
          onBlur={onBlur}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e.target.value)}
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
          selectedItem={value}
          size={responsiveSize}
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
