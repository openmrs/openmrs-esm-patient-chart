import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import isEmpty from "lodash-es/isEmpty";
import VisitDashboard from "./visit-dashboard.component";
import styles from "./visit-button.css";
import { useTranslation } from "react-i18next";
import {
  newWorkspaceItem,
  FetchResponse,
  getStartedVisit,
  VisitItem,
  VisitMode,
  VisitStatus,
  updateVisit,
  UpdateVisitPayload,
  getVisitsForPatient,
  Visit
} from "@openmrs/esm-framework";

export function openVisitDashboard(componentName: string) {
  newWorkspaceItem({
    component: VisitDashboard,
    name: componentName,
    props: {},
    inProgress: false,
    validations: workspaceTabs =>
      workspaceTabs.findIndex(tab => tab.component === VisitDashboard)
  });
}

interface NewModalItem {
  (item: { component: React.ReactNode; name: any; props: any }): void;
}

interface VisitProps {
  patientUuid: string;
  newModalItem: NewModalItem;
}

const VisitButton: React.FC<VisitProps> = ({ newModalItem, patientUuid }) => {
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [, setVisitStarted] = useState<boolean>();

  useEffect(() => {
    const sub = getStartedVisit.subscribe((visit: VisitItem) => {
      setSelectedVisit(visit);
    });
    return () => sub && sub.unsubscribe();
  }, [selectedVisit]);

  useEffect(() => {
    if (patientUuid) {
      const abortController = new AbortController();
      const sub = getVisitsForPatient(patientUuid, abortController).subscribe(
        ({ data }) => {
          const currentVisit = data.results.find(
            visit =>
              dayjs(visit.startDatetime).format("DD-MM-YYYY") ===
              dayjs(new Date()).format("DD-MM-YYYY")
          );
          currentVisit &&
            getStartedVisit.next({
              mode: VisitMode.LOADING,
              visitData: currentVisit,
              status: VisitStatus.ONGOING
            });
        }
      );
      return () => sub && sub.unsubscribe();
    }
  }, [patientUuid]);

  const StartVisitButton: React.FC = () => {
    const { t } = useTranslation();
    return (
      <div>
        <button
          className={styles.startVisitButton}
          data-testid="start-visit"
          onClick={() => {
            openVisitDashboard(`${t("visitDashboard", "Visit Dashboard")}`);
            setVisitStarted(true);
          }}
        >
          {t("startVisit", "Start visit")}
        </button>
      </div>
    );
  };

  const EditVisitButton: React.FC<VisitProps> = ({
    newModalItem,
    patientUuid
  }) => {
    const { t } = useTranslation();
    return (
      selectedVisit && (
        <div className={styles.editContainer}>
          <span>{selectedVisit.visitData.visitType.display}</span>
          <span>
            {`(${dayjs(selectedVisit.visitData.startDatetime).format(
              "YYYY-MM-DD"
            )})`}
          </span>
          {isEmpty(selectedVisit.visitData.stopDatetime) && (
            <button
              className={styles.editVisitButton}
              data-testid="end-visit"
              onClick={() => {
                newModalItem({
                  component: (
                    <EndVisitConfirmation
                      patientUuid={patientUuid}
                      visitData={selectedVisit.visitData}
                      newModalItem={newModalItem}
                    />
                  ),
                  name: "End Visit",
                  props: null
                });
              }}
            >
              {t("end", "End")}
            </button>
          )}
          <svg
            className="omrs-icon"
            onClick={() => {
              newModalItem({
                component: (
                  <CloseActiveVisitConfirmation
                    patientUuid={patientUuid}
                    newModalItem={newModalItem}
                    visitData={getStartedVisit.value.visitData}
                  />
                ),
                name: "Cancel Visit",
                props: null
              });
            }}
          >
            <use xlinkHref="#omrs-icon-close"></use>
          </svg>
        </div>
      )
    );
  };

  return (
    <div className={`${styles.visitButtonContainer}`}>
      {isEmpty(selectedVisit) ? (
        <StartVisitButton />
      ) : (
        <EditVisitButton
          patientUuid={patientUuid}
          newModalItem={newModalItem}
        />
      )}
    </div>
  );
};

const hideModal = (newModalItem: NewModalItem) => {
  newModalItem({ component: null, name: null, props: null });
};

export const StartVisitConfirmation: React.FC<VisitProps> = ({
  newModalItem
}) => {
  const { t } = useTranslation();
  return (
    <div className={styles.visitPromptContainer}>
      <h2>
        {t(
          "startVisitPrompt",
          "No active visit is selected. Do you want to start a visit?"
        )}
      </h2>
      <div className={styles.visitPromptButtonsContainer}>
        <button
          className={`omrs-btn omrs-outlined-action`}
          onClick={() => {
            openVisitDashboard(`${t("visitDashboard", "Visit Dashboard")}`);
            hideModal(newModalItem);
          }}
        >
          {t("yes", "Yes")}
        </button>
        <button
          className={`omrs-btn omrs-outlined-neutral`}
          onClick={() => hideModal(newModalItem)}
        >
          {t("no", "No")}
        </button>
      </div>
    </div>
  );
};

export const CloseActiveVisitConfirmation: React.FC<EndVisitProps> = ({
  visitData,
  newModalItem
}) => {
  const { t } = useTranslation();
  return (
    <div className={styles.visitPromptContainer}>
      <h2>{t("endVisitPrompt", "Are you sure you want to end this visit?")}</h2>
      <p>
        {t("visitType", "Visit Type")}: {visitData.visitType.display}{" "}
        {t("location", "Location")}: {visitData?.location?.display}{" "}
        {t("startDate", "Start Date")}:{" "}
        {dayjs(visitData.startDatetime).format("DD-MMM-YYYY")}
      </p>
      <div className={styles.visitPromptButtonsContainer}>
        <button
          className={`omrs-btn omrs-outlined-action`}
          onClick={() => {
            getStartedVisit.next(null);
            hideModal(newModalItem);
          }}
        >
          {t("yes", "Yes")}
        </button>
        <button
          className={`omrs-btn omrs-outlined-neutral`}
          onClick={() => hideModal(newModalItem)}
        >
          {t("no", "No")}
        </button>
      </div>
    </div>
  );
};

interface EndVisitProps extends VisitProps {
  visitData: Visit;
}

export const EndVisitConfirmation: React.FC<EndVisitProps> = ({
  visitData,
  newModalItem
}) => {
  const { t } = useTranslation();
  return (
    <div className={styles.visitPromptContainer}>
      <h2>{t("endVisitPrompt", "Are you sure you wish to end this visit?")}</h2>
      <p>
        {t("visitType", "Visit Type")}: {visitData.visitType.display}{" "}
        {t("location", "Location")}: {visitData?.location?.display}{" "}
        {t("startDate", "Start Date")}:{" "}
        {dayjs(visitData.startDatetime).format("DD-MMM-YYYY")}
      </p>
      <div className={styles.visitPromptButtonsContainer}>
        <button
          className={`omrs-btn omrs-outlined-action`}
          onClick={() => {
            visitUpdate(visitData);
            hideModal(newModalItem);
          }}
        >
          {t("yes", "Yes")}
        </button>
        <button
          className={`omrs-btn omrs-outlined-neutral`}
          onClick={() => hideModal(newModalItem)}
        >
          {t("no", "No")}
        </button>
      </div>
    </div>
  );
};

function visitUpdate(visitData: Visit) {
  const abortController = new AbortController();

  let payload: UpdateVisitPayload = {
    location: visitData.location.uuid,
    startDatetime: visitData.startDatetime,
    visitType: visitData.visitType.uuid,
    stopDatetime: new Date()
  };

  const sub = updateVisit(visitData.uuid, payload, abortController).subscribe(
    (response: FetchResponse) => {
      response.status === 200 && getStartedVisit.next(null);
    }
  );

  return () => sub && sub.unsubscribe();
}

export default VisitButton;
