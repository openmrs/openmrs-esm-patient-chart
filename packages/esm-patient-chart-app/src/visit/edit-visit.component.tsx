import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import styles from "./edit-visit.css";
import { useTranslation } from "react-i18next";
import {
  createErrorHandler,
  getStartedVisit,
  VisitStatus,
  VisitMode,
  getVisitsForPatient,
  Visit
} from "@openmrs/esm-framework";

interface EditVisitProps {
  onVisitStarted(): void;
  onCanceled(): void;
  closeComponent(): void;
  patientUuid: string;
}

const EditVisit: React.FC<EditVisitProps> = ({
  onVisitStarted,
  closeComponent,
  onCanceled,
  patientUuid
}) => {
  const [patientVisits, setPatientVisits] = useState<Array<Visit>>([]);
  const { t } = useTranslation();

  useEffect(() => {
    if (patientUuid) {
      const abortController = new AbortController();
      getVisitsForPatient(patientUuid, abortController).subscribe(
        ({ data }) => {
          setPatientVisits(data.results);
        },
        createErrorHandler()
      );
    }
  }, [patientUuid]);

  const formatVisitDate = (inputDate: any) => {
    return dayjs(inputDate).format("DD-MMM.YYYY");
  };

  return (
    <div className={styles.editVisitContainer}>
      <table className={styles.editVisitTable}>
        <thead>
          <tr>
            <td>{t("visitStartDate", "Visit Start Date")}</td>
            <td>{t("visitType", "Visit Type")}</td>
            <td>{t("location", "Location")}</td>
            <td colSpan={3}>{t("visitEndDate", "Visit End Date")}</td>
          </tr>
        </thead>
        <tbody>
          {patientVisits &&
            patientVisits.map(visit => {
              return (
                <tr key={visit.uuid}>
                  <td>{formatVisitDate(visit.startDatetime)}</td>
                  <td>{visit.visitType.display}</td>
                  <td>{visit.location?.display}</td>
                  <td>
                    {visit.stopDatetime
                      ? formatVisitDate(visit.stopDatetime)
                      : "\u2014"}
                  </td>
                  <td>
                    <button
                      style={{ cursor: "pointer" }}
                      className={`omrs-btn omrs-outlined-action`}
                      onClick={() => {
                        onVisitStarted();
                        getStartedVisit.next({
                          mode: VisitMode.EDITVISIT,
                          visitData: visit,
                          status: VisitStatus.ONGOING
                        });
                      }}
                    >
                      {t("edit", "Edit")}
                    </button>
                  </td>
                  <td>
                    <button
                      style={{ cursor: "pointer" }}
                      className={`omrs-btn omrs-outlined-action`}
                      onClick={() => {
                        getStartedVisit.next({
                          mode: VisitMode.LOADING,
                          visitData: visit,
                          status: VisitStatus.ONGOING
                        });
                        closeComponent();
                      }}
                    >
                      {t("load", "Load")}
                    </button>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
      <div className={styles.cancelButtonContainer}>
        <button
          style={{
            cursor: "pointer",
            width: "25%",
            borderRadius: "1.5rem"
          }}
          className={`omrs-btn omrs-outlined-action`}
          onClick={onCanceled}
        >
          {t("cancel", "Cancel")}
        </button>
      </div>
    </div>
  );
};

export default EditVisit;
