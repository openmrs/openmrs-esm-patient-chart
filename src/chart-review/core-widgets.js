import React from "react";
import Summaries from "./summaries/summaries.component";
import Results from "./results/results.component";
import Orders from "./orders/orders.component";
import Encounters from "./encounters/encounters.component";
import Allergies from "./allergies/allergies.component";
import Conditions from "./conditions/conditions.component";
import Programs from "./programs/programs.component";
import Appointment from "./appointments/appointments.component";

export const coreWidgets = {
  summaries: {
    name: "summaries",
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
  appointments: {
    name: "appointments",
    label: "Appointments",
    path: `/appointments`,
    component: () => {
      return <Appointment />;
    }
  }
};
