import React, { DetailedHTMLProps } from "react";
import { match } from "react-router";
import SummaryCard from "../cards/summary-card.component";
import style from "./allergy-form.css";
import {
  getAllergyAllergenByConceptUuid,
  getAllergyReaction,
  savePatientAllergy
} from "./allergy-intolerance.resource";
import { createErrorHandler } from "@openmrs/esm-error-handling";
import { useCurrentPatient } from "@openmrs/esm-api";

const DRUG_ALLERGEN_CONCEPT: string = "162552AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const ENVIROMENTAL_ALLERGEN_CONCEPT: string =
  "162554AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const FOOD_ALLERGEN_CONCEPT: string = "162553AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

export function AllergyCreateForm(props: AllergyCreateFormProps) {
  const [codedAllergenUuid, setCodedAllergenUuid] = React.useState(null);
  const [allergenType, setAllergenType] = React.useState(null);
  const [allergensArray, setAllergensArray] = React.useState(null);
  const [allergyReaction, setAllergyReaction] = React.useState();
  const [enableButtons, setEnableButtons] = React.useState(true);
  const [patientAlleryReaction, setPatientAllergyReaction] = React.useState([]);
  const [comment, setComment] = React.useState("");
  const [selectedAllergyCategory, setSelectedAllergyCategory] = React.useState(
    null
  );
  const [reactionSeverityUuid, SetReactionSeverityUuid] = React.useState(null);
  const [
    isLoadingPatient,
    patient,
    patientUuid,
    patientErr
  ] = useCurrentPatient();
  const formRef = React.useRef<HTMLFormElement>(null);

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
      setEnableButtons(false);
    } else {
      setEnableButtons(true);
    }
  }, [
    comment,
    allergenType,
    codedAllergenUuid,
    patientAlleryReaction,
    reactionSeverityUuid
  ]);

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

  const handleSubmit = event => {
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

  return (
    <SummaryCard
      name="Add Allergy"
      match={props.match}
      styles={{
        width: "95%",
        background: "var(--omrs-color-bg-medium-contrast)"
      }}
    >
      <form onSubmit={handleSubmit} ref={formRef}>
        <h4 className={`${style.allergyHeader} omrs-bold`}>
          Category of reaction
        </h4>
        <div className={`${style.container}`}>
          <div className="omrs-radio-button">
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
          <div className="omrs-radio-button">
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
          <div className="omrs-radio-button">
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
          <div className="omrs-radio-button">
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
                <div className="omrs-radio-button" key={allergen.name.uuid}>
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
                <div className="omrs-checkbox" key={reaction.name.uuid}>
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
              <div className="omrs-radio-button">
                <label>
                  <input
                    type="radio"
                    name="reactionSeverity"
                    value="1498AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
                    onChange={evt => SetReactionSeverityUuid(evt.target.value)}
                  />
                  <span>Mild</span>
                </label>
              </div>
              <div className="omrs-radio-button">
                <label>
                  <input
                    type="radio"
                    name="reactionSeverity"
                    value="1499AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
                    onChange={evt => SetReactionSeverityUuid(evt.target.value)}
                  />
                  <span>Moderate</span>
                </label>
              </div>
              <div className="omrs-radio-button">
                <label>
                  <input
                    type="radio"
                    name="reactionSeverity"
                    value="1500AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
                    onChange={evt => SetReactionSeverityUuid(evt.target.value)}
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
            enableButtons
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
              enableButtons
                ? "omrs-btn omrs-outlined omrs-rounded"
                : "omrs-btn omrs-filled-action omrs-rounded"
            }
            disabled={enableButtons}
            style={{ width: "50%" }}
          >
            Sign & Save
          </button>
        </div>
      </form>
    </SummaryCard>
  );
}

type AllergyCreateFormProps = {
  match: match;
};

type Allergy = {
  allergenType: string;
  codedAllergenUuid: string;
  severityUuid: string;
  comment: string;
  reactionsUuid: any[];
};
