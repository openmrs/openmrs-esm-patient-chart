import React, { SyntheticEvent, useEffect, useState } from 'react';
import styles from './immunizations-form.css';
<<<<<<< HEAD
import { SummaryCard } from '@openmrs/esm-patient-common-lib';
import { createErrorHandler, showNotification, showToast, useSessionUser, useVisit } from '@openmrs/esm-framework';
=======
import { createErrorHandler, detach, useSessionUser, useVisit } from '@openmrs/esm-framework';
>>>>>>> f60fa48 (carbonize immunizations form)
import { useTranslation } from 'react-i18next';
import { savePatientImmunization } from './immunizations.resource';
import { mapToFHIRImmunizationResource } from './immunization-mapper';
import { ImmunizationFormData, ImmunizationSequence } from './immunization-domain';
import Button from 'carbon-components-react/es/components/Button';
import DatePicker from 'carbon-components-react/es/components/DatePicker';
import DatePickerInput from 'carbon-components-react/es/components/DatePickerInput';
import Form from 'carbon-components-react/es/components/Form';
import Select from 'carbon-components-react/es/components/Select';
import SelectItem from 'carbon-components-react/es/components/SelectItem';
import TextInput from 'carbon-components-react/es/components/TextInput';
import { immunizationFormSub } from './immunization-utils';

function hasSequences<T>(sequences: Array<T>) {
  return sequences && sequences?.length > 0;
}

type ImmunizationsFormProps = {
  patientUuid: string;
};

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

const ImmunizationsForm: React.FC<ImmunizationsFormProps> = ({ patientUuid }) => {
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

  const { t } = useTranslation();
  const currentUser = useSessionUser();
  const { currentVisit } = useVisit(patientUuid);

  const isViewEditMode = !!formState.immunizationObsUuid;
  const enableCreateButtons = !isViewEditMode && !!formState.vaccinationDate;
  const enableEditButtons = isViewEditMode && formState.formChanged;
  const closeWorkspace = React.useCallback(
    () => detach('patient-chart-workspace-slot', 'immunization-workspace-form'),
    [],
  );

  useEffect(() => {
    const sub = immunizationFormSub.subscribe((props) => setFormState(props));
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
        immunizationObsUuid: formState.immunizationObsUuid,
        vaccineName: formState.vaccineName,
        vaccineUuid: formState.vaccineUuid,
        manufacturer: formState.manufacturer,
        expirationDate: formState.expirationDate,
        vaccinationDate: formState.vaccinationDate,
        lotNumber: formState.lotNumber,
        currentDose: formState.currentDose,
      };

      const abortController = new AbortController();

      savePatientImmunization(
        mapToFHIRImmunizationResource(immunization, currentVisitUuid, currentLocationUuid, currentProviderUuid),
        patientUuid,
        formState.immunizationObsUuid,
        abortController,
      ).then((response) => {
        response.status === 201 && closeWorkspace();
      }, createErrorHandler());
      return () => abortController.abort();
    },
    [
      closeWorkspace,
      currentUser?.currentProvider?.uuid,
      currentUser?.sessionLocation?.uuid,
      currentVisit?.uuid,
      formState.currentDose,
      formState.expirationDate,
      formState.immunizationObsUuid,
<<<<<<< HEAD
      abortController,
    ).then(
      (response) => {
        response.status === 201 && navigate();
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
  };

  function navigate() {
    history.push(`/patient/${patientUuid}/chart/immunizations`);
    closeComponent();
  }
=======
      formState.lotNumber,
      formState.manufacturer,
      formState.vaccinationDate,
      formState.vaccineName,
      formState.vaccineUuid,
      patientUuid,
    ],
  );
>>>>>>> f60fa48 (carbonize immunizations form)

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

  function createForm() {
    return (
      <Form onSubmit={handleFormSubmit} data-testid="immunization-form">
        {hasSequences(formState.sequences) && (
          <div className={styles.immunizationSequenceSelect}>
            <Select
              id="sequence"
              name="sequence"
              value={formState.currentDose.sequenceNumber}
              onChange={onDoseSelect}
              className="immunizationSequenceSelect"
              required
              labelText={t('sequence', 'Sequence')}>
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
          </div>
        )}
        <div className={styles.immunizationSequenceSelect}>
          <DatePicker
            id="vaccinationDate"
            className="vaccinationDate"
            maxDate={new Date().toISOString()}
            dateFormat="d/m/Y"
            datePickerType="single"
            value={formState.vaccinationDate}
            onChange={([date]) => updateSingle('vaccinationDate', date)}>
            <DatePickerInput
              id="date-picker-calendar-id"
              placeholder="dd/mm/yyyy"
              labelText={t('vaccinationDate', 'Vaccination Date')}
              type="text"
            />
          </DatePicker>
        </div>
        <div className={styles.immunizationSequenceSelect}>
          <DatePicker
            id="vaccinationExpiration"
            className="vaccinationExpiration"
            dateFormat="d/m/Y"
            datePickerType="single"
            value={formState.expirationDate}
            onChange={([date]) => updateSingle('expirationDate', date)}>
            <DatePickerInput
              id="date-picker-calendar-id"
              placeholder="dd/mm/yyyy"
              labelText={t('expirationDate', 'Expiration Date')}
              type="text"
            />
          </DatePicker>
        </div>
        <div className={styles.immunizationSequenceSelect}>
          <TextInput
            type="text"
            id="lotNumber"
            labelText={t('lotNumber', 'Lot Number')}
            defaultValue={formState.lotNumber}
            onChange={(evt) => updateSingle('lotNumber', evt.target.value)}
          />
        </div>
        <div className={styles.immunizationSequenceSelect}>
          <TextInput
            type="text"
            id="manufacturer"
            labelText={t('manufacturer', 'Manufacturer')}
            defaultValue={formState.manufacturer}
            onChange={(evt) => updateSingle('manufacturer', evt.target.value)}
          />
        </div>
        <div className={styles.immunizationSequenceSelect}>
          <div
            className={
              enableCreateButtons || enableEditButtons
                ? `${styles.buttonStyles} ${styles.buttonStylesBorder}`
                : styles.buttonStyles
            }>
            <Button
              type="button"
              kind="secondary"
              style={{ width: '50%', marginBottom: '1rem' }}
              onClick={closeWorkspace}>
              {t('cancel', 'Cancel')}
            </Button>
            <Button
              type="submit"
              kind="primary"
              style={{ width: '50%', marginBottom: '1rem' }}
              disabled={isViewEditMode ? !enableEditButtons : !enableCreateButtons}>
              {t('save', 'Save')}
            </Button>
          </div>
        </div>
      </Form>
    );
  }
  return <div>{createForm()}</div>;
};

export default ImmunizationsForm;
