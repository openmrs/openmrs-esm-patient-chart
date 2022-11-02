import React, { SyntheticEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  ButtonSet,
  ComboBox,
  DatePicker,
  DatePickerInput,
  Form,
  Select,
  SelectItem,
  TextInput,
  Stack,
} from '@carbon/react';
import { showNotification, showToast, useSession, useVisit, useLayoutType } from '@openmrs/esm-framework';
import { DefaultWorkspaceProps } from '@openmrs/esm-patient-common-lib';
import { savePatientImmunization, useImmunizationsConceptSet } from './immunizations.resource';
import { mapToFHIRImmunizationResource } from './immunization-mapper';
import { ImmunizationFormData, ImmunizationSequence } from './immunization-domain';
import { immunizationFormSub } from './immunization-utils';
import styles from './immunizations-form.scss';

function hasSequences<T>(sequences: Array<T>) {
  return sequences && sequences?.length > 0;
}

interface ImmunizationFormState {
  vaccineName: string;
  vaccineUuid: string;
  immunizationObsUuid: string;
  vaccinationDate: string;
  currentDose: ImmunizationSequence;
  sequences: Array<ImmunizationSequence>;
  expirationDate: string;
  lotNumber: string;
  manufacturer: string;
  formChanged: boolean;
}

const ImmunizationsForm: React.FC<DefaultWorkspaceProps> = ({ patientUuid, closeWorkspace }) => {
  const initialState: ImmunizationFormState = {
    vaccineName: '',
    vaccineUuid: '',
    immunizationObsUuid: '',
    vaccinationDate: null,
    sequences: [],
    currentDose: {} as ImmunizationSequence,
    expirationDate: null,
    lotNumber: '',
    manufacturer: '',
    formChanged: false,
  };
  const [formState, setFormState] = useState(initialState);
  const updateSingle = <T extends keyof ImmunizationFormState>(name: T, value: typeof formState[T]) =>
    setFormState((state) => ({ ...state, [name]: value }));
  const onChangeComboBox = (event) => {
    if (event.selectedItem) {
      updateSingle('vaccineUuid', event.selectedItem.uuid);
    }
  };

  const { t } = useTranslation();
  const currentUser = useSession();
  const { currentVisit } = useVisit(patientUuid);
  const isTablet = useLayoutType() === 'tablet';
  const { data, isLoading } = useImmunizationsConceptSet('custom:(display,answers:(uuid,display))');
  const vaccines = data?.answers;
  const [vaccineState, setVaccineState] = useState(vaccines || []);
  useEffect(() => {
    if (!isLoading && vaccines?.length) {
      setVaccineState(vaccines);
    }
  }, [vaccines, isLoading]);

  const isViewEditMode = !!formState.immunizationObsUuid;
  const enableCreateButtons = !isViewEditMode && !!formState.vaccinationDate;
  const enableEditButtons = isViewEditMode && formState.formChanged;
  const disableSaveButton =
    !formState.vaccineUuid ||
    !formState.vaccinationDate ||
    !formState.expirationDate ||
    !formState.lotNumber ||
    !formState.manufacturer;

  useEffect(() => {
    const sub = immunizationFormSub.subscribe((props) => props && setFormState(props));
    return () => sub.unsubscribe();
  }, []);

  const handleFormSubmit = React.useCallback(
    (event: SyntheticEvent<HTMLFormElement>) => {
      event.preventDefault();
      const currentVisitUuid = currentVisit?.uuid;
      const currentLocationUuid = currentUser?.sessionLocation?.uuid;
      const currentProviderUuid = currentUser?.currentProvider?.uuid;

      const immunization: ImmunizationFormData = {
        patientUuid,
        ...formState,
      };

      const abortController = new AbortController();

      savePatientImmunization(
        mapToFHIRImmunizationResource(immunization, currentVisitUuid, currentLocationUuid, currentProviderUuid),
        patientUuid,
        formState.immunizationObsUuid,
        abortController,
      ).then(
        (response) => {
          response.status === 201 && closeWorkspace();
          showToast({
            kind: 'success',
            description: t('vaccinationSaved', 'Vaccination saved successfully'),
          });
        },
        (err) => {
          showNotification({
            title: t('errorSaving', 'Error saving vaccination'),
            kind: 'error',
            critical: true,
            description: err?.message,
          });
        },
      );
      return () => abortController.abort();
    },
    [
      currentUser?.sessionLocation?.uuid,
      closeWorkspace,
      formState,
      patientUuid,
      currentUser?.currentProvider?.uuid,
      currentVisit?.uuid,
      t,
    ],
  );
  function isNumber(value) {
    return !isNaN(value);
  }

  const onDoseSelect = (event) => {
    const defaultDose = {} as ImmunizationSequence;
    const currentDose: ImmunizationSequence =
      formState.sequences.find(
        (s) => isNumber(event.target.value) && s.sequenceNumber === parseInt(event.target.value),
      ) || defaultDose;
    updateSingle('currentDose', currentDose);
  };

  if (isLoading || vaccineState === undefined)
    return <span className={styles.vaccineLoader}>{`${t('loadingVaccine', 'Loading Vaccine')} ...`} </span>;

  return (
    <Form className={styles.form} onSubmit={handleFormSubmit}>
      <Stack gap={4}>
        {vaccines?.length ? (
          <section className={styles.immunizationSequenceSelect}>
            <ComboBox
              titleText="Vaccines"
              items={vaccineState}
              itemToString={(item) => item?.display ?? ''}
              onChange={(event) => {
                onChangeComboBox(event);
              }}
            />{' '}
          </section>
        ) : null}

        {hasSequences(formState.sequences) && (
          <section className={styles.immunizationSequenceSelect}>
            <Select
              id="sequence"
              name="sequence"
              value={formState.currentDose.sequenceNumber}
              onChange={onDoseSelect}
              className="immunizationSequenceSelect"
              labelText={t('sequence', 'Sequence')}
            >
              <SelectItem text={t('pleaseSelect', 'Please select')} value="DEFAULT">
                {t('pleaseSelect', 'Please select')}
              </SelectItem>
              {formState.sequences.map((s) => {
                return (
                  <SelectItem key={s.sequenceNumber} text={s.sequenceLabel} value={s.sequenceNumber}>
                    {t(s.sequenceLabel, s.sequenceLabel)}
                  </SelectItem>
                );
              })}
            </Select>
          </section>
        )}
        <section className={styles.immunizationSequenceSelect}>
          <DatePicker
            id="vaccinationDate"
            className="vaccinationDate"
            maxDate={new Date().toISOString()}
            dateFormat="d/m/Y"
            datePickerType="single"
            value={formState.vaccinationDate}
            onChange={([date]) => updateSingle('vaccinationDate', date.toISOString())}
          >
            <DatePickerInput
              id="date-picker-calendar-id"
              placeholder="dd/mm/yyyy"
              labelText={t('vaccinationDate', 'Vaccination Date')}
              type="text"
            />
          </DatePicker>
        </section>
        <section className={styles.immunizationSequenceSelect}>
          <DatePicker
            id="vaccinationExpiration"
            className="vaccinationExpiration"
            minDate={new Date().toISOString()}
            dateFormat="d/m/Y"
            datePickerType="single"
            value={formState.expirationDate}
            onChange={([date]) => updateSingle('expirationDate', date.toISOString())}
          >
            <DatePickerInput
              id="date-picker-calendar-id"
              placeholder="dd/mm/yyyy"
              labelText={t('expirationDate', 'Expiration Date')}
              type="text"
            />
          </DatePicker>
        </section>
        <section className={styles.immunizationSequenceSelect}>
          <TextInput
            type="text"
            id="lotNumber"
            labelText={t('lotNumber', 'Lot Number')}
            value={formState.lotNumber}
            onChange={(evt) => updateSingle('lotNumber', evt.target.value)}
          />
        </section>
        <section className={styles.immunizationSequenceSelect}>
          <TextInput
            type="text"
            id="manufacturer"
            labelText={t('manufacturer', 'Manufacturer')}
            value={formState.manufacturer}
            onChange={(evt) => updateSingle('manufacturer', evt.target.value)}
          />
        </section>
      </Stack>
      <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
        <Button className={styles.button} kind="secondary" onClick={() => closeWorkspace()}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button className={styles.button} kind="primary" disabled={disableSaveButton} type="submit">
          {t('saveAndClose', 'Save and close')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default ImmunizationsForm;
