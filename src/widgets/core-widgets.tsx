import React from "react";

import Summaries from "../chart-review/summaries/summaries.component";
import Results from "../chart-review/results/results.component";
import Orders from "../chart-review/orders/orders.component";
import Encounters from "../chart-review/encounters/encounters.component";
import Allergies from "../chart-review/allergies/allergies.component";
import Conditions from "../chart-review/conditions/conditions.component";
import Programs from "../chart-review/programs/programs.component";
import ProgramsOverview from "./programs/programs-overview.component";

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
