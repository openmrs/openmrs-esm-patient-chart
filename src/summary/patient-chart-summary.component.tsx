import React from "react";
import { RouteComponentProps } from "react-router";
import styles from "./patient-chart-summary.css";
import HeightAndWeightBriefDetails from "../widgets/heightandweight/heightandweight-brief-details.component";
import VitalsBriefSummary from "../widgets/vitals/vitals-brief-summary.component";
import ConditionsCard from "../widgets/conditions/conditions-card.component";
import AllergyCard from "../widgets/allergies/allergy-card.component";
import NotesCard from "../widgets/notes/notes-card.component";
import ProgramsCard from "../widgets/programs/programs-card.component";
import MedicationsSummary from "../widgets/medications/medications-summary.component";

export default function PatientChartSummary(props: PatientChartSummaryProps) {
  const config = [
    "conditions",
    "programs",
    "medications",
    "allergies",
    "notes",
    "vitals",
    "heightAndWeight"
  ];

  const coreComponents = {
    conditions: ConditionsCard,
    programs: ProgramsCard,
    allergies: AllergyCard,
    notes: NotesCard,
    vitals: VitalsBriefSummary,
    heightAndWeight: HeightAndWeightBriefDetails,
    medications: MedicationsSummary
  };

  return (
    <div className={styles.patientChartCardsContainer}>
      <div className={styles.patientChartCards}>
        {config.map((widget, index) => {
          let Component;
          if (typeof widget === "string") {
            Component = coreComponents[widget];
          } else {
            Component = widget["module"];
          }

          return <Component props={props.match} key={index} />;
        })}
      </div>
    </div>
  );
}

type PatientChartSummaryProps = RouteComponentProps & {};
