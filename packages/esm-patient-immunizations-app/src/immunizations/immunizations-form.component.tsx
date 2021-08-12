import React, { useEffect, useRef, useState } from 'react';
import styles from './immunizations-form.css';
import { SummaryCard } from '@openmrs/esm-patient-common-lib';
import { createErrorHandler, showNotification, showToast, useSessionUser, useVisit } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { savePatientImmunization } from './immunizations.resource';
import { mapToFHIRImmunizationResource } from './immunization-mapper';
import { useHistory } from 'react-router-dom';
import { ImmunizationFormData, ImmunizationSequence } from './immunization-domain';
import { DataCaptureComponentProps } from '../types';

function hasSequences<T>(sequences: Array<T>) {
  return sequences && sequences?.length > 0;
}

type ImmunizationsFormProps = DataCaptureComponentProps & {
  match: { params: ImmunizationFormData };
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

const ImmunizationsForm: React.FC<ImmunizationsFormProps> = ({
  patientUuid,
  match,
  closeComponent = () => {},
  entryStarted = () => {},
  entryCancelled = () => {},
}) => {
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

  const formRef = useRef<HTMLFormElement>(null);
  const { t } = useTranslation();
  const history = useHistory();
  const today = new Date().toISOString().split('T')[0];
  const currentUser = useSessionUser();
  const { currentVisit } = useVisit(patientUuid);

  const isViewEditMode = !!formState.immunizationObsUuid;
  const enableCreateButtons = !isViewEditMode && !!formState.vaccinationDate;
  const enableEditButtons = isViewEditMode && formState.formChanged;

  useEffect(() => {
    if (match.params) {
      const {
        immunizationObsUuid,
        vaccineName,
        vaccineUuid,
        manufacturer,
        expirationDate,
        vaccinationDate,
        lotNumber,
        sequences,
        currentDose,
      }: ImmunizationFormData = match.params;

      const formStateFromParam: ImmunizationFormState = {
        immunizationObsUuid,
        vaccineName,
        vaccineUuid,
        manufacturer,
        lotNumber,
        expirationDate,
        vaccinationDate,
        formChanged: false,
        sequences: hasSequences(sequences) ? sequences : [],
        currentDose: currentDose || ({} as ImmunizationSequence),
      };
      setFormState(formStateFromParam);
    }
  }, [match.params]);

  const handleFormSubmit = (event) => {
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
    ).then(
      (response) => {
        response.status === 201 && navigate();
        showToast({
          kind: 'success',
          description: t('vaccinationSaved', 'Vaccination Saved Successfully'),
        });
      },
      (err) => {
        createErrorHandler();
        showNotification({
          title: t('errorSaving', 'Error Saving Vaccination'),
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
    const addFormHeader = t('addVaccineFormat', `Add Vaccine: ${formState?.vaccineName}`, { formState });

    const editFormHeader = t('editVaccineFormat', `Edit Vaccine: ${formState?.vaccineName}`, { formState });

    return (
      <form
        onSubmit={handleFormSubmit}
        data-testid="immunization-form"
        onChange={() => {
          updateSingle('formChanged', true);
          return entryStarted();
        }}
        className={styles.immunizationsForm}
        ref={formRef}>
        <SummaryCard
          name={isViewEditMode ? editFormHeader : addFormHeader}
          className={styles.immunizationsFormSummaryCard}>
          <div className={styles.immunizationsContainerWrapper}>
            <div style={{ flex: 1, margin: '0rem 0.5rem' }}>
              {hasSequences(formState.sequences) && (
                <div className={styles.immunizationsInputContainer}>
                  <label htmlFor="sequence">{t('sequence', 'Sequence')}</label>
                  <div className="omrs-select">
                    <select
                      id="sequence"
                      name="sequence"
                      value={formState.currentDose.sequenceNumber}
                      onChange={onDoseSelect}
                      className={`immunizationSequenceSelect`}
                      required>
                      <option value="DEFAULT">{t('pleaseSelect', 'Please select')}</option>
                      {formState.sequences.map((s) => {
                        return (
                          <option key={s.sequenceNumber} value={s.sequenceNumber}>
                            {t(s.sequenceLabel, s.sequenceLabel)}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              )}
              <div className={styles.immunizationsInputContainer}>
                <label htmlFor="vaccinationDate">{t('vaccinationDate', 'Vaccination Date')}</label>
                <div className="omrs-datepicker">
                  <input
                    type="date"
                    id="vaccinationDate"
                    name="vaccinationDate"
                    max={today}
                    required
                    defaultValue={formState.vaccinationDate}
                    onChange={(evt) => updateSingle('vaccinationDate', evt.target.value)}
                  />
                  <svg className="omrs-icon" role="img">
                    <use xlinkHref="#omrs-icon-calendar"></use>
                  </svg>
                </div>
              </div>
              <div className={styles.immunizationsInputContainer}>
                <label htmlFor="vaccinationExpiration">{t('expirationDate', 'Expiration Date')}</label>
                <div className="omrs-datepicker">
                  <input
                    type="date"
                    id="vaccinationExpiration"
                    name="vaccinationExpiration"
                    defaultValue={formState.expirationDate}
                    onChange={(evt) => updateSingle('expirationDate', evt.target.value)}
                  />
                  <svg className="omrs-icon" role="img">
                    <use xlinkHref="#omrs-icon-calendar"></use>
                  </svg>
                </div>
              </div>
              <div className={styles.immunizationsInputContainer}>
                <label htmlFor="lotNumber">{t('lotNumber', 'Lot Number')}</label>
                <div className="omrs-input-group">
                  <input
                    className="omrs-input-outlined"
                    type="text"
                    id="lotNumber"
                    style={{ height: '2.75rem' }}
                    defaultValue={formState.lotNumber}
                    onChange={(evt) => updateSingle('lotNumber', evt.target.value)}
                  />
                </div>
              </div>
              <div className={styles.immunizationsInputContainer}>
                <label htmlFor="manufacturer">{t('manufacturer', 'Manufacturer')}</label>
                <div className="omrs-input-group">
                  <input
                    className="omrs-input-outlined"
                    type="text"
                    id="manufacturer"
                    style={{ height: '2.75rem' }}
                    defaultValue={formState.manufacturer}
                    onChange={(evt) => updateSingle('manufacturer', evt.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </SummaryCard>
        <div
          className={
            enableCreateButtons || enableEditButtons
              ? `${styles.buttonStyles} ${styles.buttonStylesBorder}`
              : styles.buttonStyles
          }>
          <button
            type="button"
            className="omrs-btn omrs-outlined-neutral omrs-rounded"
            style={{ width: '50%' }}
            onClick={closeForm}>
            {t('cancel', 'Cancel')}
          </button>
          <button
            type="submit"
            style={{ width: '50%' }}
            className={
              enableCreateButtons || enableEditButtons
                ? 'omrs-btn omrs-filled-action omrs-rounded'
                : 'omrs-btn omrs-outlined omrs-rounded'
            }
            disabled={isViewEditMode ? !enableEditButtons : !enableCreateButtons}>
            {t('save', 'Save')}
          </button>
        </div>
      </form>
    );
  }

  const closeForm = (event) => {
    let userConfirmed: boolean = false;
    const defaultConfirmMessage = 'There is ongoing work, are you sure you want to close this tab?';
    const confirmMessage = t('close form confirm message', defaultConfirmMessage);
    if (formState.formChanged) {
      userConfirmed = confirm(confirmMessage);
    }

    if (userConfirmed && formState.formChanged) {
      entryCancelled();
      history.push(`/patient/${patientUuid}/chart/immunizations`);
      closeComponent();
    } else if (!formState.formChanged) {
      entryCancelled();
      history.push(`/patient/${patientUuid}/chart/immunizations`);
      closeComponent();
    }
  };

  return <div>{createForm()}</div>;
};

export default ImmunizationsForm;
