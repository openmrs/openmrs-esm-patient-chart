import React from "react";
import { match } from "react-router";
import {
  getConditionByUuid,
  savePatientCondition
} from "./conditions.resource";
import { createErrorHandler } from "@openmrs/esm-error-handling";
import { useCurrentPatient } from "@openmrs/esm-api";
import { DataCaptureComponentProps } from "../../utils/data-capture-props";
import SummaryCard from "../cards/summary-card.component";
import styles from "./conditions-form.css";
import dayjs from "dayjs";

export function ConditionsForm(props: ConditionsFormProps) {
  const [conditionName, setConditionName] = React.useState("");
  const [clinicalStatus, setClinicalStatus] = React.useState(null);
  const [conditionClinicalStatus, setConditionClinicalStatus] = React.useState(
    null
  );
  const [conditionUuid, setConditionUuid] = React.useState(null);
  const [onsetDateTime, setOnsetDateTime] = React.useState(null);
  const [enableCreateButtons, setEnableCreateButtons] = React.useState(true);
  const [enableEditButtons, setEnableEditButtons] = React.useState(true);
  const [viewEditForm, setViewEditForm] = React.useState(true);
  const [patientCondition, setPatientCondition] = React.useState(null);
  const [patientUuid] = useCurrentPatient();
  const formRef = React.useRef<HTMLFormElement>(null);

  const handleStatusChange = event => {
    setClinicalStatus(null);
    setClinicalStatus(event.target.value);
  };

  React.useEffect(() => {
    if (conditionName && onsetDateTime && clinicalStatus) {
      setEnableCreateButtons(false);
    } else {
      setEnableCreateButtons(true);
    }
  }, [conditionName, onsetDateTime, clinicalStatus]);

  React.useEffect(() => {
    if (conditionClinicalStatus) {
      setEnableEditButtons(false);
    } else {
      setEnableEditButtons(true);
    }
  }, [conditionClinicalStatus]);

  React.useEffect(() => {
    const abortController = new AbortController();
    if (patientUuid && props.match.params) {
      getConditionByUuid(
        props.match.params["conditionUuid"],
        abortController
      ).then(condition => setPatientCondition(condition), createErrorHandler);
    }
  }),
    [patientUuid, props.match.params];

  React.useEffect(() => {
    const params: any = props.match.params;
    if (params.conditionUuid) {
      setViewEditForm(true);
    } else {
      setViewEditForm(false);
    }
  }, [props.match.params]);

  React.useEffect(() => {
    if (patientCondition) {
      setConditionUuid(patientCondition.resource.id);
      setConditionClinicalStatus(patientCondition.resource.clinicalStatus);
    }
  }, [patientCondition]);

  const handleCreateFormSubmit = event => {
    event.preventDefault();
    const patientCondition: Condition = {
      conditionName: conditionName,
      clinicalStatus: clinicalStatus,
      onsetDateTime: onsetDateTime
    };
    const abortController = new AbortController();
    savePatientCondition(patientCondition, patientUuid, abortController).then(
      response => response.status === 201 && props.entrySubmitted()
    );
  };

  function createForm() {
    return (
      <SummaryCard
        name="Add condition"
        match={props.match}
        styles={{
          width: "100%",
          background: "var(--omrs-color-bg-medium-contrast)"
        }}
      >
        <form
          onSubmit={handleCreateFormSubmit}
          onChange={() => props.entryStarted()}
          ref={formRef}
        >
          <div>
            <div
              className={`${styles.conditionCreateHeader} omrs-type-body-regular`}
            >
              <div className="omrs-type-body-regular">Condition</div>
              <div
                className={`omrs-type-body-large`}
                style={{
                  color: "var(--omrs-color-ink-high-contrast)",
                  fontWeight: 500
                }}
              >
                <div className="omrs-input-group">
                  <input
                    id="conditionName"
                    className="omrs-input-outlined"
                    type="text"
                    onChange={evt => setConditionName(evt.target.value)}
                    required
                    style={{ height: "2.75rem" }}
                  />
                </div>
              </div>
            </div>
            <div className={`${styles.conditionHeader} omrs-bold`}>
              <div className="omrs-type-body-regular">Date of onset</div>
              <div className={styles.container}>
                <div className="omrs-datepicker">
                  <input
                    type="date"
                    name="onsetDate"
                    required
                    onChange={evt => setOnsetDateTime(evt.target.value)}
                  />
                  <svg className="omrs-icon" role="img">
                    <use xlinkHref="#omrs-icon-calendar"></use>
                  </svg>
                </div>
              </div>
            </div>
            <div className={`${styles.conditionHeader} omrs-bold`}>
              <div className="omrs-type-body-regular">Current status</div>
              <div
                className={`${styles.container} omrs-type-body-regular`}
                style={{ display: "block" }}
              >
                <div className="omrs-radio-button">
                  <label>
                    <input
                      type="radio"
                      name="currentStatus"
                      value="active"
                      onChange={handleStatusChange}
                    />
                    <span>Active</span>
                  </label>
                </div>
                <div className="omrs-radio-button">
                  <label>
                    <input
                      type="radio"
                      name="currentStatus"
                      value="inactive"
                      onChange={handleStatusChange}
                    />
                    <span>Inactive</span>
                  </label>
                </div>
                <div className="omrs-radio-button">
                  <label>
                    <input
                      type="radio"
                      name="currentStatus"
                      value="historyOf"
                      onChange={handleStatusChange}
                    />
                    <span>History of</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div
            className={
              enableCreateButtons
                ? styles.buttonStyles
                : `${styles.buttonStyles} ${styles.buttonStylesBorder}`
            }
            style={{ position: "sticky" }}
          >
            <button
              type="button"
              className="omrs-btn omrs-outlined-neutral omrs-rounded"
              onClick={handleCancelChanges}
              style={{ width: "50%" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={
                enableCreateButtons
                  ? "omrs-btn omrs-outlined omrs-rounded"
                  : "omrs-btn omrs-filled-action omrs-rounded"
              }
              disabled={enableCreateButtons}
              style={{ width: "50%" }}
            >
              Sign & Save
            </button>
          </div>
        </form>
      </SummaryCard>
    );
  }

  const handleCancelChanges = () => {
    formRef.current.reset();
    props.entryCancelled();
  };

  function editForm() {
    return (
      <SummaryCard
        name="Edit conditions"
        match={props.match}
        styles={{
          width: "100%",
          background: "var(--omrs-color-bg-medium-contrast)"
        }}
      >
        {patientCondition && (
          <form ref={formRef}>
            <div>
              <div
                className={`${styles.conditionEditHeader} omrs-padding-bottom-28`}
              >
                <div className="omrs-type-body-regular">Condition</div>
                <div
                  className={`omrs-type-body-large`}
                  style={{
                    color: "var(--omrs-color-ink-high-contrast)",
                    fontWeight: 500
                  }}
                >
                  {patientCondition.resource.code.text}{" "}
                </div>
              </div>
              <div className={`${styles.conditionHeader} omrs-bold`}>
                <div className="omrs-type-body-regular">Date of onset</div>
                <div className={`${styles.container}`}>
                  <div className="omrs-datepicker">
                    <input
                      type="date"
                      name="dateOfOnset"
                      defaultValue={dayjs(
                        patientCondition.resource.onsetDateTime
                      ).format("YYYY-MM-DD")}
                      required
                    />
                    <svg className="omrs-icon" role="img">
                      <use xlinkHref="#omrs-icon-calendar"></use>
                    </svg>
                  </div>
                </div>
              </div>
              {patientCondition.resource.clinicalStatus && (
                <div className={`${styles.conditionHeader} omrs-bold`}>
                  <div className="omrs-type-body-regular">Current status</div>
                  <div
                    className={`${styles.container} omrs-type-body-regular`}
                    style={{ display: "block" }}
                  >
                    <div className="omrs-radio-button">
                      <label>
                        <input
                          type="radio"
                          name="currentStatus"
                          value="active"
                          defaultChecked={
                            patientCondition.resource.clinicalStatus ===
                            "active"
                          }
                          onChange={evt => setConditionClinicalStatus(evt)}
                        />
                        <span>Active</span>
                      </label>
                    </div>
                    <div className="omrs-radio-button">
                      <label>
                        <input
                          type="radio"
                          name="currentStatus"
                          value="inactive"
                          defaultChecked={
                            patientCondition.resource.clinicalStatus ===
                            "inactive"
                          }
                          onChange={evt => setConditionClinicalStatus(evt)}
                        />
                        <span>Inactive</span>
                      </label>
                    </div>
                    <div className="omrs-radio-button">
                      <label>
                        <input
                          type="radio"
                          name="currentStatus"
                          value="historyOf"
                          defaultChecked={
                            patientCondition.resource.clinicalStatus ===
                            "historyOf"
                          }
                          onChange={evt => setConditionClinicalStatus(evt)}
                        />
                        <span>History of</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div
              className={
                enableEditButtons
                  ? styles.buttonStyles
                  : `${styles.buttonStyles} ${styles.buttonStylesBorder}`
              }
              style={{ position: "sticky" }}
            >
              <button
                type="button"
                className="omrs-btn omrs-outlined-neutral omrs-rounded"
                onClick={handleCancelChanges}
                style={{ width: "50%" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={
                  enableCreateButtons
                    ? "omrs-btn omrs-outlined omrs-rounded"
                    : "omrs-btn omrs-filled-action omrs-rounded"
                }
                disabled={enableCreateButtons}
                style={{ width: "50%" }}
              >
                Sign & Save
              </button>
            </div>
          </form>
        )}
      </SummaryCard>
    );
  }

  return (
    <div className={styles.conditionForm}>
      {viewEditForm ? editForm() : createForm()}
    </div>
  );
}

ConditionsForm.defaultProps = {
  entryStarted: () => {},
  entryCancelled: () => {},
  entrySubmitted: () => {}
};

type ConditionsFormProps = DataCaptureComponentProps & {
  match: match;
};

type Condition = {
  conditionName: string;
  clinicalStatus: string;
  onsetDateTime: string;
};
