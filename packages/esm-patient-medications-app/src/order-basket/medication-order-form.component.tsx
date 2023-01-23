import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import capitalize from 'lodash-es/capitalize';
import { ConfigObject } from '../config-schema';
import {
  DosingUnit,
  DurationUnit,
  MedicationFrequency,
  MedicationRoute,
  QuantityUnit,
} from '../api/drug-order-template';

export interface MedicationOrderFormProps {
  initialOrderBasketItem: OrderBasketItem;
  onSign: (finalizedOrder: OrderBasketItem) => void;
  onCancel: () => void;
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
  const { isLoading: isLoadingOrderConfig, orderConfigObject, error: errorFetchingOrderConfig } = useOrderConfig();
  const config = useConfig() as ConfigObject;

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
          <MedicationInfoHeader orderBasketItem={orderBasketItem} />
        </div>
        <section className={styles.formSection}>
          <Grid className={styles.gridRow}>
            <Column lg={12} md={6} sm={4}>
              <h3 className={styles.sectionHeader}>{t('dosageInstructions', '1. Dosage instructions')}</h3>
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
                      items={drugDosingUnits}
                      placeholder={t('editDosageUnitsPlaceholder', 'Unit')}
                      titleText={t('editDosageUnitsTitle', 'Dose unit')}
                      itemToString={(item) => item?.value}
                      selectedItem={orderBasketItem?.unit}
                      onChange={({ selectedItem }) => {
                        setOrderBasketItem({
                          ...orderBasketItem,
                          unit: selectedItem,
                          // Since the default selection for the quantity units
                          // should be same as dosing units
                          quantityUnits: orderBasketItem.quantityUnits ?? selectedItem,
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
                      items={drugRoutes}
                      selectedItem={orderBasketItem?.route}
                      placeholder={t('editRouteComboBoxTitle', 'Route')}
                      titleText={t('editRouteComboBoxTitle', 'Route')}
                      itemToString={(item) => item?.value}
                      onChange={({ selectedItem }) => {
                        setOrderBasketItem({
                          ...orderBasketItem,
                          route: selectedItem,
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
                      items={orderFrequencies}
                      selectedItem={orderBasketItem?.frequency}
                      placeholder={t('editFrequencyComboBoxTitle', 'Frequency')}
                      titleText={t('editFrequencyComboBoxTitle', 'Frequency')}
                      itemToString={(item) => item?.value}
                      onChange={({ selectedItem }) => {
                        setOrderBasketItem({
                          ...orderBasketItem,
                          frequency: selectedItem,
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
                  id="durationUnitPlaceholder"
                  titleText={t('durationUnit', 'Duration unit')}
                  selectedItem={orderBasketItem?.durationUnit}
                  items={durationUnits}
                  itemToString={(item) => item?.value}
                  placeholder={t('durationUnitPlaceholder', 'Duration Unit')}
                  onChange={({ selectedItem }) =>
                    setOrderBasketItem({
                      ...orderBasketItem,
                      durationUnit: selectedItem,
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
                <ComboBox
                  size="lg"
                  id="dispensingUnits"
                  items={drugDispensingUnits}
                  placeholder={t('editDispensingUnit', 'Quantity unit')}
                  titleText={t('editDispensingUnit', 'Quantity unit')}
                  itemToString={(item) => item?.value}
                  selectedItem={orderBasketItem?.quantityUnits}
                  onChange={({ selectedItem }) => {
                    setOrderBasketItem({
                      ...orderBasketItem,
                      quantityUnits: selectedItem,
                    });
                  }}
                  required
                />
              </InputWrapper>
            </Column>
            <Column lg={8} md={3} sm={4}>
              <InputWrapper>
                {!isTablet ? (
                  <NumberInput
                    size="lg"
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
  const { t } = useTranslation();
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
        <Button hasIconOnly renderIcon={Subtract} onClick={decrement} iconDescription={t('decrement', 'Decrement')} />
        <TextInput
          onChange={handleChange}
          value={value ? value : '--'}
          {...inputProps}
          size="lg"
          className={styles.customInput}
        />
        <Button hasIconOnly renderIcon={Add} onClick={increment} iconDescription={t('increment', 'Increment')} />
      </div>{' '}
    </div>
  );
};
