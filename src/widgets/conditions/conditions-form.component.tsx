import React from "react";
import { match } from "react-router";
import { getConditionByUuid } from "./conditions.resource";
import { createErrorHandler } from "@openmrs/esm-error-handling";
import { useCurrentPatient } from "@openmrs/esm-api";
import SummaryCard from "../cards/summary-card.component";
import styles from "./conditions-form.css";
import dayjs from "dayjs";
import { DataCaptureComponentProps } from "../../utils/data-capture-props";

export function ConditionsForm(props: ConditionsFormProps) {
  const [patientCondition, setPatientCondition] = React.useState(null);
  const [conditionUuid, setConditionUuid] = React.useState(null);
  const [conditionClinicalStatus, setConditionClinicalStatus] = React.useState(
    null
  );
  const [viewEditForm, setViewEditForm] = React.useState(true);
  const [enableEditButtons, setEnableEditButtons] = React.useState(true);
  const [patientUuid] = useCurrentPatient();
  const formRef = React.useRef<HTMLFormElement>(null);

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

  React.useEffect(() => {
    if (conditionUuid) {
      setEnableEditButtons(false);
    } else {
      setEnableEditButtons(true);
    }
  }, [conditionUuid]);

  function createCondition() {
    return (
      <SummaryCard name="Add Condition" match={props.match}>
        <h4>Condition</h4>
        <p>Add Condition</p>
      </SummaryCard>
    );
  }

  const handleCancelChanges = () => {
    formRef.current.reset();
    props.entryCancelled();
  };

  function editCondition() {
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
                <div
                  className="omrs-type-body-regular"
                  style={{ color: "#535355" }}
                >
                  Condition
                </div>
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
                <div
                  className="omrs-type-body-regular"
                  style={{ color: "#535355" }}
                >
                  Date of onset
                </div>
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
                  <div
                    className="omrs-type-body-regular"
                    style={{ color: "#535355" }}
                  >
                    Current status
                  </div>
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
                style={{ width: "20%" }}
              >
                Delete
              </button>
              <button
                type="button"
                className="omrs-btn omrs-outlined-neutral omrs-rounded"
                style={{ width: "30%" }}
                onClick={handleCancelChanges}
              >
                Cancel changes
              </button>
              <button
                type="submit"
                className={
                  enableEditButtons
                    ? "omrs-btn omrs-outlined omrs-rounded"
                    : "omrs-btn omrs-filled-action omrs-rounded"
                }
                style={{ width: "50%" }}
                disabled={enableEditButtons}
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
      {viewEditForm ? editCondition() : createCondition()}
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
