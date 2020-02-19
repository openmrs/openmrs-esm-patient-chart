import React from "react";
import Summaries from "./summaries/summaries.component";
import Results from "./results/results.component";
import Orders from "./orders/orders.component";
import Encounters from "./encounters/encounters.component";
import Allergies from "./allergies/allergies.component";
import Conditions from "./conditions/conditions.component";
import Programs from "./programs/programs.component";

export const coreWidgets = {
  summaries: {
    name: "Summaries",
    path: `summaries`,
    component: () => {
      return <Summaries />;
    }
  },
  results: {
    name: "Results",
    path: `results`,
    component: () => {
      return <Results />;
    }
  },
  orders: {
    name: "Orders",
    path: `orders`,
    component: () => {
      return <Orders />;
    }
  },
  encounters: {
    name: "Encounters",
    path: `encounters`,
    component: () => {
      return <Encounters />;
    }
  },
  conditions: {
    name: "Conditions",
    path: `conditions`,
    component: () => {
      return <Conditions />;
    }
  },
  allergies: {
    name: "Allergies",
    path: `allergies`,
    component: () => {
      return <Allergies />;
    }
  },
  programs: {
    name: "Programs",
    path: `programs`,
    component: () => {
      return <Programs />;
    }
  }
};
