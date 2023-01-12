import React, { useEffect, useState } from 'react';
import capitalize from 'lodash-es/capitalize';
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
  FlexGrid,
  Row,
} from '@carbon/react';
import { ArrowLeft } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { isDesktop, OpenmrsResource, useConfig, useLayoutType } from '@openmrs/esm-framework';
import { OrderBasketItem } from '../types/order-basket-item';
import { useOrderConfig } from '../api/order-config';
import styles from './medication-order-form.scss';
import { useDurationUnits } from '../api/api';
import { InputWrapper } from './order-form-helper.component';

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

  return (
    <>
      <Form className={styles.orderForm} onSubmit={() => onSign(orderBasketItem)}>
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
        <div className={styles.medicationInfo}>
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

        <div className={styles.flexGrid}>
          <Column md={4}>
            <h3 className={styles.productiveHeading01}>{t('dosageInstructions', '1. Dosage Instructions')}</h3>
          </Column>
          <Column className={styles.pullColumnContentRight} md={4}>
            <Toggle
              size="sm"
              id="freeTextDosageToggle"
              aria-label={t('freeTextDosage', 'Free Text Dosage')}
              labelText={t('freeTextDosage', 'Free Text Dosage')}
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
        </div>
        <div className={styles.row}>
          <Column md={8}></Column>
        </div>
        {orderBasketItem.isFreeTextDosage ? (
          <div className={styles.row}>
            <Column md={8}>
              <TextArea
                light={isTablet}
                labelText={t('freeTextDosage', 'Free Text Dosage')}
                placeholder={t('freeTextDosage', 'Free Text Dosage')}
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
          </div>
        ) : (
          <>
            <Grid className={styles.gridRow}>
              <Column md={4}>
                <InputWrapper>
                  <div className={styles.numberInput}>
                    <NumberInput
                      id="doseSelection"
                      light={isTablet}
                      placeholder={t('editDoseComboBoxPlaceholder', 'Dose')}
                      label={t('editDoseComboBoxTitle', 'Enter Dose')}
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
              <Column md={4}>
                <InputWrapper>
                  <ComboBox
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
              <Column md={8}>
                <InputWrapper>
                  <ComboBox
                    id="editRoute"
                    light={isTablet}
                    items={routeOptions}
                    selectedItem={{
                      id: orderBasketItem.route?.valueCoded,
                      text: orderBasketItem.route?.value,
                    }}
                    // @ts-ignore
                    placeholder={t('editRouteComboBoxPlaceholder', 'Route')}
                    titleText={t('editRouteComboBoxTitle', 'Enter Route')}
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
            <InputWrapper>
              <ComboBox
                id="editFrequency"
                light={isTablet}
                items={frequencyOptions}
                selectedItem={{
                  id: orderBasketItem.frequency?.valueCoded,
                  text: orderBasketItem.frequency?.value,
                }}
                // @ts-ignore
                placeholder={t('editFrequencyComboBoxPlaceholder', 'Frequency')}
                titleText={t('editFrequencyComboBoxTitle', 'Enter Frequency')}
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
            <InputWrapper>
              <TextArea
                light={isTablet}
                labelText={t('patientInstructions', 'Patient Instructions')}
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
              />
            </InputWrapper>
            <Grid className={styles.gridRow}>
              <Column lg={12}>
                <InputWrapper>
                  <TextArea
                    light={isTablet}
                    labelText={t('prnReason', 'P.R.N. Reason')}
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
              <Column md={4} className={styles.lastGridCell}>
                <InputWrapper>
                  <FormGroup legendText={t('prn', 'P.R.N.')}>
                    <Checkbox
                      id="prn"
                      labelText={t('takeAsNeeded', 'Take As Needed')}
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
          </>
        )}

        <h3 className={styles.productiveHeading01}>{t('prescriptionDuration', '2. Prescription Duration')}</h3>
        <Grid className={styles.gridRow}>
          <Column lg={16}>
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
                />
              </DatePicker>
            </InputWrapper>
          </Column>
        </Grid>
        <Grid className={styles.gridRow}>
          <Column md={8}>
            <InputWrapper>
              <NumberInput
                light={isTablet}
                id="durationInput"
                label={t('duration', 'Duration')}
                min={1}
                value={orderBasketItem.duration ?? ''}
                helperText={t('noDurationHint', 'An empty field indicates an indefinite duration.')}
                step={1}
                onChange={(e, { value }) => {
                  setOrderBasketItem({
                    ...orderBasketItem,
                    duration: value ? parseFloat(value) : 0,
                  });
                }}
                hideSteppers
                allowEmpty
              />
            </InputWrapper>
          </Column>
          <Column md={8}>
            <InputWrapper>
              <ComboBox
                light={isTablet}
                id="durationUnitPlaceholder"
                titleText={t('durationUnit', 'Duration Unit')}
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
        <h3 className={styles.productiveHeading01}>{t('dispensingInformation', '3. Dispensing Information')}</h3>
        <Grid className={styles.gridRow}>
          <Column md={8}>
            <InputWrapper>
              <NumberInput
                light={isTablet}
                id="quantityDispensed"
                helperText={t('pillsToDispense', 'Pills to dispense')}
                value={orderBasketItem.pillsDispensed}
                label={t('quantity', 'Quantity')}
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
          <Column md={8} className={styles.lastGridCell}>
            <InputWrapper>
              <NumberInput
                light={isTablet}
                id="prescriptionRefills"
                min={0}
                label={t('prescriptionRefills', 'Prescription Refills')}
                value={orderBasketItem.numRefills}
                onChange={(e, { value }) => {
                  setOrderBasketItem({
                    ...orderBasketItem,
                    numRefills: value ? parseFloat(value) : 0,
                  });
                }}
                hideSteppers
              />
            </InputWrapper>
          </Column>
        </Grid>
        <Grid className={styles.gridRow}>
          <Column lg={16}>
            <InputWrapper>
              <TextInput
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

        <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
          <Button className={styles.button} kind="secondary" onClick={onCancel}>
            {t('discard', 'Discard')}
          </Button>
          <Button className={styles.button} kind="primary" type="submit">
            {t('saveOrder', 'Save order')}
          </Button>
        </ButtonSet>
      </Form>
    </>
  );
}
