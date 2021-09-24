import React, { useState } from 'react';
import styles from './medication-order-form.scss';
import capitalize from 'lodash-es/capitalize';
import {
  Button,
  ButtonSet,
  Checkbox,
  DatePicker,
  DatePickerInput,
  NumberInput,
  TextInput,
  TextArea,
  ComboBox,
  ToggleSmall,
  Form,
  FormGroup,
  Grid,
  Row,
  Column,
  Header,
  HeaderName,
} from 'carbon-components-react';
import { useTranslation } from 'react-i18next';
import { OrderBasketItem } from '../types/order-basket-item';
import { daysDurationUnit } from '../constants';
import { getCommonMedicationByUuid } from '../api/common-medication';
import { OpenmrsResource } from '../types/openmrs-resource';

export interface MedicationOrderFormProps {
  initialOrderBasketItem: OrderBasketItem;
  durationUnits: Array<OpenmrsResource>;
  onSign: (finalizedOrder: OrderBasketItem) => void;
  onCancel: () => void;
  isTablet: boolean;
}

export default function MedicationOrderForm({
  initialOrderBasketItem,
  durationUnits,
  onSign,
  onCancel,
  isTablet,
}: MedicationOrderFormProps) {
  const { t } = useTranslation();
  const [orderBasketItem, setOrderBasketItem] = useState(initialOrderBasketItem);
  const commonMedication = getCommonMedicationByUuid(orderBasketItem.drug.uuid);

  return (
    <>
      <Header aria-label="" className={styles.medicationDetailsHeader}>
        <HeaderName prefix="">
          {orderBasketItem.isFreeTextDosage ? (
            <strong>{capitalize(orderBasketItem.commonMedicationName)}</strong>
          ) : (
            <>
              <span>
                <strong>{capitalize(orderBasketItem.commonMedicationName)}</strong> &mdash; {orderBasketItem.route.name}{' '}
                &mdash; {orderBasketItem.dosageUnit.name} &mdash;{' '}
                <span className={styles.label01}>{t('dose', 'Dose').toUpperCase()}</span> &mdash;{' '}
                <strong>{orderBasketItem.dosage.dosage}</strong>
              </span>
            </>
          )}
        </HeaderName>
      </Header>
      <Form className={styles.orderForm} onSubmit={() => onSign(orderBasketItem)}>
        <h2 className={styles.productiveHeading03}>{t('orderForm', 'Order Form')}</h2>
        <Grid style={{ padding: 0 }}>
          <Row>
            <Column>
              <h3 className={styles.productiveHeading02}>{t('dosageInstructions', '1. Dosage Instructions')}</h3>
            </Column>
            <Column className={styles.pullColumnContentRight}>
              <ToggleSmall
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
          </Row>

          {orderBasketItem.isFreeTextDosage ? (
            <Row style={{ marginTop: '0.5rem' }}>
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
            </Row>
          ) : (
            <>
              <Row style={{ marginTop: '1rem' }}>
                <Column md={4}>
                  <ComboBox
                    id="doseSelection"
                    light={isTablet}
                    items={commonMedication.commonDosages.map((x) => ({
                      id: x.dosage,
                      text: x.dosage,
                    }))}
                    selectedItem={{
                      id: orderBasketItem.dosage.dosage,
                      text: orderBasketItem.dosage.dosage,
                    }}
                    placeholder={t('editDoseComboBoxPlaceholder', 'Dose')}
                    titleText={t('editDoseComboBoxTitle', 'Enter Dose')}
                    itemToString={(item) => item?.text}
                    invalid={!orderBasketItem.dosage && !orderBasketItem.isFreeTextDosage}
                    invalidText={t('validationNoItemSelected', 'Please select one of the available items.')}
                    onChange={({ selectedItem }) => {
                      setOrderBasketItem({
                        ...orderBasketItem,
                        dosage: !!selectedItem?.id
                          ? commonMedication.commonDosages.find((x) => x.dosage === selectedItem.id)
                          : initialOrderBasketItem.dosage,
                      });
                    }}
                  />
                </Column>
                <Column md={4}>
                  <ComboBox
                    id="editFrequency"
                    light={isTablet}
                    items={commonMedication.commonFrequencies.map((x) => ({
                      id: x.conceptUuid,
                      text: x.name,
                    }))}
                    selectedItem={{
                      id: orderBasketItem.frequency.conceptUuid,
                      text: orderBasketItem.frequency.name,
                    }}
                    placeholder={t('editFrequencyComboBoxPlaceholder', 'Frequency')}
                    titleText={t('editFrequencyComboBoxTitle', 'Enter Frequency')}
                    itemToString={(item) => item?.text}
                    invalid={!orderBasketItem.frequency && !orderBasketItem.isFreeTextDosage}
                    invalidText={t('validationNoItemSelected', 'Please select one of the available items.')}
                    onChange={({ selectedItem }) => {
                      setOrderBasketItem({
                        ...orderBasketItem,
                        frequency: !!selectedItem?.id
                          ? commonMedication.commonFrequencies.find((x) => x.conceptUuid === selectedItem.id)
                          : initialOrderBasketItem.frequency,
                      });
                    }}
                  />
                </Column>
              </Row>
              <Row style={{ marginTop: '1rem' }}>
                <Column md={4}>
                  <ComboBox
                    id="editRoute"
                    light={isTablet}
                    items={commonMedication.route.map((x) => ({
                      id: x.conceptUuid,
                      text: x.name,
                    }))}
                    selectedItem={{
                      id: orderBasketItem.route.conceptUuid,
                      text: orderBasketItem.route.name,
                    }}
                    placeholder={t('editRouteComboBoxPlaceholder', 'Route')}
                    titleText={t('editRouteComboBoxTitle', 'Enter Route')}
                    itemToString={(item) => item?.text}
                    invalid={!orderBasketItem.route && !orderBasketItem.isFreeTextDosage}
                    invalidText={t('validationNoItemSelected', 'Please select one of the available items.')}
                    onChange={({ selectedItem }) => {
                      setOrderBasketItem({
                        ...orderBasketItem,
                        route: !!selectedItem?.id
                          ? commonMedication.route.find((x) => x.conceptUuid === selectedItem.id)
                          : initialOrderBasketItem.route,
                      });
                    }}
                  />
                </Column>
              </Row>
              <Row style={{ marginTop: '1rem' }}>
                <Column className={styles.fullHeightTextAreaContainer}>
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
                </Column>
                <Column>
                  <FormGroup legendText={t('prn', 'P.R.N.')}>
                    <Checkbox
                      id="prn"
                      labelText={t('takeAsNeeded', 'Take As Needed')}
                      checked={orderBasketItem.asNeeded}
                      onChange={(newValue) =>
                        setOrderBasketItem({
                          ...orderBasketItem,
                          asNeeded: newValue,
                        })
                      }
                    />
                  </FormGroup>
                  <div
                    className={styles.fullHeightTextAreaContainer}
                    style={orderBasketItem.asNeeded ? {} : { visibility: 'hidden' }}>
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
                  </div>
                </Column>
              </Row>
            </>
          )}
          <Row style={{ marginTop: '2rem' }}>
            <Column md={8}>
              <h3 className={styles.productiveHeading02}>{t('prescriptionDuration', '2. Prescription Duration')}</h3>
            </Column>
          </Row>
          <Row style={{ marginTop: '1rem' }}>
            <Column md={4} className={styles.fullWidthDatePickerContainer}>
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
                }>
                <DatePickerInput
                  id="startDatePicker"
                  placeholder="mm/dd/yyyy"
                  labelText={t('startDate', 'Start date')}
                />
              </DatePicker>
            </Column>
            <Column md={2}>
              <NumberInput
                light={isTablet}
                id="durationInput"
                label={t('duration', 'Duration')}
                min={1}
                // @ts-ignore Strings are accepted, even though the types don't reflect it.
                value={orderBasketItem.duration ?? ''}
                allowEmpty={true}
                helperText={t('noDurationHint', 'An empty field indicates an indefinite duration.')}
                onChange={(e) => {
                  // @ts-ignore
                  const newValue = e.imaginaryTarget.value === '' ? null : +e.imaginaryTarget.value;
                  setOrderBasketItem({
                    ...orderBasketItem,
                    duration: newValue,
                  });
                }}
              />
            </Column>
            <Column md={2}>
              <FormGroup legendText={t('durationUnit', 'Duration Unit')}>
                <ComboBox
                  light={isTablet}
                  id="durationUnitPlaceholder"
                  selectedItem={{
                    id: orderBasketItem.durationUnit.uuid,
                    text: orderBasketItem.durationUnit.display,
                  }}
                  items={durationUnits.map((unit) => ({
                    id: unit.uuid,
                    text: unit.display,
                  }))}
                  itemToString={(item) => item?.text}
                  placeholder={t('durationUnitPlaceholder', 'Duration Unit')}
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
                          durationUnit: daysDurationUnit,
                        })
                  }
                />
              </FormGroup>
            </Column>
          </Row>
          <Row>
            <Column md={8}>
              <h3 className={styles.productiveHeading02}>{t('dispensingInformation', '3. Dispensing Information')}</h3>
            </Column>
          </Row>
          <Row style={{ marginTop: '1rem' }}>
            <Column md={2}>
              <FormGroup legendText={t('quantity', 'Quantity')}>
                <NumberInput
                  light={isTablet}
                  id="quantityDispensed"
                  helperText={t('pillsToDispense', 'Pills to dispense')}
                  value={orderBasketItem.pillsDispensed}
                  min={0}
                  onChange={(e) => {
                    setOrderBasketItem({
                      ...orderBasketItem,
                      // @ts-ignore
                      pillsDispensed: +e.imaginaryTarget.value,
                    });
                  }}
                />
              </FormGroup>
            </Column>
            <Column md={2}>
              <FormGroup legendText={t('prescriptionRefills', 'Prescription Refills')}>
                <NumberInput
                  light={isTablet}
                  id="prescriptionRefills"
                  min={0}
                  value={orderBasketItem.numRefills}
                  onChange={(e) =>
                    setOrderBasketItem({
                      ...orderBasketItem,
                      // @ts-ignore
                      numRefills: +e.imaginaryTarget.value,
                    })
                  }
                />
              </FormGroup>
            </Column>
          </Row>
          <Row>
            <Column md={8}>
              <TextInput
                light={isTablet}
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
            </Column>
          </Row>
        </Grid>

        <ButtonSet style={{ marginTop: '2rem' }}>
          <Button kind="secondary" onClick={onCancel}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button kind="primary" type="submit">
            {t('save', 'Save')}
          </Button>
        </ButtonSet>
      </Form>
    </>
  );
}
