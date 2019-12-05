import React from "react";
import { match } from "react-router";
import {
  getPatientAllergyByPatientUuid,
  getAllergyReaction,
  updatePatientAllergy,
  deletePatientAllergy
} from "./allergy-intolerance.resource";
import { useCurrentPatient } from "@openmrs/esm-api";
import { createErrorHandler } from "@openmrs/esm-error-handling";
import SummaryCard from "../cards/summary-card.component";
import style from "./allergy-form.css";
import dayjs, { Dayjs } from "dayjs";
import { useHistory } from "react-router-dom";

export function AllergyEditForm(props: AllergyEditFormProps) {
  const history = useHistory();
  const [patientAllergyReaction, setPatientAllergyReaction] = React.useState(
    []
  );
  const [patientAllergy, setPatientAllergy] = React.useState(null);
  const [allergyReaction, setAllergyReaction] = React.useState();
  const [enableButtons, setEnableButtons] = React.useState(true);
  const formRef = React.useRef<HTMLFormElement>(null);
  const [reactionSeverityUuid, setReactionSeverityUuid] = React.useState(null);
  const [allergyComment, setAllergyComment] = React.useState(null);
  const [updatedDate, setUpdatedDate] = React.useState(null);

  const [
    isLoadingPatient,
    patient,
    patientUuid,
    patientErr
  ] = useCurrentPatient();

  const setCheckedValue = uuid => {
    return patientAllergy.reactions.some(
      reaction => reaction.reaction.uuid === uuid
    );
  };

  const handleAllergenReactionChange = event => {
    if (event.target.checked == true) {
      setPatientAllergyReaction([
        ...patientAllergyReaction,
        { uuid: event.target.value }
      ]);
    } else {
      patientAllergyReaction.splice(
        patientAllergyReaction.findIndex(
          reaction => reaction.uuid == event.target.value
        ),
        1
      );
    }
  };

  const handleSubmit = event => {
    event.preventDefault();
    const allergy: Allergy = {
      allergenType: patientAllergy.allergen.allergenType,
      codedAllergenUuid: patientAllergy.allergen.codedAllergen.uuid,
      severityUuid: reactionSeverityUuid,
      comment: allergyComment,
      reactionsUuid: patientAllergyReaction
    };
    const abortController = new AbortController();
    updatePatientAllergy(
      allergy,
      patientUuid,
      props.match.params,
      abortController
    ).then(response => {
      response.status == 200 && navigate();
    }, createErrorHandler);
    return () => abortController.abort();
  };

  const handleDeletePatientAllergy = () => {
    const abortController = new AbortController();
    deletePatientAllergy(patientUuid, props.match.params, abortController).then(
      response => {
        response.status == 204 && navigate();
      }
    );
  };

  const resetForm = () => {
    formRef.current.reset();
  };

  function navigate() {
    history.push(`/patient/${patientUuid}/chart/allergy`);
  }

  React.useEffect(() => {
    const abortController = new AbortController();
    if (patientUuid && props.match.params) {
      getPatientAllergyByPatientUuid(
        patientUuid,
        props.match.params,
        abortController
      ).then(response => setPatientAllergy(response.data), createErrorHandler);
    }

    getAllergyReaction().subscribe(
      data => setAllergyReaction(data),
      createErrorHandler
    );
  }, [patientUuid, props.match.params]);

  React.useEffect(() => {
    if (patientAllergy) {
      setAllergyComment(patientAllergy.comment);
      setReactionSeverityUuid(patientAllergy.severity.uuid);
      setUpdatedDate(patientAllergy.auditInfo.dateCreated);
      setPatientAllergyReaction(
        patientAllergy.reactions.map(reaction => {
          return { uuid: reaction.reaction.uuid };
        })
      );
    }
  }, [patientAllergy]);

  React.useEffect(() => {
    if (
      updatedDate &&
      reactionSeverityUuid &&
      allergyComment &&
      patientAllergyReaction.length > 0
    ) {
      setEnableButtons(false);
    } else {
      setEnableButtons(true);
    }
  }, [
    updatedDate,
    reactionSeverityUuid,
    allergyComment,
    patientAllergyReaction
  ]);

  return (
    <SummaryCard
      name="Edit Allergy"
      match={props.match}
      styles={{
        width: "100%",
        background: "var(--omrs-color-bg-medium-contrast)"
      }}
    >
      {patientAllergy && allergyReaction && (
        <form ref={formRef} onSubmit={handleSubmit}>
          <div>
            <div
              className={`${style.allergyEditHeader} omrs-padding-bottom-28`}
            >
              <h4>Allergen</h4>
              <h3>
                {patientAllergy.allergen.codedAllergen.display}{" "}
                <span>
                  ({patientAllergy.allergen.allergenType.toLowerCase()})
                </span>
              </h3>
            </div>
            <div>
              <h4 className={`${style.allergyHeader} omrs-bold`}>Reactions</h4>
              <h4 className={`${style.allergyHeader} omrs-type-body-regular`}>
                Select all that apply
              </h4>
              <div className={style.container}>
                {allergyReaction.map((reaction, index) => (
                  <div className="omrs-checkbox" key={reaction.name.uuid}>
                    <label>
                      <input
                        type="checkbox"
                        name="reactionsUuid"
                        defaultValue={reaction.uuid}
                        defaultChecked={setCheckedValue(reaction.uuid)}
                        onChange={handleAllergenReactionChange}
                      />
                      <span>{reaction.name.display}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className={`${style.allergyHeader} omrs-bold`}>
                Severity of worst reaction
              </h4>
              <div className={`${style.container}`}>
                <div className="omrs-radio-button">
                  <label>
                    <input
                      type="radio"
                      name="reactionSeverity"
                      defaultValue="1498AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
                      defaultChecked={
                        patientAllergy.severity.uuid ===
                        "1498AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
                      }
                      onChange={evt =>
                        setReactionSeverityUuid(evt.target.value)
                      }
                    />
                    <span>Mild</span>
                  </label>
                </div>
                <div className="omrs-radio-button">
                  <label>
                    <input
                      type="radio"
                      name="reactionSeverity"
                      defaultValue="1499AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
                      defaultChecked={
                        patientAllergy.severity.uuid ===
                        "1499AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
                      }
                      onChange={evt =>
                        setReactionSeverityUuid(evt.target.value)
                      }
                    />
                    <span>Moderate</span>
                  </label>
                </div>
                <div className="omrs-radio-button">
                  <label>
                    <input
                      type="radio"
                      name="reactionSeverity"
                      defaultValue="1500AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
                      defaultChecked={
                        patientAllergy.severity.uuid ===
                        "1500AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
                      }
                      onChange={evt =>
                        setReactionSeverityUuid(evt.target.value)
                      }
                    />
                    <span>Severe</span>
                  </label>
                </div>
              </div>
              <h4 className={`${style.allergyHeader} omrs-bold`}>
                Date of first onset
              </h4>
              <div className={`${style.container}`}>
                <div className="omrs-datepicker">
                  <input
                    type="date"
                    name="firstDateOfOnset"
                    defaultValue={dayjs(
                      patientAllergy.auditInfo.dateCreated
                    ).format("YYYY-MM-DD")}
                    required
                    onChange={evt => setUpdatedDate(evt.target.value)}
                  />
                  <svg className="omrs-icon" role="img">
                    <use xlinkHref="#omrs-icon-calendar"></use>
                  </svg>
                </div>
              </div>

              <h4 className={`${style.allergyHeader} omrs-bold`}>Comments</h4>
              <div className={style.allergyCommentContainer}>
                <textarea
                  className={`${style.allergyCommentTextArea} omrs-type-body-regular`}
                  required
                  name="comment"
                  rows={6}
                  defaultValue={patientAllergy.comment}
                  onChange={evt => setAllergyComment(evt.target.value)}
                ></textarea>
              </div>
            </div>
          </div>
          <div
            className={
              enableButtons
                ? style.buttonStyles
                : `${style.buttonStyles} ${style.buttonStylesBorder}`
            }
          >
            <button
              type="button"
              className="omrs-btn omrs-outlined-neutral omrs-rounded"
              style={{ width: "20%" }}
              onClick={handleDeletePatientAllergy}
            >
              Delete
            </button>
            <button
              type="button"
              className="omrs-btn omrs-outlined-neutral omrs-rounded"
              style={{ width: "30%" }}
              onClick={resetForm}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={
                enableButtons
                  ? "omrs-btn omrs-outlined omrs-rounded"
                  : "omrs-btn omrs-filled-action omrs-rounded"
              }
              style={{ width: "50%" }}
              disabled={enableButtons}
            >
              Sign & Save
            </button>
          </div>
        </form>
      )}
    </SummaryCard>
  );
}

type AllergyEditFormProps = {
  match: match;
};

type Allergy = {
  allergenType: string;
  codedAllergenUuid: string;
  severityUuid: string;
  comment: string;
  reactionsUuid: any[];
};
