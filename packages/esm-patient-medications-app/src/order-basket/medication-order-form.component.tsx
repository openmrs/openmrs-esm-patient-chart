import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Button,
  ButtonSet,
  Checkbox,
  Column,
  ComboBox,
  Form,
  FormGroup,
  Grid,
  TextArea,
  TextInput,
  Toggle,
  NumberInput,
  DatePicker,
  DatePickerInput,
  InlineNotification,
  Layer,
} from '@carbon/react';
import { ArrowLeft, Add, Subtract } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { useConfig, useLayoutType, usePatient, age, formatDate, parseDate } from '@openmrs/esm-framework';
import { OrderBasketItem } from '../types/order-basket-item';
import { useOrderConfig } from '../api/order-config';
import styles from './medication-order-form.scss';
import { useDurationUnits } from '../api/api';
import capitalize from 'lodash-es/capitalize';

export interface MedicationOrderFormProps {
  initialOrderBasketItem: OrderBasketItem;
  onSign: (finalizedOrder: OrderBasketItem) => void;
  onCancel: () => void;
}

function addIfNotPresent(
  optionsList: Array<{ id: string; text: string }>,
  option: { value: any; valueCoded?: string },
): Array<{ id: string; text: string }> {
  let ret = optionsList || [];
  if (!option) return ret;
  const id = option?.valueCoded ? option?.valueCoded : `${option.value}`;
  if (!ret.some((x) => x.id == id)) {
    return [...ret, { id: id, text: `${option.value}` }];
  }
  return ret;
}

function MedicationInfoHeader({ orderBasketItem }: { orderBasketItem: OrderBasketItem }) {
  const { t } = useTranslation();
  return (
    <div className={styles.medicationInfo} id="medicationInfo">
      <strong className={styles.productiveHeading02}>
        {orderBasketItem?.drug?.display} {orderBasketItem?.drug?.strength && `(${orderBasketItem.drug?.strength})`}
      </strong>{' '}
      <span className={styles.bodyLong01}>
        {orderBasketItem?.route?.value && <>&mdash; {orderBasketItem?.route?.value}</>}{' '}
        {orderBasketItem?.drug?.dosageForm?.display && <>&mdash; {orderBasketItem?.drug?.dosageForm?.display}</>}{' '}
      </span>
      {orderBasketItem?.dosage && orderBasketItem?.unit?.value ? (
        <>
          &mdash; <span className={styles.caption01}>{t('dose', 'Dose').toUpperCase()}</span>{' '}
          <strong>
            <span className={styles.productiveHeading02}>
              {orderBasketItem?.dosage} {orderBasketItem?.unit?.value.toLowerCase()}
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

export default function MedicationOrderForm({ initialOrderBasketItem, onSign, onCancel }: MedicationOrderFormProps) {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const isTablet = useLayoutType() === 'tablet';
  const [orderBasketItem, setOrderBasketItem] = useState(initialOrderBasketItem);
  const template = initialOrderBasketItem.template;
  const { orderConfigObject } = useOrderConfig();
  const config = useConfig();
  const {
    isLoadingDurationUnits,
    durationUnits,
    error: fetchingDurationUnitsError,
  } = useDurationUnits(config.durationUnitsConcept);
  const [showStickyMedicationHeader, setShowMedicationHeader] = useState(false);
  const { patient, isLoading: isLoadingPatientDetails } = usePatient();
  const patientName = `${patient?.name?.[0]?.given?.join(' ')} ${patient?.name?.[0].family}`;

  const doseWithUnitsLabel = template ? (
    `(${initialOrderBasketItem?.dosage} ${initialOrderBasketItem?.unit?.value})`
  ) : (
    <>
      {initialOrderBasketItem?.drug?.strength && <>&mdash; {initialOrderBasketItem?.drug?.strength.toLowerCase()}</>}{' '}
      {initialOrderBasketItem?.drug?.dosageForm?.display && (
        <> &mdash; {initialOrderBasketItem?.drug?.dosageForm?.display.toLowerCase()}</>
      )}
    </>
  );

  const [dosingUnitOptions, setDosingUnitOptions] = useState(
    addIfNotPresent(
      template?.dosingInstructions?.units?.map((x) => ({
        id: x.valueCoded,
        text: x.value,
      })),
      initialOrderBasketItem.unit,
    ),
  );

  const [frequencyOptions, setFrequencyOptions] = useState(
    addIfNotPresent(
      template?.dosingInstructions?.frequency?.map((x) => ({
        id: x.valueCoded,
        text: x.value,
      })),
      initialOrderBasketItem.frequency,
    ),
  );
  const [routeOptions, setRouteOptions] = useState(
    addIfNotPresent(
      template?.dosingInstructions?.route?.map((x) => ({
        id: x.valueCoded,
        text: x.value,
      })),
      initialOrderBasketItem.route,
    ),
  );

  useEffect(() => {
    if (orderConfigObject) {
      // sync frequency options with what's defined in the order config
      const availableFrequencies = frequencyOptions.map((x) => x.id);
      const otherFrequencyOptions = [];
      orderConfigObject.orderFrequencies.forEach(
        (x) => availableFrequencies.includes(x.uuid) || otherFrequencyOptions.push({ id: x.uuid, text: x.display }),
      );
      setFrequencyOptions([...frequencyOptions, ...otherFrequencyOptions]);

      // sync dosage.unit options with what's defined in the order config
      const availableDosingUnits = dosingUnitOptions.map((x) => x.id);
      const otherDosingUnits = [];
      orderConfigObject.drugDosingUnits.forEach(
        (x) => availableDosingUnits.includes(x.uuid) || otherDosingUnits.push({ id: x.uuid, text: x.display }),
      );
      setDosingUnitOptions([...dosingUnitOptions, ...otherDosingUnits]);

      // sync route options with what's defined in the order config
      const availableRoutes = routeOptions.map((x) => x.id);
      const otherRouteOptions = [];
      orderConfigObject.drugRoutes.forEach(
        (x) => availableRoutes.includes(x.uuid) || otherRouteOptions.push({ id: x.uuid, text: x.display }),
      );
      setRouteOptions([...routeOptions, ...otherRouteOptions]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderConfigObject]);

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
    <>
      {showStickyMedicationHeader && (
        <div className={styles.stickyMedicationInfo}>
          <MedicationInfoHeader orderBasketItem={orderBasketItem} />
        </div>
      )}
      {isTablet && !isLoadingPatientDetails && (
        <div className={styles.patientHeader}>
          <span className={styles.bodyShort02}>{patientName}</span>
          <span className={`${styles.text02} ${styles.bodyShort01}`}>
            {capitalize(patient?.gender)} &middot; {age(patient?.birthDate)} &middot;{' '}
            <span>{formatDate(parseDate(patient?.birthDate), { mode: 'wide', time: false })}</span>
          </span>
        </div>
      )}
      <Form className={styles.orderForm} onSubmit={() => onSign(orderBasketItem)} id="drugOrderForm">
        {fetchingDurationUnitsError && (
          <InlineNotification
            hideCloseButton
            kind="error"
            lowContrast
            title={t('errorFetchingDurationUnits', 'Error occured when fetching duration units')}
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
          <MedicationInfoHeader orderBasketItem={orderBasketItem} />
        </div>
        <section className={styles.formSection}>
          <Grid className={styles.gridRow}>
            <Column lg={12} md={6} sm={4}>
              <h3 className={styles.sectionHeader}>{t('dosageInstructions', '1. Dosage Instructions')}</h3>
            </Column>
            <Column className={styles.pullColumnContentRight} lg={4} md={2} sm={4}>
              <Toggle
                size="sm"
                id="freeTextDosageToggle"
                aria-label={t('freeTextDosage', 'Free text dosage')}
                labelText={t('freeTextDosage', 'Free text dosage')}
                toggled={orderBasketItem.isFreeTextDosage}
                onChange={() => {} /* Required by the typings, but we don't need it. */}
                onToggle={(value) =>
                  setOrderBasketItem({
                    ...orderBasketItem,
                    isFreeTextDosage: value,
                  })
                }
              />
            </Column>
          </Grid>
          {orderBasketItem.isFreeTextDosage ? (
            <Grid className={styles.gridRow}>
              <Column md={8}>
                <TextArea
                  light={isTablet}
                  labelText={t('freeTextDosage', 'Free text dosage')}
                  placeholder={t('freeTextDosage', 'Free text dosage')}
                  value={orderBasketItem.freeTextDosage}
                  maxLength={65535}
                  onChange={(e) =>
                    setOrderBasketItem({
                      ...orderBasketItem,
                      freeTextDosage: e.target.value,
                    })
                  }
                />
              </Column>
            </Grid>
          ) : (
            <>
              <Grid className={styles.gridRow}>
                <Column lg={4} md={2} sm={4} className={styles.linkedInput}>
                  <InputWrapper>
                    <div className={styles.numberInput}>
                      <NumberInput
                        size={isTablet ? 'lg' : 'md'}
                        id="doseSelection"
                        light={isTablet}
                        placeholder={t('editDoseComboBoxPlaceholder', 'Dose')}
                        label={t('editDoseComboBoxTitle', 'Dose')}
                        value={orderBasketItem?.dosage ?? 0}
                        onChange={(e, { value }) => {
                          setOrderBasketItem({
                            ...orderBasketItem,
                            dosage: value ? parseFloat(value) : 0,
                          });
                        }}
                        min={0}
                        required
                        hideSteppers
                      />
                    </div>
                  </InputWrapper>
                </Column>
                <Column lg={4} md={2} sm={4}>
                  <InputWrapper>
                    <ComboBox
                      size={isTablet ? 'lg' : 'md'}
                      id="dosingUnits"
                      light={isTablet}
                      items={dosingUnitOptions}
                      placeholder={t('editDosageUnitsPlaceholder', 'Unit')}
                      titleText={t('editDosageUnitsTitle', 'Dose unit')}
                      itemToString={(item) => item?.text}
                      selectedItem={
                        dosingUnitOptions?.length
                          ? {
                              id: orderBasketItem.unit?.valueCoded,
                              text: orderBasketItem.unit?.value,
                            }
                          : null
                      }
                      onChange={({ selectedItem }) => {
                        setOrderBasketItem({
                          ...orderBasketItem,
                          unit: !!selectedItem?.id
                            ? { value: selectedItem.text, valueCoded: selectedItem.id }
                            : initialOrderBasketItem.route,
                        });
                      }}
                      required
                    />
                  </InputWrapper>
                </Column>
                <Column lg={8} md={4} sm={4}>
                  <InputWrapper>
                    <ComboBox
                      size={isTablet ? 'lg' : 'md'}
                      id="editRoute"
                      light={isTablet}
                      items={routeOptions}
                      selectedItem={{
                        id: orderBasketItem.route?.valueCoded,
                        text: orderBasketItem.route?.value,
                      }}
                      // @ts-ignore
                      placeholder={t('editRouteComboBoxTitle', 'Route')}
                      titleText={t('editRouteComboBoxTitle', 'Route')}
                      itemToString={(item) => item?.text}
                      onChange={({ selectedItem }) => {
                        setOrderBasketItem({
                          ...orderBasketItem,
                          route: !!selectedItem?.id
                            ? { value: selectedItem.text, valueCoded: selectedItem.id }
                            : initialOrderBasketItem.route,
                        });
                      }}
                      required
                    />
                  </InputWrapper>
                </Column>
              </Grid>
              <Grid className={styles.gridRow}>
                <Column lg={16} md={4} sm={4}>
                  <InputWrapper>
                    <ComboBox
                      size={isTablet ? 'lg' : 'md'}
                      id="editFrequency"
                      light={isTablet}
                      items={frequencyOptions}
                      selectedItem={{
                        id: orderBasketItem.frequency?.valueCoded,
                        text: orderBasketItem.frequency?.value,
                      }}
                      // @ts-ignore
                      placeholder={t('editFrequencyComboBoxTitle', 'Frequency')}
                      titleText={t('editFrequencyComboBoxTitle', 'Frequency')}
                      itemToString={(item) => item?.text}
                      onChange={({ selectedItem }) => {
                        setOrderBasketItem({
                          ...orderBasketItem,
                          frequency: !!selectedItem?.id
                            ? { value: selectedItem.text, valueCoded: selectedItem.id }
                            : initialOrderBasketItem.frequency,
                        });
                      }}
                      required
                    />
                  </InputWrapper>
                </Column>
              </Grid>

              <Grid className={styles.gridRow}>
                <Column lg={16} md={4} sm={4}>
                  <InputWrapper>
                    <TextArea
                      light={isTablet}
                      labelText={t('patientInstructions', 'Patient instructions')}
                      placeholder={t(
                        'patientInstructionsPlaceholder',
                        'Additional dosing instructions (e.g. "Take after eating")',
                      )}
                      maxLength={65535}
                      value={orderBasketItem.patientInstructions}
                      onChange={(e) =>
                        setOrderBasketItem({
                          ...orderBasketItem,
                          patientInstructions: e.target.value,
                        })
                      }
                      rows={isTablet ? 6 : 4}
                    />
                  </InputWrapper>
                </Column>
                <Column lg={16} md={4} sm={4}>
                  <Grid className={styles.gridRow}>
                    <Column lg={12} md={8} sm={4} className={styles.prnTextArea}>
                      <InputWrapper>
                        <TextArea
                          light={isTablet}
                          labelText={t('prnReason', 'P.R.N. reason')}
                          placeholder={t('prnReasonPlaceholder', 'Reason to take medicine')}
                          rows={3}
                          maxLength={255}
                          value={orderBasketItem.asNeededCondition}
                          onChange={(e) =>
                            setOrderBasketItem({
                              ...orderBasketItem,
                              asNeededCondition: e.target.value,
                            })
                          }
                        />
                      </InputWrapper>
                    </Column>

                    <Column lg={4} md={8} sm={4} className={styles.prnCheckbox}>
                      <InputWrapper>
                        <FormGroup legendText={t('prn', 'P.R.N.')}>
                          <Checkbox
                            id="prn"
                            labelText={t('takeAsNeeded', 'Take as needed')}
                            size="lg"
                            checked={orderBasketItem.asNeeded}
                            onChange={(e) =>
                              setOrderBasketItem({
                                ...orderBasketItem,
                                asNeeded: e.target.checked,
                              })
                            }
                          />
                        </FormGroup>
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
                  <DatePicker
                    light={isTablet}
                    datePickerType="single"
                    maxDate={new Date()}
                    value={[orderBasketItem.startDate]}
                    onChange={([newStartDate]) =>
                      setOrderBasketItem({
                        ...orderBasketItem,
                        startDate: newStartDate,
                      })
                    }
                  >
                    <DatePickerInput
                      id="startDatePicker"
                      placeholder="mm/dd/yyyy"
                      labelText={t('startDate', 'Start date')}
                      size="lg"
                    />
                  </DatePicker>
                </InputWrapper>
              </div>
            </Column>
            <Column lg={8} md={2} sm={4} className={styles.linkedInput}>
              <InputWrapper>
                {!isTablet ? (
                  <NumberInput
                    size="lg"
                    light={isTablet}
                    id="durationInput"
                    label={t('duration', 'Duration')}
                    min={1}
                    value={orderBasketItem.duration ?? ''}
                    step={1}
                    onChange={(e, { value }) => {
                      setOrderBasketItem({
                        ...orderBasketItem,
                        duration: value ? parseFloat(value) : 0,
                      });
                    }}
                    max={99}
                    allowEmpty
                  />
                ) : (
                  <CustomNumberInput
                    labelText={t('duration', 'Duration')}
                    value={orderBasketItem.duration}
                    setValue={(value) =>
                      setOrderBasketItem({
                        ...orderBasketItem,
                        duration: value,
                      })
                    }
                  />
                )}
              </InputWrapper>
            </Column>
            <Column lg={8} md={2} sm={4}>
              <InputWrapper>
                <ComboBox
                  size="lg"
                  light={isTablet}
                  id="durationUnitPlaceholder"
                  titleText={t('durationUnit', 'Duration unit')}
                  selectedItem={
                    orderBasketItem.durationUnit?.uuid
                      ? {
                          id: orderBasketItem.durationUnit.uuid,
                          text: orderBasketItem.durationUnit.display,
                        }
                      : null
                  }
                  items={
                    durationUnits?.map((unit) => ({
                      id: unit.uuid,
                      text: unit.display,
                    })) ?? []
                  }
                  itemToString={(item) => item?.text}
                  // @ts-ignore
                  placeholder={t('durationUnitPlaceholder', 'Duration Unit')}
                  helperText={isLoadingDurationUnits && t('fetchingDurationUnits', 'Fetching duration units...')}
                  onChange={({ selectedItem }) =>
                    !!selectedItem
                      ? setOrderBasketItem({
                          ...orderBasketItem,
                          durationUnit: {
                            uuid: selectedItem.id,
                            display: selectedItem.text,
                          },
                        })
                      : setOrderBasketItem({
                          ...orderBasketItem,
                          durationUnit: config.daysDurationUnit,
                        })
                  }
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
                <NumberInput
                  size="lg"
                  light={isTablet}
                  id="quantityDispensed"
                  value={orderBasketItem.pillsDispensed}
                  label={t('quantityToDispense', 'Quantity to dispense')}
                  min={0}
                  onChange={(e, { value }) => {
                    setOrderBasketItem({
                      ...orderBasketItem,
                      pillsDispensed: value ? parseFloat(value) : 0,
                    });
                  }}
                  hideSteppers
                />
              </InputWrapper>
            </Column>
            <Column lg={8} md={3} sm={4}>
              <InputWrapper>
                {!isTablet ? (
                  <NumberInput
                    size="lg"
                    light={isTablet}
                    id="prescriptionRefills"
                    min={0}
                    label={t('prescriptionRefills', 'Prescription refills')}
                    value={orderBasketItem.numRefills}
                    onChange={(e, { value }) => {
                      setOrderBasketItem({
                        ...orderBasketItem,
                        numRefills: value ? parseFloat(value) : 0,
                      });
                    }}
                    max={99}
                  />
                ) : (
                  <CustomNumberInput
                    labelText={t('prescriptionRefills', 'Prescription refills')}
                    value={orderBasketItem.numRefills}
                    setValue={(val) =>
                      setOrderBasketItem({
                        ...orderBasketItem,
                        numRefills: val,
                      })
                    }
                  />
                )}
              </InputWrapper>
            </Column>
          </Grid>
          <Grid className={styles.gridRow}>
            <Column lg={16} md={6} sm={4}>
              <InputWrapper>
                <TextInput
                  size="lg"
                  id="indication"
                  labelText={t('indication', 'Indication')}
                  placeholder={t('indicationPlaceholder', 'e.g. "Hypertension"')}
                  value={orderBasketItem.indication}
                  onChange={(e) =>
                    setOrderBasketItem({
                      ...orderBasketItem,
                      indication: e.target.value,
                    })
                  }
                  required
                  maxLength={150}
                />
              </InputWrapper>
            </Column>
          </Grid>
        </section>

        <ButtonSet className={`${styles.buttonSet} ${isTablet ? styles.tabletButtonSet : styles.desktopButtonSet}`}>
          <Button className={styles.button} kind="secondary" onClick={onCancel} size="xl">
            {t('discard', 'Discard')}
          </Button>
          <Button className={styles.button} kind="primary" type="submit" size="xl">
            {t('saveOrder', 'Save order')}
          </Button>
        </ButtonSet>
      </Form>
    </>
  );
}

interface CustomNumberInputProps {
  setValue: (value: number) => void;
  value: number;
  labelText: string;
  inputProps?: Object;
}

const CustomNumberInput: React.FC<CustomNumberInputProps> = ({ setValue, value, labelText, inputProps = {} }) => {
  const handleChange = (e) => {
    const val = e.target.value.replace(/[^\d]/g, '').slice(0, 2);
    setValue(val ? parseInt(val) : 0);
  };

  const increment = () => {
    setValue(Math.min(value + 1, 99));
  };

  const decrement = () => {
    setValue(Math.max(value - 1, 0));
  };

  return (
    <div className={styles.customElement}>
      <span className="cds--label">{labelText}</span>
      <div className={styles.customNumberInput}>
        <Button hasIconOnly renderIcon={Subtract} onClick={decrement} />
        <TextInput
          onChange={handleChange}
          value={value ? value : '--'}
          {...inputProps}
          size="lg"
          className={styles.customInput}
        />
        <Button hasIconOnly renderIcon={Add} onClick={increment} />
      </div>{' '}
    </div>
  );
};
