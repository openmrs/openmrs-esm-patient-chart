import React, { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import SummaryCard from "../cards/summary-card.component";
import styles from "./conditions-form.css";
import { useHistory } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
import { createErrorHandler } from "@openmrs/esm-framework";
import {
  createPatientCondition,
  updatePatientCondition
} from "./conditions.resource";
import { DataCaptureComponentProps } from "../types";

type ConditionsFormProps = DataCaptureComponentProps & {
  match: any;
  patientUuid: string;
};

interface Condition {
  conditionUuid?: string;
  inactivityDate?: string;
  conditionName: string;
  clinicalStatus: string;
  onsetDateTime: string;
}

const ConditionsForm: React.FC<ConditionsFormProps> = ({
  match,
  patientUuid,
  entryStarted = () => {},
  entryCancelled = () => {},
  closeComponent = () => {}
}) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [conditionName, setConditionName] = useState("");
  const [conditionUuid, setConditionUuid] = useState("");
  const [clinicalStatus, setClinicalStatus] = useState(null);
  const [onsetDateTime, setOnsetDateTime] = useState(null);
  const [enableCreateFormButtons, setEnableCreateFormButtons] = useState(false);
  const [enableEditFormButtons, setEnableEditFormButtons] = useState(true);
  const [viewEditForm, setViewEditForm] = useState(true);
  const [inactiveStatus, setInactiveStatus] = useState(false);
  const [inactivityDate, setInactivityDate] = useState("");
  const [formChanged, setFormChanged] = useState(false);
  const { t } = useTranslation();
  const history = useHistory();

  useEffect(() => {
    if (conditionName && onsetDateTime && clinicalStatus) {
      setEnableCreateFormButtons(true);
    } else {
      setEnableCreateFormButtons(false);
    }
  }, [conditionName, onsetDateTime, clinicalStatus]);

  useEffect(() => {
    if (viewEditForm && formChanged) {
      setEnableEditFormButtons(true);
    } else {
      setEnableEditFormButtons(false);
    }
  }, [viewEditForm, formChanged]);

  useEffect(() => {
    if (match.params) {
      const {
        conditionUuid,
        conditionName,
        clinicalStatus,
        onsetDateTime
      }: Condition = match.params;
      if (conditionName && clinicalStatus && onsetDateTime) {
        setViewEditForm(true);
        setConditionUuid(conditionUuid), setConditionName(conditionName);
        setClinicalStatus(clinicalStatus);
        setOnsetDateTime(onsetDateTime);
      } else {
        setViewEditForm(false);
      }
    }
  }, [match.params]);

  const handleCreateFormSubmit = event => {
    event.preventDefault();

    const condition: Condition = {
      conditionName: conditionName,
      clinicalStatus: clinicalStatus,
      onsetDateTime: onsetDateTime
    };
    const abortController = new AbortController();
    createPatientCondition(condition, patientUuid, abortController)
      .then(response => response.status == 201 && navigate())
      .catch(createErrorHandler());
  };

  function navigate() {
    history.push(`/patient/${patientUuid}/chart/appointments`);
  }

  function createConditions() {
    return (
      <form
        onSubmit={handleCreateFormSubmit}
        onChange={() => {
          setFormChanged(true);
          return entryStarted();
        }}
        ref={formRef}
      >
        <SummaryCard
          name={t("addANewCondition", "Add a new condition")}
          styles={{
            width: "100%",
            background: "var(--omrs-color-bg-medium-contrast)",
            height: "auto"
          }}
        >
          <div className={styles.conditionsContainerWrapper}>
            <div style={{ flex: 1, margin: "0rem 0.5rem" }}>
              <div
                className={`omrs-type-body-regular ${styles.conditionsInputContainer}`}
              >
                <label htmlFor="conditionName">
                  <Trans i18nKey="condition">Condition</Trans>
                </label>
                <div className="omrs-input-group">
                  <input
                    id="conditionName"
                    className="omrs-input-outlined"
                    type="text"
                    onChange={event => setConditionName(event.target.value)}
                    required
                    style={{ height: "2.75rem" }}
                  />
                </div>
              </div>
              <div className={styles.conditionsInputContainer}>
                <label htmlFor="onsetDate">
                  <Trans i18nKey="dateOfOnset">Date of onset</Trans>
                </label>
                <div className="omrs-datepicker">
                  <input
                    id="onsetDate"
                    type="date"
                    name="onsetDate"
                    max={dayjs(new Date().toUTCString()).format("YYYY-MM-DD")}
                    onChange={event => setOnsetDateTime(event.target.value)}
                  />
                  <svg className="omrs-icon" role="img">
                    <use xlinkHref="#omrs-icon-calendar"></use>
                  </svg>
                </div>
              </div>
              <div className={styles.conditionsInputContainer}>
                <label htmlFor="currentStatus">
                  <Trans i18nKey="currentStatus">Current status</Trans>
                </label>
                <div className={styles.statusContainer}>
                  <div className="omrs-radio-button">
                    <label>
                      <input
                        id="active"
                        type="radio"
                        value="active"
                        onChange={event => {
                          setClinicalStatus(event.target.value);
                          setInactiveStatus(false);
                        }}
                      />
                      <span>
                        <Trans i18nKey="active">Active</Trans>
                      </span>
                    </label>
                  </div>
                  <div className="omrs-radio-button">
                    <label>
                      <input
                        id="inactive"
                        type="radio"
                        value="inactive"
                        onChange={event => {
                          setClinicalStatus(event.target.value);
                          setInactiveStatus(true);
                        }}
                      />
                      <span>
                        <Trans i18nKey="inactive">Inactive</Trans>
                      </span>
                    </label>
                  </div>
                  <div className="omrs-radio-button">
                    <label>
                      <input
                        id="historyOf"
                        type="radio"
                        value="historyOf"
                        onChange={event => {
                          setClinicalStatus(event.target.value);
                          setInactiveStatus(true);
                        }}
                      />
                      <span>
                        <Trans i18nKey="historyOf">History of</Trans>
                      </span>
                    </label>
                  </div>
                </div>
              </div>
              {inactiveStatus && (
                <div className={styles.conditionsInputContainer}>
                  <label htmlFor="dateOfInactivity">
                    <Trans i18nKey="dateOfInactivity">Date of inactivity</Trans>
                  </label>
                  <div className="omrs-datepicker">
                    <input
                      type="date"
                      id="dateOfInactivity"
                      name="dateOfInactivity"
                      defaultValue={inactivityDate}
                      onChange={event => setInactivityDate(event.target.value)}
                    />
                    <svg className="omrs-icon" role="img">
                      <use xlinkHref="#omrs-icon-calendar"></use>
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>
        </SummaryCard>
        <div
          className={
            enableCreateFormButtons
              ? `${styles.buttonStyles} ${styles.buttonStylesBorder}`
              : styles.buttonStyles
          }
        >
          <button
            type="button"
            className="omrs-btn omrs-outlined-neutral omrs-rounded"
            style={{ width: "50%" }}
            onClick={closeForm}
          >
            <Trans i18nKey="cancel">Cancel</Trans>
          </button>
          <button
            type="submit"
            style={{ width: "50%" }}
            className={
              enableCreateFormButtons
                ? "omrs-btn omrs-filled-action omrs-rounded"
                : "omrs-btn omrs-outlined omrs-rounded"
            }
            onClick={event => handleCreateFormSubmit(event)}
            disabled={!enableCreateFormButtons}
          >
            <Trans i18nKey="signAndSave">Sign & Save</Trans>
          </button>
        </div>
      </form>
    );
  }

  const closeForm = event => {
    let userConfirmed: boolean = false;
    if (formChanged) {
      userConfirmed = confirm(
        "There is ongoing work, are you sure you want to close this tab?"
      );
    }

    if (userConfirmed && formChanged) {
      entryCancelled();
      closeComponent();
    } else if (!formChanged) {
      entryCancelled();
      closeComponent();
    }
  };

  const handleEditSubmit = event => {
    event.preventDefault();

    const condition: Condition = {
      conditionUuid: conditionUuid,
      conditionName: conditionName,
      clinicalStatus: clinicalStatus,
      onsetDateTime: onsetDateTime,
      inactivityDate: inactivityDate
    };
    const abortController = new AbortController();
    updatePatientCondition(condition, patientUuid, abortController)
      .then(response => response.status == 200 && navigate())
      .catch(createErrorHandler());
  };

  function editCondition() {
    return (
      <>
        {conditionName && clinicalStatus && onsetDateTime && (
          <form
            onChange={() => {
              setFormChanged(true);
              return entryStarted();
            }}
            onSubmit={handleEditSubmit}
            className={styles.conditionsForm}
            ref={formRef}
          >
            <SummaryCard
              name={t("editCondition", "Edit Condition")}
              styles={{
                width: "100%",
                backgroundColor: "var(--omrs-color-bg-medium-contrast)",
                height: "auto"
              }}
            >
              <div className={styles.conditionsContainerWrapper}>
                <div style={{ flex: 1, margin: "0rem 0.5rem" }}>
                  <div
                    className={`omrs-type-body-regular ${styles.conditionsInputContainer}`}
                  >
                    <label htmlFor="conditionName">
                      <Trans i18nKey="condition">Condition</Trans>
                    </label>
                    <span className="omrs-medium">{conditionName}</span>
                  </div>
                  <div className={styles.conditionsInputContainer}>
                    <label htmlFor="onsetDate">
                      <Trans i18nKey="dateOfOnset">Date of onset</Trans>
                    </label>
                    <div className="omrs-datepicker">
                      <input
                        type="date"
                        id="onsetDate"
                        name="onsetDate"
                        defaultValue={dayjs(onsetDateTime).format("YYYY-MM-DD")}
                      />
                      <svg className="omrs-icon" role="img">
                        <use xlinkHref="#omrs-icon-calendar"></use>
                      </svg>
                    </div>
                  </div>
                  <div className={styles.conditionsInputContainer}>
                    <label htmlFor="currentStatus">
                      <Trans i18nKey="currentStatus">Current status</Trans>
                    </label>
                    <div className={styles.statusContainer}>
                      <div className="omrs-radio-button">
                        <label>
                          <input
                            id="active"
                            type="radio"
                            name="currentStatus"
                            value="active"
                            defaultChecked={clinicalStatus === "active"}
                            onChange={event => {
                              setClinicalStatus(event.target.value);
                              setInactiveStatus(false);
                            }}
                          />
                          <span>
                            <Trans i18nKey="active">Active</Trans>
                          </span>
                        </label>
                      </div>
                      <div className="omrs-radio-button">
                        <label>
                          <input
                            id="inactive"
                            type="radio"
                            name="currentStatus"
                            value="inactive"
                            defaultChecked={clinicalStatus === "inactive"}
                            onChange={event => {
                              setClinicalStatus(event.target.value);
                              setInactiveStatus(true);
                            }}
                          />
                          <span>
                            <Trans i18nKey="inactive">Inactive</Trans>
                          </span>
                        </label>
                      </div>
                      <div className="omrs-radio-button">
                        <label>
                          <input
                            id="historyOf"
                            type="radio"
                            name="currentStatus"
                            value="historyOf"
                            defaultChecked={clinicalStatus === "historyOf"}
                            onChange={event => {
                              setClinicalStatus(event.target.value);
                              setInactiveStatus(true);
                            }}
                          />
                          <span>
                            <Trans i18nKey="historyOf">History of</Trans>
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                  {inactiveStatus && (
                    <div className={styles.conditionsInputContainer}>
                      <label htmlFor="dateOfInactivity">
                        <Trans i18nKey="dateOfInactivity">
                          Date of inactivity
                        </Trans>
                      </label>
                      <div className="omrs-datepicker">
                        <input
                          type="date"
                          id="dateOfInactivity"
                          name="dateOfInactivity"
                          defaultValue={inactivityDate}
                          onChange={event =>
                            setInactivityDate(event.target.value)
                          }
                        />
                        <svg className="omrs-icon" role="img">
                          <use xlinkHref="#omrs-icon-calendar"></use>
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </SummaryCard>
            <div
              className={
                enableEditFormButtons
                  ? styles.buttonStyles
                  : `${styles.buttonStyles} ${styles.buttonStylesBorder}`
              }
            >
              <button
                type="submit"
                className="omrs-btn omrs-outlined-neutral omrs-rounded"
                style={{ width: "20%" }}
              >
                <Trans i18nKey="delete">Delete</Trans>
              </button>
              <button
                type="button"
                className="omrs-btn omrs-outlined-neutral omrs-rounded"
                onClick={closeForm}
                style={{ width: "30%" }}
              >
                <Trans i18nKey="cancelChanges">Cancel changes</Trans>
              </button>
              <button
                type="submit"
                className={
                  enableEditFormButtons
                    ? "omrs-btn omrs-filled-action omrs-rounded"
                    : "omrs-btn omrs-outlined omrs-rounded"
                }
                onClick={event => handleEditSubmit(event)}
                disabled={!enableEditFormButtons}
                style={{ width: "50%" }}
              >
                <Trans i18nKey="signAndSave">Sign & Save</Trans>
              </button>
            </div>
          </form>
        )}
      </>
    );
  }

  return <div>{viewEditForm ? editCondition() : createConditions()}</div>;
};

export default ConditionsForm;
