import React from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import ChartWidget from "../../ui-components/chart-widget/chart-widget.component";
import ProgramsLevelTwo from "../../widgets/programs/programs-level-two.component";
import ConditionsDetailedSummary from "../../widgets/conditions/conditions-detailed-summary.component";
import { AllergyOverviewLevelTwo } from "../../widgets/allergies/allergy-card-level-two.component";
import styles from "../../ui-components/chart-widget/chart-widget.css";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function Encounters(props: any) {
  const widgetConfig = {
    name: "encounters",
    defaultTabIndex: 0,
    tabs: [
      {
        name: "Foo",
        component: () => {
          return <Foo />;
        }
      },
      {
        name: "Bar",
        component: () => {
          return <Bar />;
        }
      }
    ]
  };

  function Foo(props) {
    return <div>Foo</div>;
  }

  function Bar(props) {
    return <div>Bar</div>;
  }

  return <ChartWidget {...props} widgetConfig={widgetConfig} />;
}
