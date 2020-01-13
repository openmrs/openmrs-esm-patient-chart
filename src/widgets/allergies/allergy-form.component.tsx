import React, { DetailedHTMLProps } from "react";
import { match } from "react-router";
import SummaryCard from "../cards/summary-card.component";
import style from "./allergy-form.css";
import {
  getAllergyAllergenByConceptUuid,
  getAllergyReaction,
  savePatientAllergy,
  deletePatientAllergy,
  getPatientAllergyByPatientUuid,
  updatePatientAllergy
} from "./allergy-intolerance.resource";
import { createErrorHandler } from "@openmrs/esm-error-handling";
import { useCurrentPatient } from "@openmrs/esm-api";
import dayjs from "dayjs";

const DRUG_ALLERGEN_CONCEPT: string = "162552AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const ENVIROMENTAL_ALLERGEN_CONCEPT: string =
  "162554AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const FOOD_ALLERGEN_CONCEPT: string = "162553AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const MILD_REACTION_SEVERITY_CONCEPT: string =
  "1498AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const MODERATE_REACTION_SEVERITY_CONCEPT: string =
  "1499AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const SEVERE_REACTION_SEVERITY_CONCEPT: string =
  "1500AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

export function AllergyForm(props: AllergyFormProps) {
  const [codedAllergenUuid, setCodedAllergenUuid] = React.useState(null);
  const [allergenType, setAllergenType] = React.useState(null);
  const [allergensArray, setAllergensArray] = React.useState(null);
  const [allergyReaction, setAllergyReaction] = React.useState();
  const [enableCreateButtons, setEnableCreateButtons] = React.useState(true);
  const [enableEditButtons, setEnableEditButtons] = React.useState(true);
  const [patientAlleryReaction, setPatientAllergyReaction] = React.useState([]);
  const [comment, setComment] = React.useState("");
  const [selectedAllergyCategory, setSelectedAllergyCategory] = React.useState(
    null
  );
  const [patientAllergy, setPatientAllergy] = React.useState(null);
  const [reactionSeverityUuid, setReactionSeverityUuid] = React.useState(null);
  const [allergyComment, setAllergyComment] = React.useState(null);
  const [updatedDate, setUpdatedDate] = React.useState(null);
  const [
    isLoadingPatient,
    patient,
    patientUuid,
    patientErr
  ] = useCurrentPatient();
  const formRef = React.useRef<HTMLFormElement>(null);
  const [viewForm, setViewForm] = React.useState(true);

  const handleAllergenChange = event => {
    setAllergensArray(null);
    setAllergenType(getAllergenType(event.target.value));
    setSelectedAllergyCategory(event.target.value);
  };

  function getAllergenType(allergenConcept: string): string {
    switch (allergenConcept) {
      case DRUG_ALLERGEN_CONCEPT:
        return "DRUG";
      case FOOD_ALLERGEN_CONCEPT:
        return "FOOD";
      case ENVIROMENTAL_ALLERGEN_CONCEPT:
        return "ENVIROMENTAL";

      default:
        "NO ALLERGEN";
    }
  }
  React.useEffect(() => {
    if (
      comment &&
      allergenType &&
      codedAllergenUuid &&
      patientAlleryReaction &&
      reactionSeverityUuid
    ) {
      setEnableCreateButtons(false);
    } else {
      setEnableCreateButtons(true);
    }
  }, [
    comment,
    allergenType,
    codedAllergenUuid,
    patientAlleryReaction,
    reactionSeverityUuid
  ]);

  React.useEffect(() => {
    if (
      updatedDate &&
      reactionSeverityUuid &&
      allergyComment &&
      patientAlleryReaction.length > 0
    ) {
      setEnableEditButtons(false);
    } else {
      setEnableEditButtons(true);
    }
  }, [
    updatedDate,
    reactionSeverityUuid,
    allergyComment,
    patientAlleryReaction
  ]);

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
    if (selectedAllergyCategory) {
      getAllergyAllergenByConceptUuid(selectedAllergyCategory).subscribe(
        data => setAllergensArray(data),
        createErrorHandler
      );
      getAllergyReaction().subscribe(
        data => setAllergyReaction(data),
        createErrorHandler
      );
    }
  }, [selectedAllergyCategory]);

  const handleAllergenReactionChange = event => {
    if (event.target.checked == true) {
      setPatientAllergyReaction([
        ...patientAlleryReaction,
        { uuid: event.target.value }
      ]);
    } else {
      patientAlleryReaction.splice(
        patientAlleryReaction.findIndex(
          reaction => reaction.uuid == event.target.value
        ),
        1
      );
    }
  };

  const handleEditFormSubmit = event => {
    event.preventDefault();
    const allergy: Allergy = {
      allergenType: patientAllergy.allergen.allergenType,
      codedAllergenUuid: patientAllergy.allergen.codedAllergen.uuid,
      severityUuid: reactionSeverityUuid,
      comment: allergyComment,
      reactionsUuid: patientAlleryReaction
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

  const handleCreateFormSubmit = event => {
    event.preventDefault();
    const patientAllergy: Allergy = {
      allergenType: allergenType,
      codedAllergenUuid: codedAllergenUuid,
      severityUuid: reactionSeverityUuid,
      comment: comment,
      reactionsUuid: patientAlleryReaction
    };
    const abortController = new AbortController();
    savePatientAllergy(patientAllergy, patientUuid, abortController)
      .then(response => {
        response.status == 201 && navigate();
      })
      .catch(createErrorHandler());
    return () => abortController.abort();
  };

  const handleCancelChanges = () => {
    formRef.current.reset();
  };

  function navigate() {
    window.location.href = `https://openmrs-spa.org/openmrs/spa/patient/${patientUuid}/chart/allergy`;
  }

  const setCheckedValue = uuid => {
    return patientAllergy.reactions.some(
      reaction => reaction.reaction.uuid === uuid
    );
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

  function createForm() {
    return (
      <SummaryCard
        name="Add Allergy"
        match={props.match}
        styles={{
          width: "100%",
          background: "var(--omrs-color-bg-medium-contrast)"
        }}
      >
        <form onSubmit={handleCreateFormSubmit} ref={formRef}>
          <h4 className={`${style.allergyHeader} omrs-bold`}>
            Category of reaction
          </h4>
          <div className={`${style.container}`}>
            <div className={`omrs-radio-button ${style.inputMargin}`}>
              <label>
                <input
                  type="radio"
                  name="allergenType"
                  value={DRUG_ALLERGEN_CONCEPT}
                  onChange={handleAllergenChange}
                />
                <span id="DRUG">Drug</span>
              </label>
            </div>
            <div className={`omrs-radio-button ${style.inputMargin}`}>
              <label>
                <input
                  type="radio"
                  name="allergenType"
                  value={FOOD_ALLERGEN_CONCEPT}
                  onChange={handleAllergenChange}
                />
                <span id="FOOD">Food</span>
              </label>
            </div>
            <div className={`omrs-radio-button ${style.inputMargin}`}>
              <label>
                <input
                  type="radio"
                  name="allergenType"
                  value={ENVIROMENTAL_ALLERGEN_CONCEPT}
                  onChange={handleAllergenChange}
                />
                <span id="ENVIROMENTAL">Enviromental</span>
              </label>
            </div>
            <div className={`omrs-radio-button ${style.inputMargin}`}>
              <label>
                <input
                  type="radio"
                  name="allergenType"
                  value="noAllergy"
                  onChange={handleAllergenChange}
                />
                <span id="NOALLERGIES">Patient has no allergies</span>
              </label>
            </div>
          </div>
          {allergensArray && (
            <div>
              <h4 className={`${style.allergyHeader} omrs-bold`}>
                {getAllergenType(selectedAllergyCategory)
                  .charAt(0)
                  .toUpperCase() +
                  getAllergenType(selectedAllergyCategory)
                    .slice(1)
                    .toLowerCase()}{" "}
                allergen
              </h4>
              <div className={style.container}>
                {allergensArray.map(allergen => (
                  <div
                    className={`omrs-radio-button ${style.inputMargin}`}
                    key={allergen.name.uuid}
                  >
                    <label>
                      <input
                        type="radio"
                        name="codedAllergenUuid"
                        value={allergen.uuid}
                        onChange={evt => setCodedAllergenUuid(evt.target.value)}
                      />
                      <span>{allergen.name.display}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
          {allergensArray && allergyReaction && (
            <div>
              <h4 className={`${style.allergyHeader} omrs-bold`}>Reactions</h4>
              <h4 className={`${style.allergyHeader} omrs-type-body-regular`}>
                Select all that apply
              </h4>
              <div className={style.container}>
                {allergyReaction.map(reaction => (
                  <div
                    className={`omrs-checkbox ${style.inputMargin}`}
                    key={reaction.name.uuid}
                  >
                    <label>
                      <input
                        type="checkbox"
                        name="reactionsUuid"
                        value={reaction.uuid}
                        onChange={handleAllergenReactionChange}
                      />
                      <span>{reaction.name.display}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
          {allergensArray && (
            <div>
              <h4 className={`${style.allergyHeader} omrs-bold`}>
                Severity of worst reaction
              </h4>
              <div className={`${style.container}`}>
                <div className={`omrs-radio-button ${style.inputMargin}`}>
                  <label>
                    <input
                      type="radio"
                      name="reactionSeverity"
                      value={MILD_REACTION_SEVERITY_CONCEPT}
                      onChange={evt =>
                        setReactionSeverityUuid(evt.target.value)
                      }
                    />
                    <span>Mild</span>
                  </label>
                </div>
                <div className={`omrs-radio-button ${style.inputMargin}`}>
                  <label>
                    <input
                      type="radio"
                      name="reactionSeverity"
                      value={MODERATE_REACTION_SEVERITY_CONCEPT}
                      onChange={evt =>
                        setReactionSeverityUuid(evt.target.value)
                      }
                    />
                    <span>Moderate</span>
                  </label>
                </div>
                <div className={`omrs-radio-button ${style.inputMargin}`}>
                  <label>
                    <input
                      type="radio"
                      name="reactionSeverity"
                      value={SEVERE_REACTION_SEVERITY_CONCEPT}
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
                  <input type="date" name="firstDateOfOnset" required />
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
                  onChange={evt => setComment(evt.target.value)}
                ></textarea>
              </div>
            </div>
          )}
          <div
            className={
              enableCreateButtons
                ? style.buttonStyles
                : `${style.buttonStyles} ${style.buttonStylesBorder}`
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

  function editForm() {
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
          <form ref={formRef} onSubmit={handleEditFormSubmit}>
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
                <h4 className={`${style.allergyHeader} omrs-bold`}>
                  Reactions
                </h4>
                <h4 className={`${style.allergyHeader} omrs-type-body-regular`}>
                  Select all that apply
                </h4>
                <div className={style.container}>
                  {allergyReaction.map((reaction, index) => (
                    <div
                      className={`omrs-checkbox ${style.inputMargin}`}
                      key={reaction.name.uuid}
                    >
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
                  <div className={`omrs-radio-button ${style.inputMargin}`}>
                    <label>
                      <input
                        type="radio"
                        name="reactionSeverity"
                        defaultValue={MILD_REACTION_SEVERITY_CONCEPT}
                        defaultChecked={
                          patientAllergy.severity.uuid ===
                          { MILD_REACTION_SEVERITY_CONCEPT }
                        }
                        onChange={evt =>
                          setReactionSeverityUuid(evt.target.value)
                        }
                      />
                      <span>Mild</span>
                    </label>
                  </div>
                  <div className={`omrs-radio-button ${style.inputMargin}`}>
                    <label>
                      <input
                        type="radio"
                        name="reactionSeverity"
                        defaultValue={MODERATE_REACTION_SEVERITY_CONCEPT}
                        defaultChecked={
                          patientAllergy.severity.uuid ===
                          MODERATE_REACTION_SEVERITY_CONCEPT
                        }
                        onChange={evt =>
                          setReactionSeverityUuid(evt.target.value)
                        }
                      />
                      <span>Moderate</span>
                    </label>
                  </div>
                  <div className={`omrs-radio-button ${style.inputMargin}`}>
                    <label>
                      <input
                        type="radio"
                        name="reactionSeverity"
                        defaultValue={SEVERE_REACTION_SEVERITY_CONCEPT}
                        defaultChecked={
                          patientAllergy.severity.uuid ===
                          SEVERE_REACTION_SEVERITY_CONCEPT
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
                enableEditButtons
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

  React.useEffect(() => {
    const params: any = props.match.params;
    if (params.allergyUuid) {
      setViewForm(true);
    } else {
      setViewForm(false);
    }
  }, [props.match.params]);
  return (
    <div className={style.allergyForm}>
      {viewForm ? editForm() : createForm()}
    </div>
  );
}

type AllergyFormProps = {
  match: match;
};

type Allergy = {
  allergenType: string;
  codedAllergenUuid: string;
  severityUuid: string;
  comment: string;
  reactionsUuid: any[];
};
