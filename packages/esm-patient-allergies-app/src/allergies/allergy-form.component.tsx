import React, { useEffect, useState, useRef, SyntheticEvent } from "react";
import dayjs from "dayjs";
import capitalize from "lodash-es/capitalize";
import { SummaryCard } from "@openmrs/esm-patient-common-lib";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  getAllergyAllergenByConceptUuid,
  getAllergicReactions,
  savePatientAllergy,
  deletePatientAllergy,
  getPatientAllergyByPatientUuid,
  updatePatientAllergy,
  fetchAllergyByUuid,
  Allergy,
} from "./allergy-intolerance.resource";
import { createErrorHandler, showToast } from "@openmrs/esm-framework";
import Button from "carbon-components-react/es/components/Button";
import Checkbox from "carbon-components-react/es/components/Checkbox";
import DatePicker from "carbon-components-react/es/components/DatePicker";
import DatePickerInput from "carbon-components-react/es/components/DatePickerInput";
import RadioButton from "carbon-components-react/es/components/RadioButton";
import RadioButtonGroup from "carbon-components-react/es/components/RadioButtonGroup";
import TextArea from "carbon-components-react/es/components/TextArea";
import {
  AllergyData,
  AllergicReaction,
  Allergen,
  DataCaptureComponentProps,
} from "../types";
import styles from "./allergy-form.css";

enum AllergyConcept {
  DRUG_ALLERGEN = "162552AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  ENVIRONMENTAL_ALLERGEN = "162554AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  FOOD_ALLERGEN = "162553AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  MILD_REACTION_SEVERITY = "1498AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  MODERATE_REACTION_SEVERITY = "1499AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  SEVERE_REACTION_SEVERITY = "1500AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
}

function getAllergyType(allergyConcept: string): string {
  switch (allergyConcept) {
    case AllergyConcept.DRUG_ALLERGEN:
      return "DRUG";
    case AllergyConcept.FOOD_ALLERGEN:
      return "FOOD";
    case AllergyConcept.ENVIRONMENTAL_ALLERGEN:
      return "ENVIRONMENT";
    default:
      "NO ALLERGEN";
  }
}

interface AllergyFormProps extends DataCaptureComponentProps {
  match: {
    params: {
      allergyUuid: string;
      setAllergies(allergies: Array<Allergy>): void;
      allergies: Array<Allergy>;
    };
  };
  patientUuid: string;
}

interface PatientAllergy {
  allergenType: string;
  codedAllergenUuid: string;
  severityUuid: string;
  comment: string;
  reactionUuids: Array<SelectedAllergicReaction>;
}

interface SelectedAllergicReaction {
  display?: string;
  uuid: string;
}

const AllergyForm: React.FC<AllergyFormProps> = ({
  match,
  patientUuid,
  entryStarted = () => {},
  entryCancelled = () => {},
  closeComponent = () => {},
}) => {
  const formRef = useRef<HTMLFormElement>(null);
  const createFormOnsetDateRef = useRef<HTMLInputElement>(null);
  const editFormOnsetDateRef = useRef<HTMLInputElement>(null);
  const [isEditFormActive, setIsEditFormActive] = useState(false);
  const [patientAllergy, setPatientAllergy] = useState<AllergyData>(null);
  const [allergicReactions, setAllergicReactions] = useState<
    Array<AllergicReaction>
  >([]);
  const [selectedAllergicReactions, setSelectedAllergicReactions] = useState<
    Array<SelectedAllergicReaction>
  >([]);
  const [codedAllergenUuid, setCodedAllergenUuid] = useState<string>(null);
  const [allergenType, setAllergenType] = useState("");
  const [allergensArray, setAllergensArray] = useState<Array<Allergen>>(null);
  const [firstOnsetDate, setFirstOnsetDate] = useState<string>(null);
  const [enableCreateButtons, setEnableCreateButtons] = useState(true);
  const [enableEditButtons, setEnableEditButtons] = useState(true);
  const [comment, setComment] = useState("");
  const [
    selectedAllergyCategory,
    setSelectedAllergyCategory,
  ] = useState<string>(null);
  const [reactionSeverityUuid, setReactionSeverityUuid] = useState<string>(
    null
  );
  const [allergyComment, setAllergyComment] = useState<string>(null);
  const [updatedOnsetDate, setUpdatedOnsetDate] = useState<string>(null);
  const [formChanged, setFormChanged] = useState(false);
  const history = useHistory();
  const { t } = useTranslation();

  useEffect(() => {
    if (match.params.allergyUuid) {
      setIsEditFormActive(true);
    }
  }, [match.params]);

  useEffect(() => {
    const abortController = new AbortController();
    if (patientUuid && isEditFormActive) {
      getPatientAllergyByPatientUuid(patientUuid, match.params, abortController)
        .then((response) => setPatientAllergy(response.data))
        .catch(createErrorHandler());

      return () => abortController.abort();
    }
  }, [patientUuid, isEditFormActive, match.params]);

  useEffect(() => {
    if (isEditFormActive && patientAllergy) {
      setAllergyComment(patientAllergy.comment);
      setReactionSeverityUuid(patientAllergy.severity.uuid);
      setUpdatedOnsetDate(patientAllergy.auditInfo.dateCreated);
      setSelectedAllergicReactions(
        patientAllergy.reactions?.map((reaction) => {
          return {
            display: reaction.reaction.display,
            uuid: reaction.reaction.uuid,
          };
        })
      );
    }
  }, [isEditFormActive, patientAllergy]);

  useEffect(() => {
    if (isEditFormActive) {
      const getAllergicReactionsSub = getAllergicReactions().subscribe(
        (allergicReactions: Array<AllergicReaction>) =>
          setAllergicReactions(allergicReactions),
        createErrorHandler()
      );
      return () => {
        getAllergicReactionsSub.unsubscribe();
      };
    }
  }, [isEditFormActive]);

  useEffect(() => {
    // allergenType is a required field in the Create form
    if (!isEditFormActive && allergenType) {
      setEnableCreateButtons(true);
    } else {
      setEnableCreateButtons(false);
    }
  }, [isEditFormActive, allergenType]);

  useEffect(() => {
    if (firstOnsetDate && createFormOnsetDateRef.current?.validity?.valid) {
      setEnableCreateButtons(true);
    } else {
      setEnableCreateButtons(false);
    }
  }, [firstOnsetDate]);

  useEffect(() => {
    if (isEditFormActive && formChanged) {
      setEnableEditButtons(true);
    } else {
      setEnableEditButtons(false);
    }
  }, [isEditFormActive, updatedOnsetDate, formChanged]);

  useEffect(() => {
    if (editFormOnsetDateRef.current?.validity?.valid) {
      setEnableEditButtons(true);
    } else {
      setEnableEditButtons(false);
    }
  }, [updatedOnsetDate]);

  useEffect(() => {
    if (selectedAllergyCategory && !isEditFormActive) {
      const getAllergensSub = getAllergyAllergenByConceptUuid(
        selectedAllergyCategory
      ).subscribe((data) => setAllergensArray(data), createErrorHandler());
      const getAllergicReactionsSub = getAllergicReactions().subscribe(
        (data) => setAllergicReactions(data),
        createErrorHandler()
      );
      return () => {
        getAllergensSub.unsubscribe();
        getAllergicReactionsSub.unsubscribe();
      };
    }
  }, [selectedAllergyCategory, isEditFormActive]);

  const handleAllergicReactionChange = (
    checked: boolean,
    id: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const eventTarget = event.currentTarget;
    setSelectedAllergicReactions(
      (reactions: Array<SelectedAllergicReaction>) => {
        if (checked === true) {
          reactions.push({ uuid: eventTarget.value });
          return reactions;
        } else {
          return reactions.filter(
            (reaction) => reaction.uuid !== eventTarget.value
          );
        }
      }
    );
  };

  const handleCreateFormSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const patientAllergy: PatientAllergy = {
      allergenType: allergenType,
      codedAllergenUuid: codedAllergenUuid,
      severityUuid: reactionSeverityUuid,
      comment: comment,
      reactionUuids: selectedAllergicReactions,
    };
    const abortController = new AbortController();
    savePatientAllergy(patientAllergy, patientUuid, abortController)
      .then((response) => {
        if (response.status === 201) {
          showToast({
            description: t(
              "allergySuccessfullyAdded",
              "Allergy has been added successfully"
            ),
          });
          fetchAllergyByUuid(response.data.uuid).subscribe((allergy) => {
            match.params.setAllergies([...match.params.allergies, allergy]);
            navigate();
          }, createErrorHandler());
        }
      })
      .catch(createErrorHandler());
    return () => abortController.abort();
  };

  const handleEditFormSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const allergy: PatientAllergy = {
      allergenType: patientAllergy?.allergen?.allergenType,
      codedAllergenUuid: patientAllergy?.allergen?.codedAllergen?.uuid,
      severityUuid: reactionSeverityUuid,
      comment: allergyComment,
      reactionUuids: selectedAllergicReactions,
    };
    const abortController = new AbortController();
    updatePatientAllergy(
      allergy,
      patientUuid,
      match.params,
      abortController
    ).then((response) => {
      response.status === 200 && navigate();
    }, createErrorHandler);
    return () => abortController.abort();
  };

  function navigate() {
    history.push(`/patient/${patientUuid}/chart/allergies`);
    closeComponent();
  }

  const allergyHasReaction = (uuid: string) => {
    return patientAllergy?.reactions?.some(
      (reaction) => reaction?.reaction?.uuid === uuid
    );
  };

  const handleDeletePatientAllergy = () => {
    const abortController = new AbortController();
    deletePatientAllergy(patientUuid, match.params, abortController).then(
      (response) => {
        response.status === 204 && navigate();
      }
    );
  };

  const handleAllergenChange = (event) => {
    setAllergensArray(null);
    setAllergenType(getAllergyType(event));
    setSelectedAllergyCategory(event);
  };

  const closeForm = () => {
    formRef.current.reset();
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

  function createAllergy() {
    return (
      <SummaryCard
        name={t("recordNewAllergy", "Record a new allergy")}
        styles={{
          width: "100%",
          background: "var(--omrs-color-bg-medium-contrast)",
        }}
      >
        <form
          ref={formRef}
          onSubmit={handleCreateFormSubmit}
          onChange={() => {
            setFormChanged(true);
            return entryStarted();
          }}
        >
          <h4 className={`${styles.allergyHeader}`}>
            {t("reactionCategory", "Category of reaction")}
          </h4>
          <div className={`${styles.container}`}>
            <RadioButtonGroup
              labelPosition="right"
              orientation="vertical"
              name="categoryOfReaction"
              onChange={handleAllergenChange}
            >
              <RadioButton
                labelText={t("drug", "Drug")}
                value={AllergyConcept.DRUG_ALLERGEN}
              />
              <RadioButton
                labelText={t("food", "Food")}
                value={AllergyConcept.FOOD_ALLERGEN}
              />
              <RadioButton
                labelText={t("environmental", "Environmental")}
                value={AllergyConcept.ENVIRONMENTAL_ALLERGEN}
              />
              <RadioButton
                id="no-allergies"
                labelText={t(
                  "noKnownAllergies",
                  "Patient has no known allergies"
                )}
                value="noAllergy"
              />
            </RadioButtonGroup>
          </div>
          {allergensArray && (
            <div>
              <h4 className={`${styles.allergyHeader}`}>
                {capitalize(
                  getAllergyType(selectedAllergyCategory)?.toLowerCase()
                )}{" "}
                {t("allergen", "Allergen")}
              </h4>
              <div className={styles.container}>
                <RadioButtonGroup
                  labelPosition="right"
                  orientation="vertical"
                  name="allergen"
                  onChange={(evt) => setCodedAllergenUuid(evt.toString())}
                >
                  {allergensArray.map((allergen, index) => (
                    <RadioButton
                      key={index}
                      id={allergen?.uuid}
                      labelText={allergen?.name?.display}
                      value={allergen?.uuid}
                    />
                  ))}
                </RadioButtonGroup>
              </div>
            </div>
          )}
          {allergensArray && allergicReactions && (
            <div>
              <h4 className={`${styles.allergyHeader}`}>
                {t("reactions", "Reactions")}
              </h4>
              <h4 className={`${styles.allergyHeader} omrs-type-body-regular`}>
                {t("selectAllApplicable", "Select all that apply")}
              </h4>
              <div className={styles.container}>
                {allergicReactions.map((reaction, index) => (
                  <Checkbox
                    key={index}
                    value={reaction?.uuid}
                    labelText={reaction?.name?.display}
                    id={reaction?.uuid}
                    onChange={handleAllergicReactionChange}
                  />
                ))}
              </div>
            </div>
          )}
          {allergensArray && (
            <div>
              <h4 className={`${styles.allergyHeader}`}>
                {t("severityOfWorstReaction", "Severity of worst reaction")}
              </h4>
              <div className={styles.container}>
                <RadioButtonGroup
                  labelPosition="right"
                  orientation="vertical"
                  name="reactionSeverity"
                  onChange={(evt) => setReactionSeverityUuid(evt.toString())}
                >
                  <RadioButton
                    id="mild"
                    labelText={t("mild", "Mild")}
                    value={AllergyConcept.MILD_REACTION_SEVERITY}
                  />
                  <RadioButton
                    id="moderate"
                    labelText={t("moderate", "Moderate")}
                    value={AllergyConcept.MODERATE_REACTION_SEVERITY}
                  />
                  <RadioButton
                    id="severe"
                    labelText={t("severe", "Severe")}
                    value={AllergyConcept.SEVERE_REACTION_SEVERITY}
                  />
                </RadioButtonGroup>
              </div>
              <h4 className={`${styles.allergyHeader}`}>
                <label htmlFor="first-onset-date">
                  {t("firstOnsetDate", "Date of first onset")}
                </label>
              </h4>
              <div className={styles.dateContainer}>
                <DatePicker
                  dateFormat="m/d/Y"
                  datePickerType="single"
                  maxDate={new Date().toUTCString()}
                >
                  <DatePickerInput
                    id="date-picker-calendar-id"
                    placeholder="mm/dd/yyyy"
                    type="text"
                    labelText=""
                    onChange={(evt) => setFirstOnsetDate(evt.target.value)}
                  />
                </DatePicker>
              </div>
              <h4 className={`${styles.allergyHeader}`}>
                {t("comments", "Comments")}
              </h4>
              <div className={styles.allergyCommentContainer}>
                <TextArea
                  id="comment"
                  invalidText="A valid value is required"
                  labelText=""
                  rows={6}
                  onChange={(evt) => setComment(evt.target.value)}
                />
              </div>
            </div>
          )}
          <div
            className={
              enableCreateButtons
                ? styles.buttonStyles
                : `${styles.buttonStyles} ${styles.buttonStylesBorder}`
            }
            style={{ position: "sticky" }}
          >
            <Button onClick={closeForm} kind="secondary">
              {t("cancel", "Cancel")}
            </Button>
            <Button
              type="submit"
              disabled={!enableCreateButtons}
              kind="primary"
            >
              {t("signAndSave", "Sign & Save")}
            </Button>
          </div>
        </form>
      </SummaryCard>
    );
  }

  function editAllergy() {
    return (
      <SummaryCard
        name={t("editExistingAllergy", "Edit existing allergy")}
        styles={{
          width: "100%",
          background: "var(--omrs-color-bg-medium-contrast)",
        }}
      >
        {patientAllergy && allergicReactions?.length && (
          <form
            ref={formRef}
            onSubmit={handleEditFormSubmit}
            onChange={() => {
              setFormChanged(true);
              return entryStarted();
            }}
          >
            <div>
              <div
                className={`${styles.allergyEditHeader} omrs-padding-bottom-28`}
              >
                <h4>{t("allergen", "Allergen")}</h4>
                <h3>
                  {patientAllergy?.allergen?.codedAllergen?.display}{" "}
                  <span>
                    ({patientAllergy?.allergen?.allergenType?.toLowerCase()})
                  </span>
                </h3>
              </div>
              <div>
                <h4 className={`${styles.allergyHeader}`}>
                  {t("reactions", "Reactions")}
                </h4>
                <h4 className={`${styles.allergyHeader}`}>
                  {t("selectAllThatApply", "Select all that apply")}
                </h4>
                <div className={styles.container}>
                  {allergicReactions.map((reaction, index) => (
                    <Checkbox
                      key={index}
                      id={reaction.uuid}
                      labelText={reaction?.display}
                      defaultValue={reaction?.uuid}
                      defaultChecked={allergyHasReaction(reaction?.uuid)}
                      onChange={handleAllergicReactionChange}
                    />
                  ))}
                </div>
              </div>
              <div>
                <h4 className={`${styles.allergyHeader}`}>
                  {t("severityOfWorstReaction", "Severity of worst reaction")}
                </h4>
                <div className={styles.container}>
                  <RadioButtonGroup
                    labelPosition="right"
                    orientation="vertical"
                    name="reactionSeverity"
                    onChange={(evt) => setReactionSeverityUuid(evt.toString())}
                    valueSelected={patientAllergy?.severity?.uuid}
                  >
                    <RadioButton
                      id="mild"
                      labelText={t("mild", "Mild")}
                      value={AllergyConcept.MILD_REACTION_SEVERITY}
                    />
                    <RadioButton
                      id="moderate"
                      labelText={t("moderate", "Moderate")}
                      value={AllergyConcept.MODERATE_REACTION_SEVERITY}
                    />
                    <RadioButton
                      id="severe"
                      labelText={t("severe", "Severe")}
                      value={AllergyConcept.SEVERE_REACTION_SEVERITY}
                    />
                  </RadioButtonGroup>
                </div>
                <h4 className={`${styles.allergyHeader}`}>
                  <label htmlFor="first-onset-date">
                    {t("firstOnsetDate", "Date of first onset")}
                  </label>
                </h4>
                <div className={styles.dateContainer}>
                  <DatePicker dateFormat="m/d/Y" datePickerType="single">
                    <DatePickerInput
                      id="date-picker-calendar-id"
                      placeholder="mm/dd/yyyy"
                      type="text"
                      defaultValue={dayjs(
                        patientAllergy?.auditInfo?.dateCreated
                      ).format("MM/DD/YYYY")}
                      labelText={t("firstOnsetDate", "Date of first onset")}
                      hideLabel={true}
                      onChange={(evt) => setUpdatedOnsetDate(evt.target.value)}
                      max={new Date().toUTCString()}
                    />
                  </DatePicker>
                </div>
                <h4 className={`${styles.allergyHeader}`}>
                  {t("comments", "Comments")}
                </h4>
                <div className={styles.allergyCommentContainer}>
                  <TextArea
                    hideLabel={true}
                    labelText={t("comments", "Comments")}
                    id="comments"
                    defaultValue={patientAllergy?.comment}
                    rows={6}
                    name="comments"
                    onChange={(evt) => setAllergyComment(evt.target.value)}
                  />
                </div>
              </div>
            </div>
            <div
              className={
                enableEditButtons
                  ? styles.buttonStyles
                  : `${styles.buttonStyles} ${styles.buttonStylesBorder}`
              }
            >
              <Button
                onClick={handleDeletePatientAllergy}
                kind="danger"
                style={{ width: "20%" }}
              >
                {t("delete", "Delete")}
              </Button>
              <Button
                onClick={closeForm}
                kind="secondary"
                style={{ width: "30%" }}
              >
                {t("cancel", "Cancel")}
              </Button>
              <Button
                type="submit"
                kind="primary"
                disabled={!enableEditButtons}
                style={{ width: "50%" }}
              >
                {t("signAndSave", "Sign & Save")}
              </Button>
            </div>
          </form>
        )}
      </SummaryCard>
    );
  }

  return (
    <div className={styles.allergyForm}>
      {isEditFormActive ? editAllergy() : createAllergy()}
    </div>
  );
};

export default AllergyForm;
