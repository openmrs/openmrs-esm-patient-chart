import React, { type ChangeEvent, type ComponentProps, useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import {
  Button,
  ButtonSet,
  Checkbox,
  Column,
  ComboBox,
  Form,
  FormGroup,
  FormLabel,
  Grid,
  IconButton,
  InlineLoading,
  InlineNotification,
  Layer,
  NumberInput,
  Stack,
  TextArea,
  TextInput,
  Toggle,
} from '@carbon/react';
import { Subtract } from '@carbon/react/icons';
import { capitalize } from 'lodash-es';
import {
  AddIcon,
  age,
  ExtensionSlot,
  formatDate,
  getPatientName,
  OpenmrsDatePicker,
  parseDate,
  showSnackbar,
  useConfig,
  useLayoutType,
  Workspace2,
  type Visit,
} from '@openmrs/esm-framework';
import { type Control, Controller, type FieldErrors, useController } from 'react-hook-form';
import {
  type Drug,
  type CommonMedicationValueCoded,
  type DosingUnit,
  type DrugOrderBasketItem,
  type DurationUnit,
  type MedicationFrequency,
  type MedicationRoute,
  type QuantityUnit,
} from '@openmrs/esm-patient-common-lib';
import { useOrderConfig } from '../api/order-config';
import { type ConfigObject } from '../config-schema';
import { useActivePatientOrders } from '../api';
import styles from './drug-order-form.scss';
import {
  type CodedIndication,
  type MedicationOrderFormData,
  useDrugOrderForm,
  useIndicationSearch,
} from './drug-order-form.resource';

export interface DrugOrderFormProps {
  /**
   * This is either an order pending in the order basket, or an existing order saved to the backend for editing.
   */
  initialOrderBasketItem: DrugOrderBasketItem | null;
  patient: fhir.Patient;
  visitContext: Visit;
  onSave: (finalizedOrder: DrugOrderBasketItem) => Promise<void>;
  saveButtonText: string;
  onCancel: () => void;
  workspaceTitle: string;
}

function MedicationInfoHeader({
  drug,
  routeValue,
  unitValue,
  dosage,
}: {
  drug: Drug;
  routeValue: string;
  unitValue: string;
  dosage: number | null;
}) {
  const { t } = useTranslation();

  return (
    <div className={styles.medicationInfo} id="medicationInfo">
      <strong className={styles.productiveHeading02}>
        {drug?.display} {drug?.strength && `(${drug?.strength})`}
      </strong>{' '}
      <span className={styles.bodyLong01}>
        {routeValue && <>&mdash; {routeValue}</>}{' '}
        {drug?.dosageForm?.display && <>&mdash; {drug?.dosageForm?.display}</>}{' '}
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
      <ExtensionSlot name="medication-info-slot" state={{ order: { drug } as DrugOrderBasketItem }} />
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

export function DrugOrderForm({
  initialOrderBasketItem: initialOrderBasketItem,
  patient,
  onSave,
  saveButtonText,
  onCancel,
  visitContext,
  workspaceTitle,
}: DrugOrderFormProps) {
  const { t } = useTranslation();
  const { daysDurationUnit, useCodedIndication } = useConfig<ConfigObject>();
  const isTablet = useLayoutType() === 'tablet';
  const { orderConfigObject, error: errorFetchingOrderConfig } = useOrderConfig();

  const [isSaving, setIsSaving] = useState(false);
  const drugOrderForm = useDrugOrderForm(initialOrderBasketItem);
  const {
    control,
    formState: { isDirty },
    getValues,
    reset,
    handleSubmit,
    setValue,
    watch,
  } = drugOrderForm;

  // reset the dosage information if set to free text dosage
  const handleIsFreeTextDosageAfterChange = useCallback(
    (newValue: MedicationOrderFormData['isFreeTextDosage']) => {
      if (newValue) {
        setValue('dosage', null, { shouldValidate: true });
        setValue('unit', null, { shouldValidate: true });
        setValue('route', null, { shouldValidate: true });
        setValue('frequency', null, { shouldValidate: true });
        setValue('patientInstructions', null, { shouldValidate: true });
      } else {
        setValue('freeTextDosage', null, { shouldValidate: true });
      }
    },
    [setValue],
  );

  const handleUnitAfterChange = useCallback(
    (newValue: MedicationOrderFormData['unit'], prevValue: MedicationOrderFormData['unit']) => {
      if (prevValue?.valueCoded === getValues('quantityUnits')?.valueCoded) {
        setValue('quantityUnits', newValue, { shouldValidate: true });
      }
    },
    [setValue, getValues],
  );

  const drug = watch('drug') as Drug;
  const routeValue = watch('route')?.value;
  const unitValue = watch('unit')?.value;
  const dosage = watch('dosage');
  const startDate = watch('startDate');
  const selectedIndicationCoded = watch('indicationCoded');

  const [indicationSearchTerm, setIndicationSearchTerm] = useState('');
  const { searchResults: codedIndications, isSearching: isSearchingIndications } =
    useIndicationSearch(indicationSearchTerm);

  const handleFormSubmission = async (data: MedicationOrderFormData) => {
    const newBasketItem = {
      ...initialOrderBasketItem,
      drug: data.drug,
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
      indicationCoded: data.indicationCoded,
      frequency: data.frequency,
      startDate: data.startDate,
      action: initialOrderBasketItem?.action ?? 'NEW',
      commonMedicationName: data.drug.display,
      display: data.drug.display,
      visit: initialOrderBasketItem?.visit ?? visitContext, // TODO: they really should be the same
    } as DrugOrderBasketItem;

    setIsSaving(true);
    await onSave(newBasketItem);
    setIsSaving(false);
  };

  const handleFormSubmissionError = (errors: FieldErrors<MedicationOrderFormData>) => {
    if (errors) {
      console.error('Error in drug order form', errors);
      showSnackbar({
        title: t('drugOrderValidationFailed', 'Validation failed'),
        subtitle: t('drugOrderValidationFailedDescription', 'Please check the form for errors and try again.'),
        kind: 'error',
        timeoutInMs: 5000,
        isLowContrast: true,
      });
    }
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
          valueCoded: daysDurationUnit?.uuid,
          value: daysDurationUnit?.display,
        },
      ],
    [orderConfigObject, daysDurationUnit],
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
  const patientName = patient ? getPatientName(patient) : '';

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
  const {
    fieldState: { error: drugFieldError },
  } = useController<MedicationOrderFormData>({ name: 'drug', control });

  // TODO: use the backend instead of this to determine whether the drug formulation can be ordered
  // See: https://openmrs.atlassian.net/browse/RESTWS-1003
  const { data: activeOrders } = useActivePatientOrders(patient.id);
  const drugAlreadyPrescribedForNewOrder = useMemo(
    () =>
      (initialOrderBasketItem == null || initialOrderBasketItem?.action == 'NEW') &&
      activeOrders?.some((order) => order?.drug?.uuid === drug?.uuid),
    [activeOrders, drug, initialOrderBasketItem],
  );

  return (
    <Workspace2 title={workspaceTitle} hasUnsavedChanges={isDirty}>
      <div className={styles.container}>
        {showStickyMedicationHeader && (
          <div className={styles.stickyMedicationInfo}>
            <MedicationInfoHeader dosage={dosage} drug={drug} routeValue={routeValue} unitValue={unitValue} />
          </div>
        )}
        <div className={styles.patientHeader}>
          <span className={styles.bodyShort02}>{patientName}</span>
          <span className={classNames(styles.text02, styles.bodyShort01)}>
            {capitalize(patient?.gender)} &middot; {age(patient?.birthDate)} &middot;{' '}
            <span>{formatDate(parseDate(patient?.birthDate), { mode: 'wide', time: false })}</span>
          </span>
        </div>
        <ExtensionSlot name="allergy-list-pills-slot" state={{ patientUuid: patient?.id }} />
        <Form
          className={styles.orderForm}
          onSubmit={handleSubmit(handleFormSubmission, handleFormSubmissionError)}
          id="drugOrderForm"
        >
          <div>
            {errorFetchingOrderConfig && (
              <InlineNotification
                kind="error"
                lowContrast
                className={styles.inlineNotification}
                title={t('errorFetchingOrderConfig', 'Error occurred when fetching Order config')}
                subtitle={t('tryReopeningTheForm', 'Please try launching the form again')}
              />
            )}
            <h1 className={styles.orderFormHeading}>{t('orderForm', 'Order Form')}</h1>
            <div ref={medicationInfoHeaderRef}>
              <MedicationInfoHeader dosage={dosage} drug={drug} routeValue={routeValue} unitValue={unitValue} />
            </div>
            <section className={styles.formSection}>
              <Grid className={styles.gridRow}>
                <Column lg={12} md={6} sm={4}>
                  <h3 className={styles.sectionHeader}>{t('dosageInstructions', 'Dosage instructions')}</h3>
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
                    handleAfterChange={handleIsFreeTextDosageAfterChange}
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
                    <Column lg={16} md={4} sm={4}>
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
                    <Column lg={16} md={4} sm={4}>
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
              <h3 className={styles.sectionHeader}>{t('prescriptionDuration', 'Prescription duration')}</h3>
              <Grid className={styles.gridRow}>
                {/* TODO: This input does nothing */}
                <Column lg={16} md={4} sm={4}>
                  <div className={styles.fullWidthDatePickerContainer}>
                    <InputWrapper>
                      <Controller
                        name="startDate"
                        control={control}
                        render={({ field, fieldState }) => (
                          <OpenmrsDatePicker
                            {...field}
                            maxDate={new Date()}
                            id="startDatePicker"
                            labelText={t('startDate', 'Start date')}
                            size={isTablet ? 'lg' : 'sm'}
                            invalid={Boolean(fieldState?.error?.message)}
                            invalidText={fieldState?.error?.message}
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
                        allowEmpty
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
              <h3 className={styles.sectionHeader}>{t('dispensingInformation', 'Dispensing instructions')}</h3>
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
                    {useCodedIndication ? (
                      <>
                        <ControlledFieldInput
                          control={control}
                          name="indicationCoded"
                          type="comboBox"
                          id="indicationCoded"
                          titleText={t('indication', 'Indication')}
                          placeholder={t('searchForIndication', 'Search for indication e.g "Hypertension"')}
                          items={codedIndications}
                          itemToString={(item: CodedIndication) => item?.display ?? ''}
                          shouldFilterItem={() => true}
                          onInputChange={(input: string | { inputValue: string }) => {
                            if (typeof input === 'string') {
                              setIndicationSearchTerm(input);
                            } else if (input && typeof input.inputValue === 'string') {
                              setIndicationSearchTerm(input.inputValue);
                            }
                          }}
                        />
                        {isSearchingIndications && !selectedIndicationCoded && (
                          <div className={styles.inlineLoader}>
                            <InlineLoading description={t('searching', 'Searching') + '...'} />
                          </div>
                        )}
                      </>
                    ) : (
                      <ControlledFieldInput
                        control={control}
                        name="indication"
                        type="textInput"
                        id="indication"
                        labelText={t('indication', 'Indication')}
                        placeholder={t('indicationPlaceholder', 'e.g. "Hypertension"')}
                        maxLength={150}
                      />
                    )}
                  </InputWrapper>
                </Column>
              </Grid>
            </section>
          </div>

          <ButtonSet className={styles.buttonSet}>
            <Button className={styles.button} kind="secondary" onClick={onCancel} size="xl">
              {t('discard', 'Discard')}
            </Button>
            <Button
              className={styles.button}
              kind="primary"
              type="submit"
              size="xl"
              disabled={!!errorFetchingOrderConfig || isSaving || drugAlreadyPrescribedForNewOrder}
            >
              {saveButtonText}
            </Button>
          </ButtonSet>
        </Form>
      </div>
    </Workspace2>
  );
}

interface CustomNumberInputProps {
  setValue: (name: keyof MedicationOrderFormData, value: number) => void;
  control: Control<MedicationOrderFormData>;
  name: keyof MedicationOrderFormData;
  labelText: string;
  isTablet: boolean;
  inputProps?: Partial<ComponentProps<typeof TextInput>>;
}

const CustomNumberInput = ({ setValue, control, name, labelText, isTablet, ...inputProps }: CustomNumberInputProps) => {
  const { t } = useTranslation();
  const responsiveSize = isTablet ? 'md' : 'sm';

  const {
    field: { onBlur, onChange, value, ref },
  } = useController<MedicationOrderFormData>({ name, control });

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const number = parseFloat(String(e.target.value));
      onChange(isNaN(number) ? null : number);
    },
    [onChange],
  );

  const increment = () => {
    setValue(name, Number(value) + 1);
  };

  const decrement = () => {
    setValue(name, Math.max(Number(value) - 1, 0));
  };

  return (
    <div className={styles.customElement}>
      <span className="cds--label" id={`${name}-label`}>
        {labelText}
      </span>
      <div className={styles.customNumberInput}>
        <IconButton onClick={decrement} label={t('decrement', 'Decrement')} size={responsiveSize}>
          <Subtract size={16} />
        </IconButton>
        <TextInput
          onChange={handleChange}
          className={styles.customInput}
          onBlur={onBlur}
          ref={ref}
          value={typeof value === 'string' || typeof value === 'number' ? value : '--'}
          size={responsiveSize}
          id={name}
          labelText=""
          aria-labelledby={`${name}-label`}
          {...inputProps}
        />
        <IconButton onClick={increment} label={t('increment', 'Increment')} size={responsiveSize}>
          <AddIcon size={16} />
        </IconButton>
      </div>
    </div>
  );
};

interface BaseControlledFieldInputProps {
  control: Control<MedicationOrderFormData>;
  name: keyof MedicationOrderFormData;
  type: 'number' | 'toggle' | 'checkbox' | 'textArea' | 'textInput' | 'comboBox';
  getValues?: (name: keyof MedicationOrderFormData) => any;
  handleAfterChange?: (newValue: any, prevValue: any) => void;
}

type ControlledFieldInputProps = BaseControlledFieldInputProps &
  (
    | ({ type: 'number' } & Omit<ComponentProps<typeof NumberInput>, 'onChange' | 'onBlur' | 'value' | 'ref'>)
    | ({ type: 'toggle' } & Omit<ComponentProps<typeof Toggle>, 'onChange' | 'onBlur' | 'toggled' | 'ref'>)
    | ({ type: 'checkbox' } & Omit<ComponentProps<typeof Checkbox>, 'onChange' | 'onBlur' | 'checked' | 'ref'> & {
          labelText: string;
        })
    | ({ type: 'textArea' } & Omit<ComponentProps<typeof TextArea>, 'onChange' | 'onBlur' | 'value' | 'ref'>)
    | ({ type: 'textInput' } & Omit<ComponentProps<typeof TextInput>, 'onChange' | 'onBlur' | 'value' | 'ref'>)
    | ({ type: 'comboBox' } & Omit<ComponentProps<typeof ComboBox>, 'onChange' | 'onBlur' | 'selectedItem' | 'ref'>)
  );

const ControlledFieldInput = ({
  control,
  name,
  type,
  getValues,
  handleAfterChange,
  ...restProps
}: ControlledFieldInputProps) => {
  const { t } = useTranslation();
  const {
    field: { onBlur, onChange, value, ref },
    fieldState: { error },
  } = useController<MedicationOrderFormData>({ name, control });
  const isTablet = useLayoutType() === 'tablet';

  const fieldErrorStyles = classNames({
    [styles.fieldError]: error?.message,
  });

  const handleChange = useCallback(
    (newValue: any) => {
      const prevValue = getValues?.(name);
      onChange(newValue);
      handleAfterChange?.(newValue, prevValue);
    },
    [getValues, onChange, handleAfterChange, name],
  );

  const component = useMemo(() => {
    if (type === 'toggle') {
      return (
        <Toggle
          toggled={Boolean(value)}
          onToggle={handleChange}
          ref={ref}
          // @ts-ignore
          size={isTablet ? 'md' : 'sm'}
          labelA={t('on', 'On')}
          labelB={t('off', 'Off')}
          {...restProps}
        />
      );
    }

    if (type === 'checkbox') {
      const checkboxProps = restProps as ComponentProps<typeof Checkbox>;
      return (
        <Checkbox
          checked={Boolean(value)}
          labelText={checkboxProps.labelText}
          onChange={(_, { checked }) => handleChange(checked)}
          ref={ref}
          {...checkboxProps}
        />
      );
    }

    if (type === 'number') {
      const numberInputProps = restProps as ComponentProps<typeof NumberInput>;
      return (
        <NumberInput
          allowEmpty
          className={fieldErrorStyles}
          disableWheel
          onBlur={onBlur}
          onChange={(_, { value }) => {
            const number = parseFloat(String(value));
            handleChange(isNaN(number) ? null : number);
          }}
          ref={ref}
          size={isTablet ? 'md' : 'sm'}
          value={typeof value === 'number' ? value : ''}
          {...numberInputProps}
        />
      );
    }

    if (type === 'textArea') {
      const textAreaProps = restProps as ComponentProps<typeof TextArea>;
      return (
        <TextArea
          className={fieldErrorStyles}
          onBlur={onBlur}
          onChange={(e) => handleChange(e.target.value)}
          ref={ref}
          value={typeof value === 'string' ? value : ''}
          {...textAreaProps}
        />
      );
    }

    if (type === 'textInput') {
      const textInputProps = restProps as ComponentProps<typeof TextInput>;
      return (
        <TextInput
          className={fieldErrorStyles}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={onBlur}
          ref={ref}
          size={isTablet ? 'md' : 'sm'}
          value={typeof value === 'string' ? value : ''}
          {...textInputProps}
        />
      );
    }

    if (type === 'comboBox') {
      const comboBoxProps = restProps as ComponentProps<typeof ComboBox>;
      return (
        <ComboBox
          className={fieldErrorStyles}
          onBlur={onBlur}
          onChange={({ selectedItem }) => handleChange(selectedItem)}
          ref={ref}
          size={isTablet ? 'md' : 'sm'}
          selectedItem={value}
          initialSelectedItem={value}
          {...comboBoxProps}
        />
      );
    }

    return null;
  }, [type, value, restProps, handleChange, fieldErrorStyles, onBlur, ref, isTablet, t]);

  return (
    <>
      {component}
      <FormLabel className={styles.errorLabel}>{error?.message}</FormLabel>
    </>
  );
};

export default DrugOrderForm;
