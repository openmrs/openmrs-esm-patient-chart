import React from "react";
import debounce from "lodash-es/debounce";
import styles from "./visit-notes-form.scss";
import Button from "carbon-components-react/es/components/Button";
import DatePicker from "carbon-components-react/es/components/DatePicker";
import DatePickerInput from "carbon-components-react/es/components/DatePickerInput";
import Form from "carbon-components-react/es/components/Form";
import FormGroup from "carbon-components-react/es/components/FormGroup";
import Search from "carbon-components-react/es/components/Search";
import SearchSkeleton from "carbon-components-react/es/components/Search/Search.Skeleton";
import Tag from "carbon-components-react/es/components/Tag";
import TextArea from "carbon-components-react/es/components/TextArea";
import { Tile } from "carbon-components-react/es/components/Tile";
import { useTranslation } from "react-i18next";
import { Column, Grid, Row } from "carbon-components-react/es/components/Grid";
import {
  switchTo,
  createErrorHandler,
  useCurrentPatient,
  useConfig,
} from "@openmrs/esm-framework";
import {
  convertToObsPayLoad,
  obs,
  Diagnosis,
  VisitNotePayload,
} from "./visit-note.util";
import {
  fetchCurrentSessionData,
  fetchDiagnosisByName,
  fetchLocationByUuid,
  fetchProviderByUuid,
  saveVisitNote,
} from "./visit-notes.resource";
import { ConfigObject } from "../config-schema";

interface VisitNotesFormProps {
  closeWorkspace?: () => void;
}

const VisitNotesForm: React.FC<VisitNotesFormProps> = ({ closeWorkspace }) => {
  const searchTimeoutInMs = 300;
  const config = useConfig() as ConfigObject;
  const {
    clinicianEncounterRole,
    encounterNoteConceptUuid,
    encounterTypeUuid,
    formConceptUuid,
  } = config.visitNoteConfig;
  const { t } = useTranslation();
  const [, , patientUuid] = useCurrentPatient();

  const [clinicalNote, setClinicalNote] = React.useState("");
  const [error, setError] = React.useState(null);
  const [
    currentSessionProviderUuid,
    setCurrentSessionProviderUuid,
  ] = React.useState<string | null>("");
  const [
    currentSessionLocationUuid,
    setCurrentSessionLocationUuid,
  ] = React.useState("");
  const [locationUuid, setLocationUuid] = React.useState<string | null>(null);
  const [providerUuid, setProviderUuid] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<Array<Diagnosis>>(
    null
  );
  const [selectedDiagnoses, setSelectedDiagnoses] = React.useState<
    Array<Diagnosis>
  >([]);
  const [visitDateTime, setVisitDateTime] = React.useState(new Date());
  const searchInputRef = React.useRef(null);

  closeWorkspace = closeWorkspace ?? (() => switchTo("workspace", ""));

  React.useEffect(() => {
    if (searchTerm) {
      const sub = fetchDiagnosisByName(searchTerm).subscribe(
        (results) => setSearchResults(results),
        (error) => {
          setError(error);
          createErrorHandler();
        }
      );
      return () => sub.unsubscribe();
    } else {
      setSearchResults(null);
    }
  }, [searchTerm]);

  React.useEffect(() => {
    const ac = new AbortController();
    fetchCurrentSessionData(ac).then(({ data }) => {
      const { currentProvider, sessionLocation } = data;
      if (currentProvider.uuid) {
        setCurrentSessionProviderUuid(currentProvider.uuid);
      }
      if (sessionLocation.uuid) {
        setCurrentSessionLocationUuid(sessionLocation.uuid);
      }
    });
    return () => ac.abort();
  }, []);

  React.useEffect(() => {
    const ac = new AbortController();
    if (currentSessionProviderUuid) {
      fetchProviderByUuid(ac, currentSessionProviderUuid).then(({ data }) => {
        setProviderUuid(data.uuid);
      });
    }
  }, [currentSessionProviderUuid]);

  React.useEffect(() => {
    const ac = new AbortController();
    if (currentSessionLocationUuid) {
      fetchLocationByUuid(ac, currentSessionLocationUuid).then(({ data }) =>
        setLocationUuid(data.uuid)
      );
    }
  }, [currentSessionLocationUuid]);

  const handleCancel = () => {
    closeWorkspace();
  };

  const handleSearchTermChange = debounce((searchTerm) => {
    setSearchTerm(searchTerm);
  }, searchTimeoutInMs);

  const resetSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleAddDiagnosis = (diagnosisToAdd: Diagnosis) => {
    resetSearch();
    setSelectedDiagnoses((selectedDiagnoses) => [
      ...selectedDiagnoses,
      diagnosisToAdd,
    ]);
  };

  const handleRemoveDiagnosis = (diagnosisToRemove: Diagnosis) => {
    setSelectedDiagnoses(
      selectedDiagnoses.filter(
        (diagnosis) => diagnosis.concept.id !== diagnosisToRemove.concept.id
      )
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    let obs: Array<obs> = [];
    obs = convertToObsPayLoad(selectedDiagnoses);
    if (clinicalNote) {
      obs = [
        {
          concept: encounterNoteConceptUuid,
          value: clinicalNote,
        },
        ...obs,
      ];
    }

    let visitNotePayload: VisitNotePayload = {
      encounterDatetime: visitDateTime,
      patient: patientUuid,
      location: locationUuid,
      encounterProviders: [
        {
          encounterRole: clinicianEncounterRole,
          provider: providerUuid,
        },
      ],
      encounterType: encounterTypeUuid,
      form: formConceptUuid,
      obs: obs,
    };
    const ac = new AbortController();
    saveVisitNote(ac, visitNotePayload).then((response) => {
      response.status === 201 && closeWorkspace();
      response.status !== 201 && createErrorHandler();
    });
    return () => ac.abort();
  };

  return (
    <Form className={styles.visitNoteForm}>
      <h2 className={styles.heading}>
        {t("addVisitNote", "Add a Visit Note")}
      </h2>
      <Grid style={{ margin: 0, padding: "0 1rem" }}>
        <Row style={{ marginTop: "0.5rem", marginBottom: "2.75rem" }}>
          <Column sm={1}>
            <span className={styles.columnLabel}>{t("date", "Date")}</span>
          </Column>
          <Column sm={3}>
            <DatePicker
              dateFormat="d/m/Y"
              datePickerType="single"
              light
              maxDate={new Date().toISOString()}
              value={visitDateTime}
              onChange={([date]) => setVisitDateTime(date)}
            >
              <DatePickerInput
                id="visitDateTimePicker"
                labelText={t("visitDate", "Visit Date")}
                placeholder="dd/mm/yyyy"
              />
            </DatePicker>
          </Column>
        </Row>
        <Row style={{ marginTop: "0.5rem", marginBottom: "2.75rem" }}>
          <Column sm={1}>
            <span className={styles.columnLabel}>
              {t("diagnosis", "Diagnosis")}
            </span>
          </Column>
          <Column sm={3}>
            <div
              className={styles.diagnosesText}
              style={{ marginBottom: "1.188rem" }}
            >
              {selectedDiagnoses && selectedDiagnoses.length ? (
                <>
                  {selectedDiagnoses.map((diagnosis, index) => (
                    <Tag
                      filter
                      key={index}
                      onClose={() => handleRemoveDiagnosis(diagnosis)}
                      style={{ marginRight: "0.5rem" }}
                      type={index === 0 ? "red" : "blue"}
                    >
                      {diagnosis.concept.preferredName}
                    </Tag>
                  ))}
                </>
              ) : (
                <span>
                  {t(
                    "emptyDiagnosisText",
                    "No diagnosis selected — Enter a diagnosis below"
                  )}
                </span>
              )}
            </div>
            <FormGroup legendText="Search for a diagnosis">
              <Search
                id="diagnosisSearch"
                light
                labelText={t("enterDiagnoses", "Enter diagnoses")}
                placeholder={t(
                  "diagnosisInputPlaceholder",
                  "Choose primary diagnosis first, then secondary diagnoses"
                )}
                onChange={(e) =>
                  handleSearchTermChange(e.currentTarget.value ?? "")
                }
                ref={searchInputRef}
              />
              {searchTerm &&
                (searchResults ? (
                  searchResults.length ? (
                    <ul className={styles.diagnosisList}>
                      {searchResults.map((diagnosis, index) => (
                        <li
                          role="menuitem"
                          className={styles.diagnosis}
                          key={index}
                          onClick={() => handleAddDiagnosis(diagnosis)}
                        >
                          {diagnosis.concept.preferredName}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <Tile light className={styles.emptyResultsText}>
                      <span>
                        {t(
                          "noMatchingDiagnosesText",
                          "No matching diagnoses have been found"
                        )}
                      </span>
                    </Tile>
                  )
                ) : (
                  <SearchSkeleton />
                ))}
            </FormGroup>
          </Column>
        </Row>
        <Row style={{ marginTop: "0.5rem", marginBottom: "2.75rem" }}>
          <Column sm={1}>
            <span className={styles.columnLabel}>{t("note", "Note")}</span>
          </Column>
          <Column sm={3}>
            <TextArea
              id="additionalNote"
              light
              labelText={t("clinicalNoteLabel", "Write an additional note")}
              placeholder={t(
                "clinicalNotePlaceholder",
                "Write any additional points here"
              )}
              onChange={(e) => setClinicalNote(e.currentTarget.value)}
            />
          </Column>
        </Row>
        <Row style={{ marginTop: "0.5rem", marginBottom: "2.75rem" }}>
          <Column sm={1}>
            <span className={styles.columnLabel}>{t("image", "Image")}</span>
          </Column>
          <Column sm={3}>
            <FormGroup
              legendText={t("addImageToVisit", "Add an image to this visit")}
            >
              <p className={styles.imgUploadHelperText}>
                {t(
                  "imageUploadHelperText",
                  "Upload an image or use this device's camera to capture an image"
                )}
              </p>
              <Button
                style={{ marginTop: "1rem" }}
                kind="tertiary"
                onClick={() => {}}
              >
                {t("addVisitImage", "Add Image")}
              </Button>
            </FormGroup>
          </Column>
        </Row>
        <Row>
          <Column>
            <Button
              kind="secondary"
              onClick={handleCancel}
              style={{ width: "50%" }}
            >
              {t("cancel", "Cancel")}
            </Button>
            <Button
              kind="primary"
              onClick={handleSubmit}
              style={{ width: "50%" }}
              type="submit"
            >
              {t("saveAndClose", "Save & Close")}
            </Button>
          </Column>
        </Row>
      </Grid>
    </Form>
  );
};

export default VisitNotesForm;
