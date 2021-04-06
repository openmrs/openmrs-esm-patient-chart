import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import isEmpty from "lodash-es/isEmpty";
import VisitDashboard from "./visit-dashboard.component";
import styles from "./visit-button.css";
import { useTranslation } from "react-i18next";
import {
  useCurrentPatient,
  newWorkspaceItem,
  FetchResponse,
  getStartedVisit,
  VisitItem,
  VisitMode,
  VisitStatus,
  updateVisit,
  UpdateVisitPayload,
  getVisitsForPatient
} from "@openmrs/esm-framework";

export interface NewModalItem {
  (item: { component: React.ReactNode; name: any; props: any }): void;
}

export interface VisitProps {
  newModalItem: NewModalItem;
}

const VisitButton: React.FC<VisitProps> = ({ newModalItem }) => {
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [, setVisitStarted] = useState<boolean>();
  const [, , patientUuid] = useCurrentPatient();

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

  const EditVisitButton: React.FC<VisitProps> = ({ newModalItem }) => {
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
                    <EndVisit
                      currentVisit={selectedVisit}
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
                    newModalItem={newModalItem}
                    currentVisit={getStartedVisit.value}
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
        <EditVisitButton newModalItem={newModalItem} />
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
  currentVisit,
  newModalItem
}) => {
  const { t } = useTranslation();
  return (
    <div className={styles.visitPromptContainer}>
      <h2>{t("endVisitPrompt", "Are you sure you want to end this visit?")}</h2>
      <p>
        {t("visitType", "Visit Type")}:{" "}
        {currentVisit.visitData.visitType.display} {t("location", "Location")}:{" "}
        {currentVisit.visitData?.location?.display}{" "}
        {t("startDate", "Start Date")}:{" "}
        {dayjs(currentVisit.visitData.startDatetime).format("DD-MMM-YYYY")}
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
  currentVisit: VisitItem;
}

export const EndVisit: React.FC<EndVisitProps> = ({
  currentVisit,
  newModalItem
}) => {
  const { t } = useTranslation();
  return (
    <div className={styles.visitPromptContainer}>
      <h2>{t("endVisitPrompt", "Are you sure you wish to end this visit?")}</h2>
      <p>
        {t("visitType", "Visit Type")}:{" "}
        {currentVisit.visitData.visitType.display} {t("location", "Location")}:{" "}
        {currentVisit.visitData?.location?.display}{" "}
        {t("startDate", "Start Date")}:{" "}
        {dayjs(currentVisit.visitData.startDatetime).format("DD-MMM-YYYY")}
      </p>
      <div className={styles.visitPromptButtonsContainer}>
        <button
          className={`omrs-btn omrs-outlined-action`}
          onClick={() => {
            visitUpdate(currentVisit);
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

export const openVisitDashboard = (componentName: string): void => {
  newWorkspaceItem({
    component: VisitDashboard,
    name: componentName,
    props: {},
    inProgress: false,
    validations: (workspaceTabs: Array<{ component: React.FC }>) =>
      workspaceTabs.findIndex(tab => tab.component === VisitDashboard)
  });
};

const visitUpdate = (currentVisit: VisitItem) => {
  const visitData = currentVisit.visitData;
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
};

export default VisitButton;
