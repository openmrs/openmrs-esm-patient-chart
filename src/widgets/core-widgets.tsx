import React from "react";

import Summaries from "../chart-review/summaries/summaries.component";
import Results from "../chart-review/results/results.component";
import Orders from "../chart-review/orders/orders.component";
import Encounters from "../chart-review/encounters/encounters.component";
import Allergies from "../chart-review/allergies/allergies.component";
import Conditions from "../chart-review/conditions/conditions.component";
import Programs from "../chart-review/programs/programs.component";
import HeightAndWeightOverview from "./heightandweight/heightandweight-overview.component";
import VitalsOverview from "./vitals/vitals-overview.component";
import ConditionsOverview from "./conditions/conditions-overview.component";
import AllergyOverview from "./allergies/allergy-overview.component";
import NotesOverview from "./notes/notes-overview.component";
import ProgramsOverview from "./programs/programs-overview.component";
import MedicationsOverview from "./medications/medications-overview.component";

export const coreWidgets: CoreWidgetsType = {
  summariesDashboard: {
    name: "summariesDashboard",
    label: "Summaries",
    path: `/summaries`,
    component: () => {
      return <Summaries />;
    }
  },
  results: {
    name: "results",
    label: "Results",
    path: `/results`,
    component: () => {
      return <Results />;
    }
  },
  orders: {
    name: "orders",
    label: "Orders",
    path: `/orders`,
    component: () => {
      return <Orders />;
    }
  },
  encounters: {
    name: "encounters",
    label: "Encounters",
    path: `/encounters`,
    component: () => {
      return <Encounters />;
    }
  },
  conditions: {
    name: "conditions",
    label: "Conditions",
    path: `/conditions`,
    component: () => {
      return <Conditions />;
    }
  },
  allergies: {
    name: "allergies",
    label: "Allergies",
    path: `/allergies`,
    component: () => {
      return <Allergies />;
    }
  },
  programs: {
    name: "programs",
    label: "Programs",
    path: `/programs`,
    component: () => {
      return <Programs />;
    }
  },
  programsOverview: {
    name: "programsOverview",
    label: "Programs Overview",
    component: () => {
      return <ProgramsOverview />;
    }
  },

  medicationsOverview: {
    name: "medicationsOverview",
    label: "Medications Overview",
    component: () => {
      return <MedicationsOverview />;
    }
  },

  heightAndWeightOverview: {
    name: "heightAndWeightOverview",
    label: "Height and Weight Overview",
    component: () => {
      return <HeightAndWeightOverview />;
    }
  },

  vitalsOverview: {
    name: "vitalsOverview",
    label: "Vitals Overview",
    component: () => {
      return <VitalsOverview />;
    }
  },

  conditionsOverview: {
    name: "conditionsOverview",
    label: "Conditions Overview",
    component: () => {
      return <ConditionsOverview />;
    }
  },

  allergyOverview: {
    name: "allergyOverview",
    label: "Allergy Overview",
    component: () => {
      return <AllergyOverview />;
    }
  },

  notesOverview: {
    name: "notesOverview",
    label: "Notes Overview",
    component: () => {
      return <NotesOverview />;
    }
  }
};

type CoreWidgetsType = {
  [key: string]: CoreWidgetType;
};

type CoreWidgetType = {
  name: string;
  label: string;
  path?: string;
  component: Function;
};
