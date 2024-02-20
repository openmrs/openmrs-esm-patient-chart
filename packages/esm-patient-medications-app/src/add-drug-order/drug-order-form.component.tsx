import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import capitalize from 'lodash-es/capitalize';
import {
  Button,
  ButtonSet,
  Checkbox,
  Column,
  ComboBox,
  DatePicker,
  DatePickerInput,
  Form,
  FormLabel,
  FormGroup,
  Grid,
  InlineNotification,
  Layer,
  NumberInput,
  TextArea,
  TextInput,
  Toggle,
} from '@carbon/react';
import { Add, ArrowLeft, Subtract } from '@carbon/react/icons';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { type Control, Controller, useController, useForm } from 'react-hook-form';
import {
  age,
  formatDate,
  parseDate,
  translateFrom,
  useConfig,
  useLayoutType,
  usePatient,
} from '@openmrs/esm-framework';
import { useOrderConfig } from '../api/order-config';
import { type ConfigObject } from '../config-schema';
import type {
  DosingUnit,
  DrugOrderBasketItem,
  DurationUnit,
  MedicationFrequency,
  MedicationRoute,
  QuantityUnit,
} from '../types';
import styles from './drug-order-form.scss';
import { moduleName } from '../dashboard.meta';

export interface DrugOrderFormProps {
  initialOrderBasketItem: DrugOrderBasketItem;
  onSave: (finalizedOrder: DrugOrderBasketItem) => void;
  onCancel: () => void;
  promptBeforeClosing: (testFcn: () => boolean) => void;
}

const comboSchema = {
  value: z.string(),
  valueCoded: z.string(),
  default: z.boolean().optional(),
};

const schemaFields = {
  // t( 'freeDosageErrorMessage', 'Add free dosage note')
  freeTextDosage: z.string().refine((value) => value !== '', {
    message: translateFrom(moduleName, 'freeDosageErrorMessage', 'Add free dosage note'),
  }),

  // t( 'dosageRequiredErrorMessage', 'A dosage is required' )
  dosage: z.number({
    invalid_type_error: translateFrom(moduleName, 'dosageRequiredErrorMessage', 'A dosage is required'),
  }),

  // t( 'selectUnitErrorMessage', 'Please select a unit' )
  unit: z.object(
    { ...comboSchema },
    {
      invalid_type_error: translateFrom(moduleName, 'selectUnitErrorMessage', 'Please select a unit'),
    },
  ),

  // t( 'selectRouteErrorMessage', 'Please select a route' )
  route: z.object(
    { ...comboSchema },
    {
      invalid_type_error: translateFrom(moduleName, 'selectRouteErrorMessage', 'Please select a route'),
    },
  ),

  patientInstructions: z.string().nullable(),
  asNeeded: z.boolean(),
  asNeededCondition: z.string().nullable(),
  duration: z.number().nullable(),
  durationUnit: z.object({ ...comboSchema }).nullable(),
  pillsDispensed: z.number({
    invalid_type_error: translateFrom(moduleName, 'pillDispensedErrorMessage', 'The quantity to dispense is required'),
  }),
  quantityUnits: z.object(
    { ...comboSchema },
    {
      invalid_type_error: translateFrom(
        moduleName,
        'selectQuantityUnitsErrorMessage',
        'Please select the quantity unit required for dispensing',
      ),
    },
  ),
  numRefills: z.number().nullable(),
  indication: z.string().refine((value) => value !== '', {
    message: translateFrom(moduleName, 'indicationErrorMessage', 'Please add an indication'),
  }),
  startDate: z.date(),
  // t( 'selectFrequencyErrorMessage', 'Please select a frequency' )
  frequency: z.object(
    { ...comboSchema },
    {
      invalid_type_error: translateFrom(moduleName, 'selectFrequencyErrorMessage', 'Please select a frequency'),
    },
  ),
};

const medicationOrderFormSchema = z.discriminatedUnion('isFreeTextDosage', [
  z.object({
    ...schemaFields,
    isFreeTextDosage: z.literal(false),
    freeTextDosage: z.string().optional(),
  }),
  z.object({
    ...schemaFields,
    isFreeTextDosage: z.literal(true),
    dosage: z.number().nullable(),
    unit: z.object({ ...comboSchema }).nullable(),
    route: z.object({ ...comboSchema }).nullable(),
    frequency: z.object({ ...comboSchema }).nullable(),
  }),
]);

type MedicationOrderFormData = z.infer<typeof medicationOrderFormSchema>;

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
  const isTablet = useLayoutType() === 'tablet';
  const { orderConfigObject, error: errorFetchingOrderConfig } = useOrderConfig();
  const config = useConfig() as ConfigObject;

  const defaultStartDate = useMemo(() => {
    if (typeof initialOrderBasketItem?.startDate === 'string') parseDate(initialOrderBasketItem?.startDate);

    return initialOrderBasketItem?.startDate as Date;
  }, [initialOrderBasketItem?.startDate]);

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { isDirty, errors },
    getValues,
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
  }, [isDirty]);

  const handleUnitAfterChange = useCallback(
    (newValue: MedicationOrderFormData['unit'], prevValue: MedicationOrderFormData['unit']) => {
      if (prevValue?.valueCoded === getValues('quantityUnits')?.valueCoded) {
        setValue('quantityUnits', newValue, { shouldValidate: true });
      }
    },
    [setValue],
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

  const orderFrequencies: Array<MedicationFrequency> = useMemo(
    () => orderConfigObject?.orderFrequencies ?? [],
    [orderConfigObject],
  );

  const [showStickyMedicationHeader, setShowMedicationHeader] = useState(false);
  const { patient, isLoading: isLoadingPatientDetails } = usePatient();
  const patientName = `${patient?.name?.[0]?.given?.join(' ')} ${patient?.name?.[0].family}`;
  const { maxDispenseDurationInDays } = useConfig();

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
                renderIcon={(props) => <ArrowLeft size={24} {...props} />}
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
              <Column className={styles.pullColumnContentRight} lg={4} md={2} sm={4}>
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
                          size={isTablet ? 'lg' : 'md'}
                          id="doseSelection"
                          placeholder={t('editDoseComboBoxPlaceholder', 'Dose')}
                          label={t('editDoseComboBoxTitle', 'Dose')}
                          min={0}
                          hideSteppers={true}
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
                        size={isTablet ? 'lg' : 'md'}
                        id="dosingUnits"
                        items={drugDosingUnits}
                        placeholder={t('editDosageUnitsPlaceholder', 'Unit')}
                        titleText={t('editDosageUnitsTitle', 'Dose unit')}
                        itemToString={(item) => item?.value}
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
                        name="route"
                        type="comboBox"
                        size={isTablet ? 'lg' : 'md'}
                        id="editRoute"
                        items={drugRoutes}
                        placeholder={t('editRouteComboBoxTitle', 'Route')}
                        titleText={t('editRouteComboBoxTitle', 'Route')}
                        itemToString={(item) => item?.value}
                      />
                    </InputWrapper>
                  </Column>
                  <Column lg={8} md={4} sm={4}>
                    <InputWrapper>
                      <ControlledFieldInput
                        control={control}
                        name="frequency"
                        type="comboBox"
                        size={isTablet ? 'lg' : 'md'}
                        id="editFrequency"
                        items={orderFrequencies}
                        placeholder={t('editFrequencyComboBoxTitle', 'Frequency')}
                        titleText={t('editFrequencyComboBoxTitle', 'Frequency')}
                        itemToString={(item) => item?.value}
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
                  <Column lg={16} md={4} sm={4}>
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
                              size="lg"
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
                        <DatePicker
                          datePickerType="single"
                          maxDate={new Date().toISOString()}
                          value={value}
                          onChange={([newStartDate]) => onChange(newStartDate)}
                          onBlur={onBlur}
                          ref={ref}
                        >
                          <DatePickerInput
                            id="startDatePicker"
                            placeholder="mm/dd/yyyy"
                            labelText={t('startDate', 'Start date')}
                            size="lg"
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
                      control={control}
                      name="duration"
                      type="number"
                      size="lg"
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
                      setValue={setValue}
                      name="duration"
                      labelText={t('duration', 'Duration')}
                    />
                  )}
                </InputWrapper>
              </Column>
              <Column lg={8} md={2} sm={4}>
                <InputWrapper>
                  <ControlledFieldInput
                    control={control}
                    name="durationUnit"
                    type="comboBox"
                    size="lg"
                    id="durationUnitPlaceholder"
                    titleText={t('durationUnit', 'Duration unit')}
                    items={durationUnits}
                    itemToString={(item) => item?.value}
                    placeholder={t('durationUnitPlaceholder', 'Duration Unit')}
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
                    size="lg"
                    id="quantityDispensed"
                    label={t('quantityToDispense', 'Quantity to dispense')}
                    min={0}
                    hideSteppers
                  />
                </InputWrapper>
              </Column>
              <Column lg={8} md={3} sm={4}>
                <InputWrapper>
                  <ControlledFieldInput
                    control={control}
                    name="quantityUnits"
                    type="comboBox"
                    size="lg"
                    id="dispensingUnits"
                    items={drugDispensingUnits}
                    placeholder={t('editDispensingUnit', 'Quantity unit')}
                    titleText={t('editDispensingUnit', 'Quantity unit')}
                    itemToString={(item) => item?.value}
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
                      size="lg"
                      id="prescriptionRefills"
                      min={0}
                      label={t('prescriptionRefills', 'Prescription refills')}
                      max={99}
                    />
                  ) : (
                    <CustomNumberInput
                      control={control}
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
                    size="lg"
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

const CustomNumberInput = ({ setValue, control, name, labelText, ...inputProps }) => {
  const { t } = useTranslation();
  const { maxDispenseDurationInDays } = useConfig();

  const {
    field: { onBlur, onChange, value, ref },
  } = useController<MedicationOrderFormData>({ name: name, control });

  const handleChange = (e) => {
    const val = e.target.value.replace(/[^\d]/g, '').slice(0, 2);
    onChange(val ? parseInt(val) : 0);
  };

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
        <Button hasIconOnly renderIcon={Subtract} onClick={decrement} iconDescription={t('decrement', 'Decrement')} />
        <TextInput
          onChange={handleChange}
          value={!!value ? value : '--'}
          size="lg"
          className={styles.customInput}
          onBlur={onBlur}
          ref={ref}
          {...inputProps}
        />
        <Button hasIconOnly renderIcon={Add} onClick={increment} iconDescription={t('increment', 'Increment')} />
      </div>{' '}
    </div>
  );
};

interface ControlledFieldInputProps {
  name: keyof MedicationOrderFormData;
  type: 'toggle' | 'checkbox' | 'number' | 'textArea' | 'textInput' | 'comboBox';
  handleAfterChange?: (
    newValue: MedicationOrderFormData[keyof MedicationOrderFormData],
    prevValue: MedicationOrderFormData[keyof MedicationOrderFormData],
  ) => void;
  control: Control<MedicationOrderFormData>;
  [x: string]: any;
}

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
    fieldState,
  } = useController<MedicationOrderFormData>({ name: name, control });

  const handleChange = useCallback(
    (newValue: MedicationOrderFormData[keyof MedicationOrderFormData]) => {
      const prevValue = getValues?.(name);
      onChange(newValue);
      handleAfterChange?.(newValue, prevValue);
    },
    [getValues, onChange, handleAfterChange],
  );

  const component = useMemo(() => {
    if (type === 'toggle')
      return (
        <Toggle
          toggled={value}
          onChange={() => {} /* Required by the typings, but we don't need it. */}
          onToggle={(value) => handleChange(value)}
          {...restProps}
        />
      );

    if (type === 'checkbox')
      return <Checkbox checked={value} onChange={(e, { checked, id }) => handleChange(checked)} {...restProps} />;

    if (type === 'number')
      return (
        <NumberInput
          value={!!value ? value : 0}
          onChange={(e, { value }) => handleChange(parseFloat(value))}
          className={fieldState?.error?.message && styles.fieldError}
          onBlur={onBlur}
          ref={ref}
          {...restProps}
        />
      );

    if (type === 'textArea')
      return (
        <TextArea
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={onBlur}
          ref={ref}
          className={fieldState?.error?.message && styles.fieldError}
          {...restProps}
        />
      );

    if (type === 'textInput')
      return (
        <TextInput
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          ref={ref}
          onBlur={onBlur}
          className={fieldState?.error?.message && styles.fieldError}
          {...restProps}
        />
      );

    if (type === 'comboBox')
      return (
        <ComboBox
          selectedItem={value}
          onChange={({ selectedItem }) => handleChange(selectedItem)}
          onBlur={onBlur}
          ref={ref}
          className={fieldState?.error?.message && styles.fieldError}
          {...restProps}
        />
      );

    return null;
  }, [fieldState?.error?.message, onBlur, onChange, ref, restProps, type, value]);

  return (
    <>
      {component}
      <FormLabel className={styles.errorLabel}>{fieldState?.error?.message}</FormLabel>
    </>
  );
};
