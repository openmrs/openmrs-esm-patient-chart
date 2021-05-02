import React from "react";
import dayjs from "dayjs";
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
  createErrorHandler,
  showToast,
  useConfig,
} from "@openmrs/esm-framework";
import {
  convertToObsPayLoad,
  Diagnosis,
  ObsData,
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
  closeWorkspace(): void;
  patientUuid: string;
}

const VisitNotesForm: React.FC<VisitNotesFormProps> = ({
  patientUuid,
  closeWorkspace,
}) => {
  const searchTimeoutInMs = 300;
  const config = useConfig() as ConfigObject;
  const {
    clinicianEncounterRole,
    encounterNoteConceptUuid,
    encounterTypeUuid,
    formConceptUuid,
  } = config.visitNoteConfig;
  const { t } = useTranslation();
  const [clinicalNote, setClinicalNote] = React.useState("");
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
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<Array<Diagnosis>>(
    null
  );
  const [diagnosis, setDiagnosis] = React.useState<any>(null);
  const [selectedDiagnoses, setSelectedDiagnoses] = React.useState<
    Array<Diagnosis>
  >([]);
  const [visitDateTime, setVisitDateTime] = React.useState(new Date());
  const [isSubmitting, setIsSubmitting] = React.useState(false);

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
    if (currentSessionLocationUuid) {
      fetchLocationByUuid(ac, currentSessionLocationUuid).then(({ data }) =>
        setLocationUuid(data.uuid)
      );
    }
  }, [currentSessionLocationUuid, currentSessionProviderUuid]);

  const debouncedSearch = React.useMemo(
    () =>
      debounce((searchTerm) => {
        if (searchTerm) {
          const sub = fetchDiagnosisByName(searchTerm).subscribe(
            (diagnoses: Array<Diagnosis>) => setSearchResults(diagnoses),
            createErrorHandler(),
            () => setIsSearching(false)
          );
          return () => sub.unsubscribe();
        } else {
          setSearchResults(null);
        }
      }, searchTimeoutInMs),
    []
  );

  React.useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

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
    setIsSubmitting(true);
    event.preventDefault();
    let obs: Array<ObsData> = [];

    if (selectedDiagnoses.length) {
      selectedDiagnoses[0].primary = true;
    }

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
      encounterDatetime: dayjs(visitDateTime).format(),
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
      if (response.status === 201) {
        closeWorkspace();
        showToast({
          description: t("visitNoteSaved", "Visit note saved successfully"),
        });
      }
      response.status !== 201 && createErrorHandler();
      setIsSubmitting(false);
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
                labelText={t("visitDate", "Visit date")}
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
            <FormGroup
              legendText={t("searchForDiagnosis", "Search for a diagnosis")}
            >
              <Search
                id="diagnosisSearch"
                labelText={t("enterDiagnoses", "Enter diagnoses")}
                placeholder={t(
                  "diagnosisInputPlaceholder",
                  "Choose a primary diagnosis first, then secondary diagnoses"
                )}
                onChange={(event) => {
                  setIsSearching(true);
                  setDiagnosis(null);
                  setSearchTerm(event.target.value);
                }}
                value={diagnosis?.concept?.preferredName || searchTerm}
                light
              />
              {searchTerm ? (
                searchResults && searchResults.length ? (
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
                ) : isSearching ? (
                  <SearchSkeleton />
                ) : (
                  <Tile light className={styles.emptyResults}>
                    <span>
                      {t("noMatchingDiagnoses", "No diagnoses found matching")}{" "}
                      <strong>"{searchTerm}"</strong>
                    </span>
                  </Tile>
                )
              ) : null}
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
              onChange={(event) => setClinicalNote(event.currentTarget.value)}
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
                {t("addImage", "Add image")}
              </Button>
            </FormGroup>
          </Column>
        </Row>
        <Row>
          <Column>
            <Button
              kind="secondary"
              onClick={closeWorkspace}
              style={{ width: "50%" }}
            >
              {t("cancel", "Cancel")}
            </Button>
            <Button
              kind="primary"
              onClick={handleSubmit}
              style={{ width: "50%" }}
              disabled={isSubmitting}
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
