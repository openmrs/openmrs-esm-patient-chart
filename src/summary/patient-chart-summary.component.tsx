import React from "react";
import { RouteComponentProps } from "react-router";
import styles from "./patient-chart-summary.css";
import DimensionsCard from "./documentation/dimensions-card.component";
import VitalsCard from "./documentation/vitals-card.component";
import ConditionsCard from "./history/conditions-card.component";
import AllergyCard from "./history/allergy-card.component";
import NotesCard from "./history/notes-card.component";
import ProgramsCard from "./history/programs/programs-card.component";

export default function PatientChartSummary(props: PatientChartSummaryProps) {
  const config = [
    "conditions",
    "programs",
    "allergies",
    "notes",
    "vitals",
    {
      module: DimensionsCard
    }
  ];

  const coreComponents = {
    conditions: ConditionsCard,
    programs: ProgramsCard,
    allergies: AllergyCard,
    notes: NotesCard,
    vitals: VitalsCard,
    heightAndWeight: DimensionsCard
  };

  return (
    <main className="omrs-main-content">
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
    </main>
  );
}

type PatientChartSummaryProps = RouteComponentProps & {};
