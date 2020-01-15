import React from "react";
import { RouteComponentProps } from "react-router";
import styles from "./patient-chart-summary.css";
import DimensionsCard from "./documentation/dimensions-card.component";
import VitalsCard from "./documentation/vitals-card.component";
import ConditionsCard from "../widgets/conditions/conditions-card.component";
import AllergyCard from "../widgets/allergies/allergy-card.component";
import NotesCard from "../widgets/notes/notes-card.component";
import ProgramsCard from "../widgets/programs/programs-card.component";
import MedicationsSummary from "../widgets//medications/medications-summary.component";
import { showToast } from "@openmrs/esm-styleguide";

export default function PatientChartSummary(props: PatientChartSummaryProps) {
  const [widgets, setWidgets] = React.useState<widgetsType>({
    components: [],
    errors: []
  });

  //const errors = [];
  React.useEffect(() => {
    //an example config as we await for config module to be completed
    const config: configType[] = [
      { name: "conditions" },
      {
        name: "Programs",
        esModule: "@jj-widgets",
        exportName: "programsWidget"
      },
      { name: "conditions" },
      { name: "medications" },
      { name: "allergies" },
      { name: "notes" },
      { name: "vitals" },
      { name: "heightAndWeight" }
    ];

    //an example config as we await for config module to be completed
    const config2: configType[] = [
      { name: "programs" },
      { name: "conditions" },
      { name: "medications" },
      { name: "allergies" },
      { name: "notes" },
      { name: "vitals" },
      { name: "heightAndWeight" }
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

    const modulePromises = [];
    const esModules = [];

    /* A map in which each property points to an array of the widgets the config specifies. 
       The config is organized such that there is one item per widget, not one item per esModule.
       Example: 
       [
          {"@jj-widgets" : ["Programs", "Conditions"]}
       ]
    */
    const moduleWidgetMap = {};

    config.map(c => {
      if (c["esModule"]) {
        if (!esModules.includes(c["esModule"])) {
          esModules.push(c.esModule);
          modulePromises.push(System.import(c.esModule));
          moduleWidgetMap[c.esModule] = [];
        }
        moduleWidgetMap[c.esModule].push(c.name);
      }
    });

    //Promise.allSettled(promises) is not supported within zone.js and so we are using the following reflect to achieve the same
    const reflect = p =>
      p.then(
        value => ({ value, status: "fulfilled" }),
        e => ({ e, status: "rejected" })
      );

    Promise.all(modulePromises.map(reflect)).then(modules => {
      let moduleWidgets = {};
      const widgetsToRender: widgetsType = { errors: [], components: [] };
      const moduleLoadFailures = [];
      modules.map((m, key) => {
        if (m.status === "fulfilled") {
          moduleWidgets = Object.assign(moduleWidgets, m.value.widgets);
        } else {
          moduleLoadFailures.push(esModules[key]);
          widgetsToRender.errors.push({
            esModule: esModules[key],
            reason: `${
              esModules[key]
            } could not be loaded. The following could not be displayed: "${moduleWidgetMap[
              esModules[key]
            ].join(", ")}"`
          });
        }
      });

      config.map(c => {
        if (c.hasOwnProperty("esModule")) {
          if (moduleWidgets.hasOwnProperty(c.exportName)) {
            widgetsToRender.components.push(moduleWidgets[c.exportName].root);
          } else {
            !moduleLoadFailures.includes(c.esModule) &&
              widgetsToRender.errors.push({
                esModule: c.esModule,
                reason: `${c.name} could not be loaded: not found in external library "${c.esModule}"`
              });
          }
        } else {
          widgetsToRender.components.push(coreComponents[c.name]);
        }
      });
      setWidgets(widgetsToRender);
    });
  }, []);

  return (
    <main className="omrs-main-content">
      <div className={styles.patientChartCardsContainer}>
        <div className={styles.patientChartCards}>
          {widgets.components.length > 0 &&
            widgets.components.map((R, key) => {
              return <R key={key} />;
            })}
          {widgets.errors.length > 0 &&
            widgets.errors.map(x => {
              showToast({ description: x.reason });
            })}
        </div>
      </div>
    </main>
  );
}

type PatientChartSummaryProps = RouteComponentProps & {};

type configType = {
  name: string;
  exportName?: string;
  esModule?: string;
};

type widgetsType = {
  components?: any;
  errors?: errorType[];
};

type errorType = {
  esModule: string;
  reason: string;
};
