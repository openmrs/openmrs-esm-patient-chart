import React, { type SyntheticEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonSet, DatePicker, DatePickerInput, Form, Select, SelectItem, TextInput } from '@carbon/react';
import { showSnackbar, useSession, useVisit, useLayoutType } from '@openmrs/esm-framework';
import { type DefaultWorkspaceProps } from '@openmrs/esm-patient-common-lib';
import { savePatientImmunization } from './immunizations.resource';
import { mapToFHIRImmunizationResource } from './immunization-mapper';
import { type ImmunizationFormData, type ImmunizationSequence } from './immunization-domain';
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
  const updateSingle = <T extends keyof ImmunizationFormState>(name: T, value: (typeof formState)[T]) =>
    setFormState((state) => ({ ...state, [name]: value }));

  const { t } = useTranslation();
  const currentUser = useSession();
  const { currentVisit } = useVisit(patientUuid);
  const isTablet = useLayoutType() === 'tablet';

  const isViewEditMode = !!formState.immunizationObsUuid;
  const enableCreateButtons = !isViewEditMode && !!formState.vaccinationDate;
  const enableEditButtons = isViewEditMode && formState.formChanged;

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
          showSnackbar({
            kind: 'success',
            title: t('vaccinationSaved', 'Vaccination saved successfully'),
          });
        },
        (err) => {
          showSnackbar({
            title: t('errorSaving', 'Error saving vaccination'),
            kind: 'error',
            isLowContrast: false,
            subtitle: err?.message,
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

  return (
    <Form className={styles.form} onSubmit={handleFormSubmit} data-testid="immunization-form">
      <div>
        <h4 className={styles.immunizationSequenceSelect}>
          {`${t('vaccine', 'Vaccine')} : ${formState?.vaccineName}`}{' '}
        </h4>
        {hasSequences(formState.sequences) && (
          <div className={styles.immunizationSequenceSelect}>
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
            onChange={([date]) => updateSingle('vaccinationDate', date.toISOString())}
          >
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
        </div>
        <div className={styles.immunizationSequenceSelect}>
          <TextInput
            type="text"
            id="lotNumber"
            labelText={t('lotNumber', 'Lot Number')}
            value={formState.lotNumber}
            onChange={(evt) => updateSingle('lotNumber', evt.target.value)}
          />
        </div>
        <div className={styles.immunizationSequenceSelect}>
          <TextInput
            type="text"
            id="manufacturer"
            labelText={t('manufacturer', 'Manufacturer')}
            value={formState.manufacturer}
            onChange={(evt) => updateSingle('manufacturer', evt.target.value)}
          />
        </div>
      </div>
      <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
        <Button className={styles.button} kind="secondary" onClick={() => closeWorkspace()}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button
          className={styles.button}
          kind="primary"
          disabled={isViewEditMode ? !enableEditButtons : !enableCreateButtons}
        >
          {t('save', 'Save')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default ImmunizationsForm;
