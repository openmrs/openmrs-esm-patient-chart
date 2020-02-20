import { useRouteMatch } from "react-router-dom";
import ChartWidget from "../../ui-components/chart-widget/chart-widget.component";
import React from "react";
import AppointmentsOverview from "../../widgets/appointments/appointments-overview.component";

export default function Appointment(props: any) {
  const match = useRouteMatch();

  const widgetConfig = {
    name: "appointments",
    defaultTabIndex: 0,
    tabs: [
      {
        name: "Overview",
        component: () => {
          return <AppointmentsOverview match={match} />;
        }
      }
    ]
  };

  return <ChartWidget {...props} widgetConfig={widgetConfig} />;
}
