import React, { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import filter from "lodash-es/filter";
import includes from "lodash-es/includes";
import map from "lodash-es/map";
import styles from "./programs-form.css";
import SummaryCard from "../cards/summary-card.component";
import { match, useHistory } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
import { createErrorHandler } from "@openmrs/esm-framework";
import {
  createProgramEnrollment,
  fetchPrograms,
  fetchEnrolledPrograms,
  fetchLocations,
  getPatientProgramByUuid,
  getSession,
  updateProgramEnrollment,
} from "./programs.resource";
import { DataCaptureComponentProps } from "../types";

export type ProgramsFormProps = DataCaptureComponentProps & {
  match: match<ProgramMatchProps>;
  patientUuid: string;
};

// exported so we can use this for tests
export interface ProgramMatchProps {
  program?: string;
  programUuid?: string;
  enrollmentDate?: string;
  completionDate?: string;
  locationUuid?: string;
}

export interface ProgramEnrollment {
  program: string;
  patient?: string;
  dateEnrolled?: string;
  dateCompleted?: string;
  location?: string;
}

const ProgramsForm: React.FC<ProgramsFormProps> = ({
  match,
  patientUuid,
  closeComponent = () => {},
  entryCancelled = () => {},
  entryStarted = () => {},
}) => {
  const formRef = useRef<HTMLFormElement>(null);
  const enrollmentDateRef = useRef<HTMLInputElement>(null);
  const [viewEditForm, setViewEditForm] = useState(false);
  const [enableCreateButtons, setEnableCreateButtons] = useState(false);
  const [enableEditButtons, setEnableEditButtons] = useState(false);
  const [patientProgram, setPatientProgram] = useState(null);
  const [allPrograms, setAllPrograms] = useState(null);
  const [eligiblePrograms, setEligiblePrograms] = useState(null);
  const [enrolledPrograms, setEnrolledPrograms] = useState(null);
  const [location, setLocation] = useState("");
  const [program, setProgram] = useState("");
  const [enrollmentDate, setEnrollmentDate] = useState(
    dayjs(new Date()).format("YYYY-MM-DD")
  );
  const [completionDate, setCompletionDate] = useState(null);
  const [locations, setLocations] = useState(null);
  const [formChanged, setFormChanged] = useState<Boolean>(false);
  const history = useHistory();
  const { t } = useTranslation();

  useEffect(() => {
    const {
      program,
      programUuid,
      enrollmentDate,
      completionDate,
      locationUuid,
    } = match.params;

    if (program && enrollmentDate) {
      setViewEditForm(true);
      setLocation(locationUuid);
      setProgram(programUuid);
      setCompletionDate(completionDate);
      setEnrollmentDate(enrollmentDate);
    }
  }, [match.params]);

  useEffect(() => {
    if (patientUuid && !viewEditForm) {
      const abortController = new AbortController();
      getSession(abortController).then(({ data }) => {
        const { sessionLocation } = data;
        if (sessionLocation && sessionLocation.uuid) {
          setLocation(sessionLocation.uuid);
        }
      });
    }
  }, [patientUuid, viewEditForm]);

  useEffect(() => {
    if (patientUuid) {
      const sub1 = fetchLocations().subscribe((locations) => {
        return setLocations(locations);
      }, createErrorHandler());
      const sub2 = fetchPrograms().subscribe(
        (programs) => setAllPrograms(programs),
        createErrorHandler()
      );
      const sub3 = fetchEnrolledPrograms(patientUuid).subscribe(
        (enrolledPrograms) =>
          setEnrolledPrograms(
            enrolledPrograms.filter(
              (enrolledProgram) => !enrolledProgram.dateCompleted
            )
          ),
        createErrorHandler()
      );

      return () => {
        sub1.unsubscribe();
        sub2.unsubscribe();
        sub3.unsubscribe();
      };
    }
  }, [patientUuid]);

  useEffect(() => {
    if (viewEditForm && patientUuid && match.params) {
      const subscription = getPatientProgramByUuid(
        match.params["programUuid"]
      ).subscribe(
        (program) => setPatientProgram(program),
        createErrorHandler()
      );

      return () => subscription.unsubscribe();
    }
  }, [viewEditForm, patientUuid, match.params]);

  useEffect(() => {
    if (allPrograms && enrolledPrograms) {
      setEligiblePrograms(
        filter(allPrograms, (program) => {
          return !includes(map(enrolledPrograms, "program.uuid"), program.uuid);
        })
      );
    }
  }, [allPrograms, enrolledPrograms]);

  useEffect(() => {
    if (
      enrollmentDate &&
      program &&
      enrollmentDateRef?.current?.validity?.valid
    ) {
      setEnableCreateButtons(true);
    } else {
      setEnableCreateButtons(false);
    }
  }, [enrollmentDate, program]);

  useEffect(() => {
    if (viewEditForm && formChanged) {
      setEnableEditButtons(true);
    } else {
      setEnableEditButtons(false);
    }
  }, [viewEditForm, formChanged]);

  const handleCreateSubmit = ($event) => {
    $event.preventDefault();
    const enrollmentPayload: ProgramEnrollment = {
      program: program,
      patient: patientUuid,
      dateEnrolled: enrollmentDate,
      dateCompleted: completionDate,
      location: location,
    };
    const abortController = new AbortController();
    createProgramEnrollment(enrollmentPayload, abortController).subscribe(
      (response) => {
        if (response.ok) {
          match.params["setEnrolledPrograms"]([
            ...match.params["enrolledPrograms"],
            response.data,
          ]);
          navigate();
        }
      }
    );
    return () => abortController.abort();
  };

  const handleEditSubmit = ($event) => {
    $event.preventDefault();
    if (completionDate || enrollmentDate || location) {
      const updatePayload: ProgramEnrollment = {
        program: program,
        dateCompleted: completionDate,
        dateEnrolled: enrollmentDate,
        location: location,
      };
      const abortController = new AbortController();
      updateProgramEnrollment(updatePayload, abortController).subscribe(
        (response) => response.status === 200 && navigate()
      );
      return () => abortController.abort();
    }
  };

  const navigate = () => {
    history.push(`/patient/${patientUuid}/chart/programs/care-programs`);
    closeComponent();
  };

  const closeForm = ($event) => {
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

  function createProgramForm() {
    return (
      <form
        onChange={() => {
          setFormChanged(true);
          return entryStarted();
        }}
        onSubmit={handleCreateSubmit}
        className={styles.programsForm}
        ref={formRef}
      >
        <SummaryCard
          name={t("addNewProgram", "Add a new program")}
          styles={{
            width: "100%",
            backgroundColor: "var(--omrs-color-bg-medium-contrast)",
            height: "auto",
          }}
        >
          <div className={styles.programsContainerWrapper}>
            <div style={{ flex: 1, margin: "0rem 0.5rem" }}>
              <div className={styles.programsInputContainer}>
                <label htmlFor="program">
                  <Trans i18nKey="program">Program</Trans>
                </label>
                <select
                  id="program"
                  name="programs"
                  value={program}
                  onChange={(evt) => setProgram(evt.target.value)}
                  required
                >
                  <option>{t("chooseProgram", "Choose a program")}:</option>
                  {eligiblePrograms &&
                    eligiblePrograms.map((program) => (
                      <option value={program.uuid} key={program.uuid}>
                        {program.display}
                      </option>
                    ))}
                </select>
              </div>
              <div className={styles.programsInputContainer}>
                <label htmlFor="enrollmentDate">
                  <Trans i18nKey="dateEnrolled">Date enrolled</Trans>
                </label>
                <div className="omrs-datepicker">
                  <input
                    ref={enrollmentDateRef}
                    id="enrollmentDate"
                    type="date"
                    name="enrollmentDate"
                    max={dayjs(new Date().toUTCString()).format("YYYY-MM-DD")}
                    required
                    onChange={(evt) => {
                      setEnrollmentDate(evt.target.value);
                    }}
                    defaultValue={dayjs(new Date()).format("YYYY-MM-DD")}
                  />
                  <svg className="omrs-icon" role="img">
                    <use xlinkHref="#omrs-icon-calendar"></use>
                  </svg>
                </div>
                {enrollmentDateRef &&
                  !enrollmentDateRef?.current?.validity?.valid && (
                    <div className={styles.dateError}>
                      <span>
                        <svg className="omrs-icon" role="img">
                          <use xlinkHref="#omrs-icon-important-notification"></use>
                        </svg>
                        <Trans i18nKey="futureDateErrorMsg">
                          Please enter a date that is either on or before today.
                        </Trans>
                      </span>
                    </div>
                  )}
              </div>
              <div className={styles.programsInputContainer}>
                <label htmlFor="completionDate">
                  <Trans i18nKey="dateCompleted">Date completed</Trans>
                </label>
                <div className="omrs-datepicker">
                  <input
                    id="completionDate"
                    type="date"
                    name="completionDate"
                    onChange={(evt) => setCompletionDate(evt.target.value)}
                  />
                  <svg className="omrs-icon" role="img">
                    <use xlinkHref="#omrs-icon-calendar"></use>
                  </svg>
                </div>
              </div>
              <div className={styles.programsInputContainer}>
                <label htmlFor="location">
                  <Trans i18nKey="enrollmentLocation">
                    Enrollment location
                  </Trans>
                </label>
                <select
                  id="location"
                  name="locations"
                  value={location}
                  onChange={(evt) => {
                    setLocation(evt.target.value);
                  }}
                >
                  <option>{t("chooseLocation", "Choose a location")}:</option>
                  {locations &&
                    locations.map((location) => (
                      <option value={location.uuid} key={location.uuid}>
                        {location.display}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>
        </SummaryCard>
        <div
          className={
            enableCreateButtons
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
              enableCreateButtons
                ? "omrs-btn omrs-filled-action omrs-rounded"
                : "omrs-btn omrs-outlined omrs-rounded"
            }
            disabled={!enableCreateButtons}
          >
            <Trans i18nKey="enroll">Enroll</Trans>
          </button>
        </div>
      </form>
    );
  }

  function editProgramForm() {
    return (
      <>
        {patientProgram && (
          <form
            onChange={() => {
              setFormChanged(true);
              return entryStarted();
            }}
            onSubmit={handleEditSubmit}
            className={styles.programsForm}
            ref={formRef}
          >
            <SummaryCard
              name={t("editProgram", "Edit program")}
              styles={{
                width: "100%",
                backgroundColor: "var(--omrs-color-bg-medium-contrast)",
                height: "auto",
              }}
            >
              <div className={styles.programsContainerWrapper}>
                <div style={{ flex: 1, margin: "0rem 0.5rem" }}>
                  <div className={styles.programsInputContainer}>
                    <label htmlFor="program">
                      <Trans i18nKey="program">Program</Trans>
                    </label>
                    <span id="program" className="omrs-medium">
                      {patientProgram.display}
                    </span>
                  </div>
                  <div className={styles.programsInputContainer}>
                    <label htmlFor="enrollmentDate">
                      <Trans i18nKey="dateEnrolled">Date enrolled</Trans>
                    </label>
                    <div className="omrs-datepicker">
                      <input
                        id="enrollmentDate"
                        type="date"
                        name="enrollmentDate"
                        required
                        onChange={(evt) => setEnrollmentDate(evt.target.value)}
                        defaultValue={dayjs(enrollmentDate).format(
                          "YYYY-MM-DD"
                        )}
                      />
                      <svg className="omrs-icon" role="img">
                        <use xlinkHref="#omrs-icon-calendar"></use>
                      </svg>
                    </div>
                  </div>
                  <div className={styles.programsInputContainer}>
                    <label htmlFor="completionDate">
                      <Trans i18nKey="dateCompleted">Date completed</Trans>
                    </label>
                    <div className="omrs-datepicker">
                      <input
                        id="completionDate"
                        type="date"
                        name="completionDate"
                        onChange={(evt) => setCompletionDate(evt.target.value)}
                        defaultValue={
                          completionDate
                            ? dayjs(completionDate).format("YYYY-MM-DD")
                            : ""
                        }
                      />
                      <svg className="omrs-icon" role="img">
                        <use xlinkHref="#omrs-icon-calendar"></use>
                      </svg>
                    </div>
                  </div>
                  <div className={styles.programsInputContainer}>
                    <label htmlFor="location">
                      <Trans i18nKey="enrollmentLocation">
                        Enrollment location
                      </Trans>
                    </label>
                    <select
                      id="location"
                      name="locations"
                      value={location}
                      onChange={(evt) => setLocation(evt.target.value)}
                    >
                      {locations &&
                        locations.map((location) => (
                          <option value={location.uuid} key={location.uuid}>
                            {location.display}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            </SummaryCard>
            <div
              className={
                enableEditButtons
                  ? styles.buttonStyles
                  : `${styles.buttonStyles} ${styles.buttonStylesBorder}`
              }
            >
              <button
                type="submit"
                style={{ width: "50%" }}
                className={
                  enableEditButtons
                    ? "omrs-btn omrs-filled-action omrs-rounded"
                    : "omrs-btn omrs-outlined omrs-rounded"
                }
                disabled={!enableEditButtons}
              >
                <Trans i18nKey="save">Save</Trans>
              </button>
              <button
                type="button"
                className="omrs-btn omrs-outlined-neutral omrs-rounded"
                style={{ width: "50%" }}
                onClick={closeForm}
              >
                <Trans i18nKey="cancel">Cancel</Trans>
              </button>
            </div>
          </form>
        )}
      </>
    );
  }

  return <div>{viewEditForm ? editProgramForm() : createProgramForm()}</div>;
};

export default ProgramsForm;
