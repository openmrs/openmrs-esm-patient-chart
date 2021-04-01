import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import Button from "carbon-components-react/es/components/Button";
import Tag from "carbon-components-react/es/components/Tag";
import TooltipDefination from "carbon-components-react/es/components/TooltipDefinition";
import CaretDown16 from "@carbon/icons-react/es/caret--down/16";
import CaretUp16 from "@carbon/icons-react/es/caret--up/16";
import OverflowMenuVertical24 from "@carbon/icons-react/es/overflow-menu--vertical/24";
import capitalize from "lodash-es/capitalize";
import ContactDetails from "../contact-details/contact-details.component";
import CustomOverflowMenuComponent from "../ui-components/overflow-menu.component";
import styles from "./patient-banner.scss";
import {
  ExtensionSlot,
  age,
  useVisit,
  getStartedVisit,
  VisitItem
} from "@openmrs/esm-framework";
import { useTranslation } from "react-i18next";

interface PatientBannerProps {
  patient: fhir.Patient;
  patientUuid: string;
}

const PatientBanner: React.FC<PatientBannerProps> = ({
  patient,
  patientUuid
}) => {
  const { currentVisit } = useVisit(patientUuid);
  const [showContactDetails, setShowContactDetails] = useState(false);
  const [hasActiveVisit, setActiveVisit] = useState(false);
  const { t } = useTranslation();
  const toggleContactDetails = () => {
    setShowContactDetails(!showContactDetails);
  };

  useEffect(() => {
    if (currentVisit) {
      setActiveVisit(true);
    } else {
      const sub = getStartedVisit.subscribe((visit?: VisitItem) => {
        setActiveVisit(visit !== null);
      });

      return () => sub.unsubscribe();
    }

    // FISHY CODE BELOW!!
    // NEVER (!) ADD A LISTENER IN AN USEFFECT W/O DISPOSING IT!
    // THERE HAS TO BE A BETTER MECHANISM
    // ---
    // window.addEventListener("single-spa:routing-event", (evt: any) => {
    //   const patientChartRegex = `${window.spaBase}/patient/:patient/chart`;
    //   const newRegex = new RegExp(patientChartRegex);

    //   if (!newRegex.test(evt.target.location.pathname)) {
    //     getStartedVisit.next(null);
    //   }
    // });
  }, [currentVisit]);

  return (
    <div className={styles.container}>
      <div className={styles.patientBanner}>
        <div className={styles.patientAvatar}>
          <ExtensionSlot
            extensionSlotName="patient-photo"
            state={{ patientUuid: patient.id }}
          />
        </div>
        <div className={styles.patientInfo}>
          <div className={(styles.row, styles.nameRow)}>
            <div>
              <span className={styles.patientName}>
                {patient.name[0].given.join(" ")} {patient.name[0].family}
              </span>
              {hasActiveVisit && (
                <TooltipDefination
                  align="end"
                  tooltipText={
                    <div className={styles.tooltipPadding}>
                      <h6 style={{ marginBottom: "0.5em" }}>
                        {currentVisit &&
                          currentVisit.visitType &&
                          currentVisit.visitType.name}
                      </h6>
                      <span>
                        <span className={styles.tooltipSmalltext}>
                          Started:{" "}
                        </span>
                        <span>
                          {dayjs(
                            currentVisit && currentVisit.startDatetime
                          ).format("DD - MMM - YYYY @ HH:mm")}
                        </span>
                      </span>
                    </div>
                  }
                >
                  <Tag type="blue">{t("Active Visit", "Active Visit")}</Tag>
                </TooltipDefination>
              )}
            </div>
            <div>
              <CustomOverflowMenuComponent
                menuTitle={
                  <>
                    Actions <OverflowMenuVertical24 />
                  </>
                }
              >
                <ExtensionSlot
                  extensionSlotName="patient-actions-slot"
                  key="patient-actions-slot"
                />
              </CustomOverflowMenuComponent>
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.demographics}>
              <span>{capitalize(patient.gender)}</span> &middot;{" "}
              <span>{age(patient.birthDate)}</span> &middot;{" "}
              <span>{dayjs(patient.birthDate).format("DD - MMM - YYYY")}</span>
            </div>
          </div>
          <div className={styles.row}>
            <span className={styles.identifiers}>
              {patient.identifier.map(i => i.value).join(", ")}
            </span>
            <Button
              kind="ghost"
              renderIcon={showContactDetails ? CaretUp16 : CaretDown16}
              iconDescription="Toggle contact details"
              onClick={toggleContactDetails}
            >
              {showContactDetails
                ? "Hide Contact Details"
                : "Show Contact Details"}
            </Button>
          </div>
        </div>
      </div>
      {showContactDetails && (
        <ContactDetails
          address={patient.address}
          telecom={patient.telecom}
          patientId={patient.id}
        />
      )}
    </div>
  );
};

export default PatientBanner;
