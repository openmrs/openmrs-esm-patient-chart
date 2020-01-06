import React from "react";
import { RouteComponentProps } from "react-router";
import styles from "./patient-chart-summary.css";
import DimensionsCard from "./documentation/dimensions-card.component";
import VitalsCard from "./documentation/vitals-card.component";
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
    vitals: VitalsCard,
    heightAndWeight: DimensionsCard,
    medications: MedicationsSummary
  };

  const [widgets, setWidgets] = React.useState([]);
  React.useEffect(() => {
    System.import("@jj-widgets").then(m => {
      console.log(m.widgets);
      setWidgets(m.widgets);
    });
  }, []);

  return (
    <main className="omrs-main-content">
      <div className={styles.patientChartCardsContainer}>
        <div className={styles.patientChartCards}>
          {widgets.length > 0 &&
            widgets.map((r, key) => {
              return <r.root />;
            })}
        </div>
      </div>
    </main>
  );

  /*
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
  */
}

type PatientChartSummaryProps = RouteComponentProps & {};
