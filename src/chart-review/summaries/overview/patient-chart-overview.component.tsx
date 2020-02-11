import React from "react";
import { RouteComponentProps } from "react-router";
import styles from "./patient-chart-overview.css";
import HeightAndWeightOverview from "../../../widgets/heightandweight/heightandweight-overview.component";
import VitalsOverview from "../../../widgets/vitals/vitals-overview.component";
import ConditionsOverview from "../../../widgets/conditions/conditions-overview.component";
import AllergyOverview from "../../../widgets/allergies/allergy-overview.component";
import NotesOverview from "../../../widgets/notes/notes-overview.component";
import ProgramsOverview from "../../../widgets/programs/programs-overview.component";
import MedicationsOverview from "../../../widgets/medications/medications-overview.component";

export default function PatientChartOverview(props: PatientChartOverviewProps) {
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
    conditions: ConditionsOverview,
    programs: ProgramsOverview,
    allergies: AllergyOverview,
    notes: NotesOverview,
    vitals: VitalsOverview,
    heightAndWeight: HeightAndWeightOverview,
    medications: MedicationsOverview
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

type PatientChartOverviewProps = RouteComponentProps & {};
